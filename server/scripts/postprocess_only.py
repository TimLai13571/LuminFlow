#!/usr/bin/env python3
"""Post-process the 5 LuminFlow video scenes: SRT → subtitles → concat → BGM → final output."""

import logging
import os
import sys
from pathlib import Path

# ── Add ffmpeg to PATH FIRST ──
_FFMPEG_BIN = r"E:\Hackathon\LuminFlow\ffmpeg\ffmpeg-8.1.1-essentials_build\bin"
os.environ["PATH"] = _FFMPEG_BIN + os.pathsep + os.environ.get("PATH", "")

_SERVER_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(_SERVER_DIR))

from engines.video_postprocessor import (
    check_ffmpeg,
    check_ffprobe,
    generate_srt,
    burn_subtitles,
    concatenate_videos,
    mix_audio,
    get_video_info,
    validate_video,
)

import subprocess
import shutil

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("postprocess")

# ── Paths ──
SCENES_DIR = _SERVER_DIR / "output" / "scenes"
SUBTITLES_DIR = _SERVER_DIR / "output" / "subtitles"
OUTPUT_DIR = _SERVER_DIR / "output"
BGM_PATH = _SERVER_DIR / "data" / "bgm.mp3"
FINAL_OUTPUT = _SERVER_DIR.parent / "docs" / "demo" / "LuminFlow_Promo_720p.mp4"

# ── Subtitle texts for each scene (from build_scenes) ──
SUBTITLE_TEXTS = {
    "scene_1": (
        "This PBC list is impossible. You're asking for every single loan approval from the past year?\n"
        "Our team simply doesn't have the bandwidth to pull all these documents.\n"
        "And this sampling count — 57 approvals? That's excessive. We've never been asked for this many."
    ),
    "scene_2a": (
        "I understand your concern. However, under COSO 2013 Framework, we need to validate\n"
        "the completeness of the control sample across all key business cycles.\n"
        "The KAEG manual requires us to test all material approval types."
    ),
    "scene_2b": (
        "But 57 samples? Even for a full-year audit, that seems unreasonable.\n"
        "(Shaking head slightly) We've worked with other audit firms before,\n"
        "and none of them asked for this level of sampling detail."
    ),
    "scene_3": "But what if there was a smarter way?",
    "scene_4": (
        "LuminFlow.\n"
        "Audit Transparency, Redefined.\n"
        "Intelligent sampling. Real-time collaboration. Complete audit visibility."
    ),
}

# ── Scene order and durations ──
SCENE_ORDER = [
    ("scene_1", 12.0),
    ("scene_2a", 8.0),
    ("scene_2b", 8.0),
    ("scene_3", 10.0),
    ("scene_4", 12.0),
]


def add_silent_audio(video_path: str, output_path: str) -> str:
    """Add a silent audio track to a video that has no audio."""
    logger.info("Adding silent audio to %s", video_path)
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
        logger.error("Failed to add silent audio:\n%s", result.stderr[-300:])
        raise RuntimeError(f"Silent audio addition failed")
    logger.info("Silent audio added: %s", output_path)
    return output_path


def has_audio_stream(video_path: str) -> bool:
    """Check if a video file has an audio stream."""
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "a:0",
        "-show_entries", "stream=codec_type",
        "-of", "csv=p=0",
        video_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return "audio" in result.stdout


def main():
    # 0. Check ffmpeg
    if not check_ffmpeg():
        logger.error("ffmpeg not found! Exiting.")
        return 1
    logger.info("✓ ffmpeg available")

    # Ensure output dirs exist
    for d in [SUBTITLES_DIR, OUTPUT_DIR]:
        d.mkdir(parents=True, exist_ok=True)
    FINAL_OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    # 1. Generate SRT + burn subtitles for each scene
    subtitled_paths = []

    for scene_id, duration in SCENE_ORDER:
        video_path = SCENES_DIR / f"{scene_id}.mp4"
        if not video_path.exists():
            logger.warning("Scene %s not found at %s — skipping", scene_id, video_path)
            continue

        subtitle_text = SUBTITLE_TEXTS.get(scene_id)
        if subtitle_text:
            # Generate SRT
            srt_path = str(SUBTITLES_DIR / f"{scene_id}.srt")
            generate_srt(subtitle_text, srt_path, duration)
            logger.info("✓ %s: SRT generated (%s)", scene_id, srt_path)

            # Burn subtitles
            sub_output = str(SCENES_DIR / f"{scene_id}_subtitled.mp4")
            try:
                burn_subtitles(str(video_path), srt_path, sub_output)
                subtitled_paths.append(sub_output)
                logger.info("✓ %s: subtitles burned → %s", scene_id, sub_output)
            except Exception as e:
                logger.error("✗ %s: subtitle burning failed: %s", scene_id, e)
                # Fall back to original video
                subtitled_paths.append(str(video_path))
                logger.warning("  Using original video without subtitles for %s", scene_id)
        else:
            subtitled_paths.append(str(video_path))
            logger.info("✓ %s: no subtitles needed", scene_id)

    logger.info("Subtitled paths: %d/%d", len(subtitled_paths), len(SCENE_ORDER))

    if not subtitled_paths:
        logger.error("No videos available for concatenation")
        return 1

    # 1.5 Normalize audio: add silent audio to videos without audio track
    normalized_paths = []
    for i, vp in enumerate(subtitled_paths):
        if has_audio_stream(vp):
            normalized_paths.append(vp)
            logger.info("  [%d] %s: has audio ✓", i+1, Path(vp).name)
        else:
            norm_path = str(Path(vp).with_stem(Path(vp).stem + "_with_silence"))
            try:
                add_silent_audio(vp, norm_path)
                normalized_paths.append(norm_path)
                logger.info("  [%d] %s: silent audio added ✓", i+1, Path(vp).name)
            except Exception as e:
                logger.warning("  [%d] %s: failed to add silent audio, using original: %s", i+1, Path(vp).name, e)
                normalized_paths.append(vp)

    # 2. Concatenate all videos
    merged_path = str(OUTPUT_DIR / "merged_no_bgm.mp4")
    logger.info("Concatenating %d videos...", len(normalized_paths))
    concatenate_videos(normalized_paths, merged_path)
    logger.info("✓ Merged video: %s", merged_path)

    # Verify merged video
    merged_info = get_video_info(merged_path)
    logger.info("Merged video info: %s", merged_info)

    # 3. Mix BGM
    if BGM_PATH.exists():
        final_path = str(OUTPUT_DIR / "final_with_bgm.mp4")
        mix_audio(merged_path, str(BGM_PATH), final_path, bgm_volume=0.12)
        logger.info("✓ BGM mixed: %s", final_path)
    else:
        logger.warning("BGM not found at %s — skipping audio mix", BGM_PATH)
        final_path = merged_path

    # 4. Copy to final delivery location
    import shutil
    shutil.copy2(final_path, str(FINAL_OUTPUT))
    logger.info("✓ Final video saved to: %s", FINAL_OUTPUT)

    # 5. Validate
    logger.info("=" * 50)
    logger.info("Validation:")
    final_info = get_video_info(str(FINAL_OUTPUT))
    logger.info("Final video info: %s", final_info)

    issues = validate_video(str(FINAL_OUTPUT))
    if issues:
        for issue in issues:
            logger.warning("⚠ %s", issue)
    else:
        logger.info("✓ All validation checks passed")

    file_size_mb = os.path.getsize(str(FINAL_OUTPUT)) / (1024 * 1024)
    logger.info("File size: %.1f MB", file_size_mb)
    logger.info("=" * 50)
    logger.info("🎬 Post-processing complete!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
