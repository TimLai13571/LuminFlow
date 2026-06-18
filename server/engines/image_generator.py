"""Ark Image Generation Engine — generate character reference images via Ark API.

Priority chain:
  P0: Ark /images/generations endpoint (doubao-seedream-4.5)
  P1: Local pre-saved files (server/data/ref_char_*.png)
  P2: Return None (degrade to text-only video generation)
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# ─── Constants ────────────────────────────────────────────────────────────────

ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
IMAGE_GEN_ENDPOINT = f"{ARK_BASE_URL}/images/generations"
IMAGE_MODEL = "doubao-seedream-4.5"

# Local fallback paths
_DATA_DIR = Path(__file__).parent.parent / "data"
_LOCAL_REF_A = _DATA_DIR / "ref_char_a.png"
_LOCAL_REF_B = _DATA_DIR / "ref_char_b.png"


# ─── Image Generation ─────────────────────────────────────────────────────────


async def _call_ark_image_api(
    prompt: str,
    api_key: str,
    model: str = IMAGE_MODEL,
    size: str = "1792x1024",
) -> str:
    """Call Ark image generation API, return image URL."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            IMAGE_GEN_ENDPOINT,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "prompt": prompt,
                "n": 1,
                "size": size,
                "response_format": "url",
            },
        )
        resp.raise_for_status()
        data = resp.json()

        # Handle various response formats
        if "data" in data and len(data["data"]) > 0:
            item = data["data"][0]
            if isinstance(item, dict):
                return item.get("url", item.get("b64_json", ""))
            return str(item)
        elif "url" in data:
            return data["url"]
        else:
            raise ValueError(f"Unexpected image API response: {data}")


async def _try_local_fallback(filename: str) -> Optional[str]:
    """Try to read a local image file and return it as a file:// URL or path."""
    if filename.exists():
        logger.info("Using local fallback image: %s", filename)
        # Return as file path — caller will need to upload or handle accordingly
        return str(filename.resolve())
    return None


async def generate_character_image(
    prompt: str,
    api_key: Optional[str] = None,
    local_fallback: Optional[Path] = None,
) -> Optional[str]:
    """Generate a single character reference image.

    Args:
        prompt: Image generation prompt.
        api_key: Ark API key. If None, reads from ARK_API_KEY env var.
        local_fallback: Path to local fallback image file.

    Returns:
        HTTPS URL of generated image, local file path, or None if all methods fail.
    """
    key = api_key or os.getenv("ARK_API_KEY", "")

    # P0: Ark image API
    if key and not key.startswith("ark-your_key"):
        try:
            url = await _call_ark_image_api(prompt, key)
            logger.info("Image generated via Ark API: %s", url[:80])
            return url
        except httpx.HTTPStatusError as e:
            logger.warning("Ark image API HTTP error %d: %s", e.response.status_code, e)
        except Exception as e:
            logger.warning("Ark image API failed: %s", e)
    else:
        logger.warning("ARK_API_KEY not configured, skipping Ark image API")

    # P1: Local fallback
    if local_fallback is not None:
        local_url = await _try_local_fallback(local_fallback)
        if local_url:
            return local_url

    # P2: Return None (caller will degrade to text-only video generation)
    logger.warning("All image generation methods failed — will use text-only video mode")
    return None


async def generate_character_images(
    prompt_a: str,
    prompt_b: str,
    api_key: Optional[str] = None,
) -> tuple[Optional[str], Optional[str]]:
    """Generate both character reference images in parallel.

    Returns:
        Tuple of (character_a_url, character_b_url). Each may be None.
    """
    import asyncio

    results = await asyncio.gather(
        generate_character_image(prompt_a, api_key, _LOCAL_REF_A),
        generate_character_image(prompt_b, api_key, _LOCAL_REF_B),
    )
    return results[0], results[1]
