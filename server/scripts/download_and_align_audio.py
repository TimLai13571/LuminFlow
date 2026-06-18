"""
Download narration TTS files and align each clip duration to the storyboard.

Inputs (hard-coded): list of (segment_id, url, target_seconds)
Outputs: public/audio/narration/{segment_id}.mp3 with duration approximately
matching the storyboard target seconds (using ffmpeg `atempo` filter).

Usage:
    python server/scripts/download_and_align_audio.py
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
import urllib.request
from dataclasses import dataclass
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = PROJECT_ROOT / "public" / "audio" / "narration"
FFMPEG_BIN = (
    PROJECT_ROOT
    / "ffmpeg"
    / "ffmpeg-8.1.1-essentials_build"
    / "bin"
    / "ffmpeg.exe"
)
FFPROBE_BIN = (
    PROJECT_ROOT
    / "ffmpeg"
    / "ffmpeg-8.1.1-essentials_build"
    / "bin"
    / "ffprobe.exe"
)


@dataclass(frozen=True)
class Segment:
    sid: str
    url: str
    target_seconds: float


SEGMENTS: list[Segment] = [
    Segment(
        "brand-intro",
        "https://cdn.pika.art/v2/files/agent/9bd59a9b-db0a-4291-9748-d241a1484cb2/minimax-tts-1781700185740.mp3",
        6.0,
    ),
    Segment(
        "dashboard",
        "https://cdn.pika.art/v2/files/agent/83c06c39-e55b-433c-b314-1f7bdd7d0ade/minimax-tts-1781700204835.mp3",
        19.0,
    ),
    Segment(
        "tracemap-objectives",
        "https://cdn.pika.art/v2/files/agent/730e6755-224a-4205-9e2a-8c83b863d648/minimax-tts-1781700203259.mp3",
        18.0,
    ),
    Segment(
        "heatlens",
        "https://cdn.pika.art/v2/files/agent/8f4f70bd-3135-4d20-8dee-3445e3da9169/minimax-tts-1781700203952.mp3",
        15.0,
    ),
    Segment(
        "samplelens",
        "https://cdn.pika.art/v2/files/agent/19eba8a9-8779-496b-b6b9-1203007418c1/minimax-tts-1781700224450.mp3",
        18.0,
    ),
    Segment(
        "pbcview",
        "https://cdn.pika.art/v2/files/agent/78429181-a405-41a3-adea-db8b97640ed1/minimax-tts-1781700224751.mp3",
        17.0,
    ),
    Segment(
        "narrativelens",
        "https://cdn.pika.art/v2/files/agent/cc33df2f-7215-49d6-b855-dbabc050a0e6/minimax-tts-1781700223953.mp3",
        17.0,
    ),
    Segment(
        "impact-simulator",
        "https://cdn.pika.art/v2/files/agent/56607764-1133-4f04-aec3-914c7b643e6e/minimax-tts-1781700246321.mp3",
        18.0,
    ),
    Segment(
        "team-ai",
        "https://cdn.pika.art/v2/files/agent/5fa56360-32ec-4f2e-a046-4950f26e3cf4/minimax-tts-1781700245933.mp3",
        20.0,
    ),
    Segment(
        "integration",
        "https://cdn.pika.art/v2/files/agent/a0eb2c19-c47d-4f1e-847e-c8f04b4f33dc/minimax-tts-1781700245914.mp3",
        14.0,
    ),
    Segment(
        "closing",
        "https://cdn.pika.art/v2/files/agent/9c76e033-1e41-4b24-978d-b258eaf2858c/minimax-tts-1781700246435.mp3",
        18.0,
    ),
]

# Difference smaller than this is considered "good enough" and skipped.
TOLERANCE_SECONDS = 1.0


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _probe_duration(path: Path) -> float:
    """Return the audio duration in seconds via ffprobe."""
    cmd = [
        str(FFPROBE_BIN),
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(path),
    ]
    result = subprocess.run(
        cmd, check=True, capture_output=True, text=True
    )
    return float(result.stdout.strip())


def _build_atempo_chain(ratio: float) -> str:
    """Compose an atempo filter chain that respects ffmpeg's 0.5..2.0 limit.

    The product of all factors equals `ratio`. ratio > 1 speeds up audio
    (shorter); ratio < 1 slows it down (longer).
    """
    if ratio <= 0:
        raise ValueError(f"non-positive ratio: {ratio}")

    factors: list[float] = []
    remaining = ratio
    if remaining > 1.0:
        while remaining > 2.0:
            factors.append(2.0)
            remaining /= 2.0
    elif remaining < 1.0:
        while remaining < 0.5:
            factors.append(0.5)
            remaining /= 0.5
    factors.append(remaining)
    return ",".join(f"atempo={f:.6f}" for f in factors)


def _download(url: str, dest: Path) -> None:
    """Download *url* to *dest* using urllib (no extra dependencies)."""
    req = urllib.request.Request(
        url, headers={"User-Agent": "LuminFlow/1.0"}
    )
    with urllib.request.urlopen(req, timeout=60) as resp, dest.open("wb") as out:
        shutil.copyfileobj(resp, out)


def _align(raw_path: Path, final_path: Path, target: float) -> None:
    """Adjust *raw_path* duration to *target* seconds, write to *final_path*."""
    actual = _probe_duration(raw_path)
    diff = abs(actual - target)
    print(f"    actual={actual:.3f}s target={target:.3f}s diff={diff:.3f}s")

    if diff < TOLERANCE_SECONDS:
        print("    diff < 1s -> copy raw without atempo")
        shutil.copyfile(raw_path, final_path)
        return

    ratio = actual / target  # >1 speeds up to shorten, <1 slows to lengthen
    chain = _build_atempo_chain(ratio)
    print(f"    atempo chain: {chain}")

    cmd = [
        str(FFMPEG_BIN),
        "-y",
        "-i",
        str(raw_path),
        "-filter:a",
        chain,
        str(final_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    new_actual = _probe_duration(final_path)
    print(f"    aligned duration: {new_actual:.3f}s")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    if not FFMPEG_BIN.exists():
        print(f"[FATAL] ffmpeg not found: {FFMPEG_BIN}", file=sys.stderr)
        return 2
    if not FFPROBE_BIN.exists():
        print(f"[FATAL] ffprobe not found: {FFPROBE_BIN}", file=sys.stderr)
        return 2

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for seg in SEGMENTS:
        print(f"[{seg.sid}] downloading...")
        raw_path = OUTPUT_DIR / f"{seg.sid}_raw.mp3"
        final_path = OUTPUT_DIR / f"{seg.sid}.mp3"

        try:
            _download(seg.url, raw_path)
        except Exception as exc:  # noqa: BLE001
            print(f"    download failed: {exc}", file=sys.stderr)
            return 1

        try:
            _align(raw_path, final_path, seg.target_seconds)
        except subprocess.CalledProcessError as exc:
            print(
                f"    ffmpeg align failed: {exc.stderr.decode('utf-8', 'ignore')}",
                file=sys.stderr,
            )
            return 1
        finally:
            try:
                raw_path.unlink(missing_ok=True)
            except OSError:
                pass

    print("\nAll narration audio files ready under:")
    print(f"  {OUTPUT_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
