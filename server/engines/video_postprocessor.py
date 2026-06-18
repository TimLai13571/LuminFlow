"""Video Post-Processor Engine — ffmpeg-based concatenation, subtitles, and BGM mixing.

All operations use ffmpeg via subprocess for maximum compatibility.
Gracefully degrades if ffmpeg is not installed.
"""

from __future__ import annotations

import logging
import os
import re
import shutil
import subprocess
from pathlib import Path
from typing import Optional

# ── Inject local ffmpeg into PATH (portable install, no admin needed) ──
_FFMPEG_BIN = (
    Path(__file__).parent.parent.parent / "ffmpeg"
    / "ffmpeg-8.1.1-essentials_build" / "bin"
)
if _FFMPEG_BIN.exists():
    os.environ["PATH"] = str(_FFMPEG_BIN) + os.pathsep + os.environ.get("PATH", "")

logger = logging.getLogger(__name__)

# ─── Constants ────────────────────────────────────────────────────────────────

_OUTPUT_DIR = Path(__file__).parent.parent / "output"
_BGM_PATH = Path(__file__).parent.parent / "data" / "bgm.mp3"

# SRT styling — white text with dark outline, centered bottom
SRT_STYLE = (
    "FontName=Arial,FontSize=28,"
    "PrimaryColour=&H00FFFFFF,"
    "OutlineColour=&H00000000,"
    "Outline=2,Shadow=1,"
    "Alignment=2,"  # Bottom-center
    "MarginV=40"
)


# ─── ffmpeg Availability Check ────────────────────────────────────────────────


def check_ffmpeg() -> bool:
    """Check if ffmpeg is available on the system PATH."""
    return shutil.which("ffmpeg") is not None


def check_ffprobe() -> bool:
    """Check if ffprobe is available on the system PATH."""
    return shutil.which("ffprobe") is not None


def has_audio_stream(video_path: str) -> bool:
    """Check if a video file has an audio stream."""
    if not check_ffprobe():
        return False
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0",
         "-show_entries", "stream=codec_type", "-of", "csv=p=0", video_path],
        capture_output=True, text=True,
    )
    return "audio" in result.stdout


def add_silent_audio(video_path: str, output_path: str) -> str:
    """Add a silent AAC audio track to a video that has no audio.

    Required before concatenating videos with mixed audio streams using -c copy.
    """
    if not check_ffmpeg():
        raise RuntimeError("ffmpeg not available — cannot add silent audio")
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
        "-i", video_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        "-map", "1:v", "-map", "0:a",
        output_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Silent audio addition failed: {result.stderr[-200:]}")
    logger.info("Silent audio added: %s", output_path)
    return output_path


def normalize_audio_for_concat(video_paths: list[str]) -> list[str]:
    """Ensure all videos have an audio track for safe -c copy concatenation.

    Videos without audio get a silent AAC track added.
    Returns new list of paths (original or with-silence versions).
    """
    normalized: list[str] = []
    for vp in video_paths:
        if has_audio_stream(vp):
            normalized.append(vp)
        else:
            out = str(Path(vp).with_stem(Path(vp).stem + "_with_silence"))
            try:
                add_silent_audio(vp, out)
                normalized.append(out)
            except Exception:
                logger.warning("Failed to add silent audio to %s, using original", vp)
                normalized.append(vp)
    return normalized


# ─── SRT Subtitle Generation ──────────────────────────────────────────────────


def generate_srt(
    text: str,
    output_path: str,
    duration: float = 8.0,
) -> str:
    """Generate an SRT subtitle file from dialogue text.

    Evenly distributes text lines across the video duration.
    Lines starting with '(' are treated as stage directions and merged.

    Args:
        text: Dialogue text, one sentence per line.
        output_path: Path to write the .srt file.
        duration: Total video duration in seconds.

    Returns:
        Path to the generated SRT file.
    """
    # Split into non-empty lines, merge parenthetical directions
    raw_lines = [l.strip() for l in text.strip().split("\n") if l.strip()]
    lines = _merge_stage_directions(raw_lines)

    if not lines:
        logger.warning("No dialogue lines to subtitle")
        return output_path

    # Calculate timing — distribute lines evenly with 0.3s gaps
    total_gaps = (len(lines) - 1) * 0.3
    available_time = max(duration - total_gaps - 0.5, len(lines) * 1.5)
    time_per_line = available_time / len(lines)

    srt_entries: list[str] = []
    current_start = 0.5  # 0.5s initial offset

    for i, line in enumerate(lines):
        end_time = current_start + time_per_line
        srt_entries.append(
            f"{i + 1}\n"
            f"{_format_timestamp(current_start)} --> {_format_timestamp(end_time)}\n"
            f"{line}\n"
        )
        current_start = end_time + 0.3

    content = "\n".join(srt_entries)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

    logger.info("Generated SRT: %s (%d entries, %.1fs)", output_path, len(lines), duration)
    return output_path


def _merge_stage_directions(lines: list[str]) -> list[str]:
    """Merge parenthetical stage directions with the following dialogue line."""
    merged: list[str] = []
    i = 0
    while i < len(lines):
        if lines[i].startswith("(") and i + 1 < len(lines):
            merged.append(f"{lines[i]} {lines[i+1]}")
            i += 2
        else:
            merged.append(lines[i])
            i += 1
    return merged


def _format_timestamp(seconds: float) -> str:
    """Format seconds as SRT timestamp: HH:MM:SS,mmm"""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


# ─── Video Concatenation ──────────────────────────────────────────────────────


def concatenate_videos(
    video_paths: list[str],
    output_path: str,
) -> str:
    """Concatenate video files using ffmpeg concat demuxer.

    Args:
        video_paths: Ordered list of video file paths.
        output_path: Output MP4 file path.

    Returns:
        Path to the concatenated output file.
    """
    if not check_ffmpeg():
        raise RuntimeError("ffmpeg not available — cannot concatenate videos")

    if len(video_paths) == 1:
        logger.info("Only one video, copying to output")
        shutil.copy2(video_paths[0], output_path)
        return output_path

    # Generate concat file list
    concat_file = str(Path(output_path).with_suffix(".txt"))
    with open(concat_file, "w", encoding="utf-8") as f:
        for vp in video_paths:
            # Use forward slashes for ffmpeg cross-platform compatibility
            f.write(f"file '{vp.replace(chr(92), '/')}'\n")

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_file,
        "-c", "copy",
        output_path,
    ]

    logger.info("Concatenating %d videos → %s", len(video_paths), output_path)
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        logger.error("ffmpeg concat failed:\n%s", result.stderr)
        raise RuntimeError(f"Video concatenation failed: {result.stderr[-200:]}")

    # Cleanup concat file
    try:
        os.remove(concat_file)
    except OSError:
        pass

    logger.info("Concatenation complete: %s", output_path)
    return output_path


# ─── Subtitle Burning ─────────────────────────────────────────────────────────


def burn_subtitles(
    video_path: str,
    srt_path: str,
    output_path: str,
) -> str:
    """Burn subtitles into the video using ffmpeg subtitles filter.

    Args:
        video_path: Input video file.
        srt_path: SRT subtitle file path.
        output_path: Output video file path.

    Returns:
        Path to the output video with burned-in subtitles.
    """
    if not check_ffmpeg():
        raise RuntimeError("ffmpeg not available — cannot burn subtitles")

    # Escape backslashes and colons in Windows paths for ffmpeg filter
    # Use single backslash to escape colon (ffmpeg filter syntax)
    srt_escaped = srt_path.replace("\\", "/").replace(":", "\\:")

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", f"subtitles='{srt_escaped}':force_style='{SRT_STYLE}'",
        "-c:a", "copy",
        output_path,
    ]

    logger.info("Burning subtitles: %s + %s → %s", video_path, srt_path, output_path)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        logger.error("ffmpeg subtitles failed:\n%s", result.stderr)
        raise RuntimeError(f"Subtitle burning failed: {result.stderr[-200:]}")

    logger.info("Subtitles burned: %s", output_path)
    return output_path


# ─── Audio Mixing ─────────────────────────────────────────────────────────────


def mix_audio(
    video_path: str,
    bgm_path: Optional[str] = None,
    output_path: Optional[str] = None,
    bgm_volume: float = 0.12,
) -> str:
    """Mix background music into the video at low volume.

    Args:
        video_path: Input video file with existing audio track.
        bgm_path: Path to BGM audio file (MP3/WAV). Falls back to server/data/bgm.mp3.
        output_path: Output path. Defaults to video_path with '_mixed' suffix.
        bgm_volume: BGM volume ratio (0.0-1.0). Default 0.12 (12%).

    Returns:
        Path to the output video with mixed audio.
    """
    if not check_ffmpeg():
        raise RuntimeError("ffmpeg not available — cannot mix audio")

    bgm = bgm_path or str(_BGM_PATH)
    if not os.path.exists(bgm):
        logger.warning("BGM file not found: %s — skipping audio mix", bgm)
        return video_path

    out = output_path or str(Path(video_path).with_stem(
        Path(video_path).stem + "_mixed"
    ))

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", bgm,
        "-filter_complex",
        f"[1:a]volume={bgm_volume}[bgm];[0:a][bgm]amix=inputs=2:duration=first:dropout_transition=2[aout]",
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "copy",
        "-shortest",
        out,
    ]

    logger.info("Mixing BGM (volume=%.0f%%): %s + %s → %s",
                 bgm_volume * 100, video_path, bgm, out)

    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        logger.error("ffmpeg audio mix failed:\n%s", result.stderr)
        raise RuntimeError(f"Audio mixing failed: {result.stderr[-200:]}")

    logger.info("Audio mix complete: %s", out)
    return out


# ─── Video Info ───────────────────────────────────────────────────────────────


def get_video_info(video_path: str) -> dict:
    """Get video metadata using ffprobe.

    Returns:
        Dict with keys: duration, width, height, codec, file_size_mb.
    """
    if not check_ffprobe():
        logger.warning("ffprobe not available")
        return {}

    info: dict = {}

    # Duration
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries",
             "format=duration", "-of", "default=noprint_wrappers=1:nokey=1",
             video_path],
            capture_output=True, text=True, check=True,
        )
        info["duration"] = float(result.stdout.strip())
    except Exception:
        pass

    # Resolution
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "v:0",
             "-show_entries", "stream=width,height",
             "-of", "csv=s=x:p=0", video_path],
            capture_output=True, text=True, check=True,
        )
        parts = result.stdout.strip().split("x")
        if len(parts) == 2:
            info["width"] = int(parts[0])
            info["height"] = int(parts[1])
    except Exception:
        pass

    # File size
    try:
        info["file_size_mb"] = os.path.getsize(video_path) / (1024 * 1024)
    except OSError:
        pass

    return info


def validate_video(
    video_path: str,
    expected_duration_min: float = 48.0,
    expected_duration_max: float = 52.0,
    expected_width: int = 1280,
    expected_height: int = 720,
) -> list[str]:
    """Validate a video file meets quality requirements.

    Returns:
        List of validation issues (empty list = all good).
    """
    issues: list[str] = []

    if not os.path.exists(video_path):
        return [f"File not found: {video_path}"]

    info = get_video_info(video_path)
    if not info:
        return ["Cannot read video metadata (ffprobe missing?)"]

    dur = info.get("duration")
    if dur is not None:
        if dur < expected_duration_min:
            issues.append(f"Duration too short: {dur:.1f}s < {expected_duration_min}s")
        elif dur > expected_duration_max:
            issues.append(f"Duration too long: {dur:.1f}s > {expected_duration_max}s")

    w = info.get("width")
    h = info.get("height")
    if w is not None and h is not None:
        if w < expected_width or h < expected_height:
            issues.append(f"Resolution low: {w}x{h} < {expected_width}x{expected_height}")

    size_mb = info.get("file_size_mb", 0)
    if size_mb < 1:
        issues.append(f"File too small: {size_mb:.1f} MB")

    return issues
