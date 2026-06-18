#!/usr/bin/env python3
"""Generate only missing scenes (scene_1, scene_4) for the LuminFlow pipeline."""

import asyncio
import logging
import os
import sys
from pathlib import Path

_SERVER_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(_SERVER_DIR))

from dotenv import load_dotenv
load_dotenv(_SERVER_DIR / ".env")

from models.video_schemas import SceneConfig, SceneType
from engines.video_generator import generate_scene

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("gen_missing")

SCENE_1 = SceneConfig(
    scene_id="scene_1",
    scene_type=SceneType.DIALOGUE_TWO_SHOT,
    order=1,
    duration=12,
    generate_audio=True,
    reference_images=[],
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
)

SCENE_4 = SceneConfig(
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
)


async def main():
    api_key = os.getenv("ARK_API_KEY")
    scenes = [SCENE_1, SCENE_4]

    for scene in scenes:
        logger.info("=" * 50)
        logger.info(f"Generating {scene.scene_id} (duration={scene.duration}s, audio={scene.generate_audio})")
        try:
            result = await generate_scene(scene, api_key)
            logger.info(f"✓ {scene.scene_id}: {result.status.value} → {result.local_path}")
        except Exception as e:
            logger.error(f"✗ {scene.scene_id} FAILED: {e}")

    logger.info("Done!")


if __name__ == "__main__":
    asyncio.run(main())
