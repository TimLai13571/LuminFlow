#!/usr/bin/env python3
"""LuminFlow Seedance 2.0 Video Pipeline — Full CLI Orchestrator.

Usage:
    python server/scripts/run_video_pipeline.py

Environment:
    ARK_API_KEY — required, set in .env or environment

Stages:
    Phase 1: Environment check (API key, ffmpeg, directories)
    Phase 2: Generate character reference images (parallel)
    Phase 3: Generate 5 scene videos via Seedance 2.0 API (parallel)
    Phase 4: Download all videos to local storage
    Phase 5: Post-process (SRT → subtitles → concat → BGM mix)
    Phase 6: Validate and save final output
"""

from __future__ import annotations

import asyncio
import logging
import os
import sys
import time
from pathlib import Path
from typing import Optional

# ── Inject local ffmpeg into PATH (portable install, no admin needed) ──
_FFMPEG_BIN = (
    Path(__file__).parent.parent.parent / "ffmpeg"
    / "ffmpeg-8.1.1-essentials_build" / "bin"
)
if _FFMPEG_BIN.exists():
    os.environ["PATH"] = str(_FFMPEG_BIN) + os.pathsep + os.environ.get("PATH", "")

# Ensure server/ is on the Python path
_SERVER_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(_SERVER_DIR))

from dotenv import load_dotenv

from models.video_schemas import (
    SceneConfig,
    SceneType,
    PipelineState,
    CHARACTER_A_PROMPT,
    CHARACTER_B_PROMPT,
)
from engines.image_generator import generate_character_images
from engines.video_generator import generate_all_scenes
from engines.video_postprocessor import (
    check_ffmpeg,
    check_ffprobe,
    concatenate_videos,
    burn_subtitles,
    generate_srt,
    mix_audio,
    get_video_info,
    validate_video,
    normalize_audio_for_concat,
)

# ─── Config ───────────────────────────────────────────────────────────────────

load_dotenv(_SERVER_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("pipeline")

OUTPUT_DIR = _SERVER_DIR / "output"
SCENES_DIR = OUTPUT_DIR / "scenes"
SUBTITLES_DIR = OUTPUT_DIR / "subtitles"
FINAL_OUTPUT = _SERVER_DIR.parent / "docs" / "demo" / "LuminFlow_Promo_720p.mp4"

# ─── Scene Definitions ────────────────────────────────────────────────────────


def build_scenes(
    ref_a: Optional[str] = None,
    ref_b: Optional[str] = None,
) -> list[SceneConfig]:
    """Build all 5 scene configurations with reference images."""
    ref_a_images = [ref_a] if ref_a else []
    ref_b_images = [ref_b] if ref_b else []

    scenes = [
        SceneConfig(
            scene_id="scene_1",
            scene_type=SceneType.DIALOGUE_TWO_SHOT,
            order=1,
            duration=12,
            generate_audio=True,
            reference_images=ref_a_images + ref_b_images,
            prompt=(
                "Asian corporate meeting room, bright and minimalist. White-beige walls, venetian blinds "
                "with sunlight stripes. Two men sit across a dark wood conference table. "
                "The auditor (early 30s, East Asian, short black hair, thin-rimmed glasses, dark gray suit) "
                "spreads paper audit working papers on the table with a concerned but professional expression. "
                "The client (mid-40s, East Asian, dark hair, charcoal suit) frowns while flipping through "
                "a PBC request list, finger pointing at the sampling quantity column. "
                "Both visible in medium shot, facing each other. "
                "KPMG KAEG manual visible on table. Handwritten RCM spreadsheets with annotations. "
                "Natural daylight through blinds creates orderly stripe patterns. "
                "Subdued atmosphere, restrained East Asian corporate etiquette. "
                "No exaggerated gestures. Both characters maintain professional composure."
            ),
            subtitles_text=(
                "This PBC list is impossible. You're asking for every single loan approval from the past year?\n"
                "Our team simply doesn't have the bandwidth to pull all these documents.\n"
                "And this sampling count — 57 approvals? That's excessive. We've never been asked for this many."
            ),
        ),
        SceneConfig(
            scene_id="scene_2a",
            scene_type=SceneType.CLOSEUP,
            order=2,
            duration=8,
            generate_audio=True,
            reference_images=ref_a_images,
            prompt=(
                "Close-up shot of the auditor (same East Asian male, 30s, thin-rimmed glasses, dark gray suit). "
                "He flips through a KAEG audit manual and a handwritten RCM spreadsheet on the table. "
                "His expression shows difficulty but remains professionally restrained — "
                "slight furrowed brow, focused eyes, measured hand gestures. "
                "Papers with visible handwritten annotations and audit notes. "
                "Warm office lighting, shallow depth of field blurring the meeting room background. "
                "Asian corporate meeting room setting. Gestures are minimal and professional."
            ),
            subtitles_text=(
                "I understand your concern. However, under COSO 2013 Framework, we need to validate\n"
                "the completeness of the control sample across all key business cycles.\n"
                "The KAEG manual requires us to test all material approval types."
            ),
        ),
        SceneConfig(
            scene_id="scene_2b",
            scene_type=SceneType.CLOSEUP,
            order=3,
            duration=8,
            generate_audio=True,
            reference_images=ref_b_images,
            prompt=(
                "Close-up shot of the client (same East Asian male, mid-40s, dark hair, charcoal suit). "
                "He shakes his head and waves his hand slightly — restrained, not exaggerated, "
                "reflecting East Asian communication norms of subtle disapproval. "
                "His expression shows dissatisfaction but remains composed and professional. "
                "A cluttered Excel risk matrix spreadsheet is visible on the table before him, "
                "with red-highlighted cells. Warm office lighting, shallow depth of field. "
                "Asian corporate meeting room. The gesture is minimal — a subtle hand wave, "
                "not dramatic. Professional distance maintained."
            ),
            subtitles_text=(
                "But 57 samples? Even for a full-year audit, that seems unreasonable.\n"
                "(Shaking head slightly) We've worked with other audit firms before,\n"
                "and none of them asked for this level of sampling detail."
            ),
        ),
        SceneConfig(
            scene_id="scene_3",
            scene_type=SceneType.ATMOSPHERIC,
            order=4,
            duration=10,
            generate_audio=False,
            reference_images=[],
            prompt=(
                "Slow dolly-out wide shot. The two men sit across the conference table in silence — "
                "the auditor and client facing each other with stacks of audit working papers, manuals, "
                "and spreadsheets between them. Sunlight through venetian blinds creates stripe patterns "
                "across the table and papers. Cups of tea sit neatly beside the documents. "
                "The image gradually darkens and softens slightly, transitioning to a more "
                "contemplative atmospheric tone. Clean, orderly East Asian corporate meeting room. "
                "No dramatic lighting, natural office ambiance. Professional distance. "
                "Subtle camera movement — slow, deliberate pull-back."
            ),
            subtitles_text="But what if there was a smarter way?",
        ),
        SceneConfig(
            scene_id="scene_4",
            scene_type=SceneType.BRAND_REVEAL,
            order=5,
            duration=12,
            generate_audio=False,
            reference_images=[],
            prompt=(
                "Dark screen. A sharp blue beam of light cuts through the darkness from left to right, "
                "elegant and precise. The beam expands and transforms into glowing text — "
                "the word 'LuminFlow' appears full-screen in modern clean sans-serif typography, "
                "radiating soft blue light with subtle white highlights. "
                "Tagline fades in below: 'Audit Transparency, Redefined.' "
                "Clean, minimalist tech aesthetic. The text stabilizes with a gentle glow effect. "
                "Professional corporate branding reveal, no clutter, elegant and impactful. "
                "Deep navy background, electric blue beam and text glow. High-end visual quality."
            ),
            subtitles_text=(
                "LuminFlow.\n"
                "Audit Transparency, Redefined.\n"
                "Intelligent sampling. Real-time collaboration. Complete audit visibility."
            ),
        ),
    ]

    return scenes


# ─── Phase Functions ──────────────────────────────────────────────────────────


async def phase_1_check() -> dict:
    """Environment pre-flight check."""
    logger.info("=" * 60)
    logger.info("Phase 1: Environment Check")
    logger.info("=" * 60)

    results = {
        "api_key_ok": False,
        "ffmpeg_ok": False,
        "ffprobe_ok": False,
        "output_dir_ok": False,
    }

    # Check API key
    api_key = os.getenv("ARK_API_KEY", "")
    if api_key and not api_key.startswith("ark-your_key"):
        results["api_key_ok"] = True
        logger.info("✓ ARK_API_KEY configured")
    else:
        logger.error("✗ ARK_API_KEY not configured (set in .env)")

    # Check ffmpeg
    if check_ffmpeg():
        results["ffmpeg_ok"] = True
        logger.info("✓ ffmpeg available")
    else:
        logger.warning("✗ ffmpeg NOT available — post-processing will be limited")

    if check_ffprobe():
        results["ffprobe_ok"] = True
        logger.info("✓ ffprobe available")
    else:
        logger.warning("✗ ffprobe NOT available")

    # Check output directories
    for d in [OUTPUT_DIR, SCENES_DIR, SUBTITLES_DIR]:
        d.mkdir(parents=True, exist_ok=True)
    FINAL_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    results["output_dir_ok"] = True
    logger.info("✓ Output directories ready")

    # Disk space check
    try:
        import shutil
        usage = shutil.disk_usage(OUTPUT_DIR)
        free_gb = usage.free / (1024**3)
        logger.info("✓ Free disk space: %.1f GB", free_gb)
        if free_gb < 1:
            logger.warning("✗ Low disk space (< 1 GB)")
    except Exception:
        pass

    return results


async def phase_2_images() -> tuple[Optional[str], Optional[str]]:
    """Generate character reference images."""
    logger.info("=" * 60)
    logger.info("Phase 2: Generate Character Reference Images")
    logger.info("=" * 60)

    api_key = os.getenv("ARK_API_KEY")
    ref_a, ref_b = await generate_character_images(
        CHARACTER_A_PROMPT,
        CHARACTER_B_PROMPT,
        api_key,
    )

    if ref_a:
        logger.info("✓ Character A (auditor) image: %s", ref_a[:80])
    else:
        logger.warning("✗ Character A image NOT generated — will use text-only mode")

    if ref_b:
        logger.info("✓ Character B (client) image: %s", ref_b[:80])
    else:
        logger.warning("✗ Character B image NOT generated — will use text-only mode")

    return ref_a, ref_b


async def phase_3_videos(ref_a: Optional[str], ref_b: Optional[str]) -> dict:
    """Generate all 5 scene videos."""
    logger.info("=" * 60)
    logger.info("Phase 3: Generate Scene Videos (Seedance 2.0)")
    logger.info("=" * 60)

    scenes = build_scenes(ref_a, ref_b)
    api_key = os.getenv("ARK_API_KEY")

    results = await generate_all_scenes(scenes, api_key, max_concurrency=3)

    for scene_id, task in results.items():
        if task.status.value == "succeeded":
            logger.info("✓ %s: %s (%.0fs)", scene_id, task.local_path,
                          (task.completed_at or 0) - (task.created_at or 0))
        else:
            logger.error("✗ %s: %s — %s", scene_id, task.status.value, task.error_message)

    return results


async def phase_4_postprocess(video_results: dict) -> Optional[str]:
    """Post-process: SRT → subtitles → concat → BGM."""
    logger.info("=" * 60)
    logger.info("Phase 4: Post-Processing")
    logger.info("=" * 60)

    if not check_ffmpeg():
        logger.error("ffmpeg not available — skipping post-processing")
        logger.error("Install ffmpeg: https://ffmpeg.org/download.html")
        return None

    # Collect succeeded videos in order
    ordered_scenes = [
        ("scene_1", 12.0),
        ("scene_2a", 8.0),
        ("scene_2b", 8.0),
        ("scene_3", 10.0),
        ("scene_4", 12.0),
    ]

    subtitled_paths: list[str] = []

    for scene_id, duration in ordered_scenes:
        task = video_results.get(scene_id)
        if not task or not task.local_path:
            logger.warning("Scene %s not available, skipping", scene_id)
            continue

        # Get subtitle text from scene config
        scenes = build_scenes()
        scene_config = next((s for s in scenes if s.scene_id == scene_id), None)

        if scene_config and scene_config.subtitles_text:
            # Generate SRT
            srt_path = str(SUBTITLES_DIR / f"{scene_id}.srt")
            generate_srt(scene_config.subtitles_text, srt_path, duration)

            # Burn subtitles
            sub_output = str(SCENES_DIR / f"{scene_id}_subtitled.mp4")
            burn_subtitles(task.local_path, srt_path, sub_output)
            subtitled_paths.append(sub_output)
            logger.info("✓ %s: subtitles burned", scene_id)
        else:
            subtitled_paths.append(task.local_path)
            logger.info("✓ %s: no subtitles needed", scene_id)

    if not subtitled_paths:
        logger.error("No videos to concatenate")
        return None

    # Normalize audio: add silent tracks to scenes without audio
    concat_paths = normalize_audio_for_concat(subtitled_paths)
    logger.info("Audio normalized: %d paths", len(concat_paths))

    # Concatenate
    merged_path = str(OUTPUT_DIR / "merged_no_bgm.mp4")
    concatenate_videos(concat_paths, merged_path)
    logger.info("✓ Videos concatenated: %s", merged_path)

    # Mix BGM
    bgm_path = str(_SERVER_DIR / "data" / "bgm.mp3")
    if os.path.exists(bgm_path):
        final_path = str(OUTPUT_DIR / "final_with_bgm.mp4")
        mix_audio(merged_path, bgm_path, final_path, bgm_volume=0.12)
        logger.info("✓ BGM mixed: %s", final_path)
        return final_path
    else:
        logger.warning("BGM file not found at %s — skipping audio mix", bgm_path)
        return merged_path


async def phase_5_validate(final_path: Optional[str]) -> bool:
    """Validate the final output."""
    logger.info("=" * 60)
    logger.info("Phase 5: Validation")
    logger.info("=" * 60)

    if not final_path or not os.path.exists(final_path):
        logger.error("No final video to validate")
        return False

    info = get_video_info(final_path)
    logger.info("Video info: %s", info)

    issues = validate_video(final_path)
    if issues:
        for issue in issues:
            logger.warning("Validation issue: %s", issue)
    else:
        logger.info("✓ All validation checks passed")

    # Copy to final delivery location
    try:
        import shutil
        FINAL_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(final_path, str(FINAL_OUTPUT))
        logger.info("✓ Final video saved to: %s", FINAL_OUTPUT)
    except Exception as e:
        logger.error("Failed to copy final video: %s", e)
        return False

    return True


# ─── Main Pipeline ────────────────────────────────────────────────────────────


async def run() -> int:
    """Execute the complete video generation pipeline."""
    logger.info("🚀 LuminFlow Seedance 2.0 Video Pipeline")
    logger.info("   Model: doubao-seedance-2-0-260128")
    logger.info("   Resolution: 720p | Ratio: 16:9")
    logger.info("   Total target duration: ~50 seconds")
    logger.info("")

    state = PipelineState(started_at=time.time())

    try:
        # Phase 1: Check
        checks = await phase_1_check()
        if not checks["api_key_ok"]:
            logger.error("Cannot proceed without ARK_API_KEY")
            return 1

        # Phase 2: Reference images
        state.phase = "generating_images"
        ref_a, ref_b = await phase_2_images()
        if ref_a:
            state.reference_images["character_a"] = ref_a
        if ref_b:
            state.reference_images["character_b"] = ref_b

        # Phase 3: Generate videos
        state.phase = "generating_videos"
        video_results = await phase_3_videos(ref_a, ref_b)
        state.scenes = {k: v for k, v in video_results.items()}

        if not state.all_succeeded:
            logger.warning("Some scenes failed — proceeding with available videos")

        # Phase 4: Post-process
        state.phase = "postprocessing"
        final_path = await phase_4_postprocess(video_results)
        if final_path:
            state.output_path = final_path

        # Phase 5: Validate
        state.phase = "validating"
        success = await phase_5_validate(final_path)

        state.completed_at = time.time()
        elapsed = state.completed_at - state.started_at
        logger.info("")
        logger.info("=" * 60)
        logger.info("Pipeline complete in %.0f seconds", elapsed)
        logger.info("Output: %s", state.output_path or "N/A")
        logger.info("=" * 60)

        return 0 if success else 1

    except KeyboardInterrupt:
        logger.warning("Pipeline interrupted by user")
        return 130
    except Exception as e:
        logger.exception("Pipeline failed: %s", e)
        state.errors.append(str(e))
        return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(run()))
