"""Seedance 2.0 Video Generation Engine — direct Ark API integration.

Core workflow:
  1. POST /contents/generations/tasks → task_id
  2. Poll GET /contents/generations/tasks/{task_id} until succeeded/failed
  3. Download video_url to local storage

Uses tenacity for exponential backoff retry. No Pika MCP dependency.
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
from pathlib import Path
from typing import Optional

import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)

from models.video_schemas import (
    SceneConfig,
    VideoTask,
    VideoTaskStatus,
    SeedanceTaskResponse,
    SeedanceTaskStatus,
)

logger = logging.getLogger(__name__)

# ─── Constants ────────────────────────────────────────────────────────────────

ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
TASKS_ENDPOINT = f"{ARK_BASE_URL}/contents/generations/tasks"
MODEL_STANDARD = "doubao-seedance-2-0-260128"
MODEL_FAST = "doubao-seedance-2-0-fast-260128"

# Polling config
POLL_INITIAL = 10       # Initial poll interval (seconds)
POLL_MAX = 60           # Maximum poll interval (seconds)
POLL_BACKOFF = 2.0      # Exponential backoff multiplier
TOTAL_TIMEOUT = 900     # Total timeout per task (15 minutes)
MAX_RETRIES = 3         # Max retries on task failure

# Output directory for downloaded videos
_OUTPUT_DIR = Path(__file__).parent.parent / "output" / "scenes"


# ─── Custom Exceptions ────────────────────────────────────────────────────────


class VideoGenerationError(Exception):
    """Base exception for video generation failures."""


class TaskTimeoutError(VideoGenerationError):
    """Task exceeded total timeout."""


class TaskFailedError(VideoGenerationError):
    """Task ended in failed/expired/cancelled state."""


# ─── Low-level API Calls ──────────────────────────────────────────────────────


async def _create_task(
    scene: SceneConfig,
    api_key: str,
    client: httpx.AsyncClient,
) -> str:
    """POST a video generation task to Seedance API. Returns task_id."""
    # Build content array
    content: list[dict] = [
        {"type": "text", "text": scene.prompt}
    ]

    # Add reference images with role tags
    for i, img_url in enumerate(scene.reference_images):
        content.append({
            "type": "image_url",
            "image_url": {"url": img_url},
            "role": "reference_image",
        })

    payload: dict = {
        "model": scene.model,
        "content": content,
        "resolution": scene.resolution,
        "ratio": scene.ratio,
        "duration": scene.duration,
        "generate_audio": scene.generate_audio,
        "watermark": scene.watermark,
        "return_last_frame": scene.return_last_frame,
    }

    if scene.seed is not None:
        payload["seed"] = scene.seed

    logger.info("Creating task for %s (duration=%ds, audio=%s)",
                 scene.scene_id, scene.duration, scene.generate_audio)

    resp = await client.post(
        TASKS_ENDPOINT,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json=payload,
    )
    resp.raise_for_status()
    task_resp = SeedanceTaskResponse(**resp.json())
    logger.info("Task created: %s → %s", scene.scene_id, task_resp.id)
    return task_resp.id


async def _query_task(
    task_id: str,
    api_key: str,
    client: httpx.AsyncClient,
) -> SeedanceTaskStatus:
    """GET task status from Seedance API."""
    resp = await client.get(
        f"{TASKS_ENDPOINT}/{task_id}",
        headers={"Authorization": f"Bearer {api_key}"},
    )
    resp.raise_for_status()
    return SeedanceTaskStatus(**resp.json())


async def _download_video(
    video_url: str,
    output_path: str,
    client: httpx.AsyncClient,
) -> str:
    """Download video from Seedance URL to local path. Returns local path."""
    logger.info("Downloading video to %s", output_path)

    async with client.stream("GET", video_url) as resp:
        resp.raise_for_status()

        with open(output_path, "wb") as f:
            async for chunk in resp.aiter_bytes(chunk_size=8192):
                f.write(chunk)

    file_size = os.path.getsize(output_path)
    logger.info("Downloaded %s (%.1f MB)", output_path, file_size / (1024 * 1024))
    return output_path


# ─── Core: Generate Scene ─────────────────────────────────────────────────────


@retry(
    stop=stop_after_attempt(MAX_RETRIES),
    wait=wait_exponential(multiplier=1, min=POLL_INITIAL, max=POLL_MAX),
    retry=retry_if_exception_type((TaskFailedError, TaskTimeoutError)),
    before_sleep=before_sleep_log(logger, logging.WARNING),
)
async def generate_scene(
    scene: SceneConfig,
    api_key: Optional[str] = None,
) -> VideoTask:
    """Generate a single video scene via Seedance 2.0 API.

    Full lifecycle: create task → poll until terminal state → download video.

    Args:
        scene: SceneConfig with prompt, reference images, and params.
        api_key: Ark API key. Reads from ARK_API_KEY env var if None.

    Returns:
        VideoTask with status, video_url, and local_path populated.

    Raises:
        TaskTimeoutError: Task exceeded TOTAL_TIMEOUT.
        TaskFailedError: Task ended in non-success terminal state.
    """
    key = api_key or os.getenv("ARK_API_KEY", "")
    if not key:
        raise VideoGenerationError("ARK_API_KEY not configured")

    created_at = time.time()
    video_task = VideoTask(
        scene_id=scene.scene_id,
        status=VideoTaskStatus.QUEUED,
        created_at=created_at,
    )

    async with httpx.AsyncClient(timeout=60.0) as client:
        # Step 1: Create task
        task_id = await _create_task(scene, key, client)
        video_task.task_id = task_id

        # Step 2: Poll until terminal state
        delay = POLL_INITIAL
        start_time = time.time()

        while True:
            elapsed = time.time() - start_time
            if elapsed > TOTAL_TIMEOUT:
                raise TaskTimeoutError(
                    f"Scene {scene.scene_id} (task {task_id}) "
                    f"timed out after {TOTAL_TIMEOUT}s"
                )

            status = await _query_task(task_id, key, client)
            logger.debug("Scene %s: status=%s (elapsed %.0fs)",
                          scene.scene_id, status.status, elapsed)

            if status.status == "succeeded":
                video_url = status.content.get("video_url") if status.content else None
                if not video_url:
                    raise TaskFailedError(
                        f"Scene {scene.scene_id}: succeeded but no video_url"
                    )

                video_task.status = VideoTaskStatus.SUCCEEDED
                video_task.video_url = video_url
                video_task.usage_tokens = (
                    status.usage.get("total_tokens") if status.usage else None
                )
                video_task.completed_at = time.time()

                # Step 3: Download video immediately (URL expires in 24h)
                output_path = _OUTPUT_DIR / f"{scene.scene_id}.mp4"
                _OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
                await _download_video(video_url, str(output_path), client)
                video_task.local_path = str(output_path)

                logger.info("Scene %s completed: %s (tokens=%s, %.0fs)",
                             scene.scene_id, output_path.name,
                             video_task.usage_tokens,
                             video_task.completed_at - video_task.created_at)
                return video_task

            elif status.status in ("failed", "expired", "cancelled"):
                error_msg = ""
                if status.error:
                    error_msg = f"{status.error.get('code', '')}: {status.error.get('message', '')}"
                raise TaskFailedError(
                    f"Scene {scene.scene_id} (task {task_id}): "
                    f"status={status.status} {error_msg}"
                )

            # Still queued or running — wait and retry
            await asyncio.sleep(delay)
            delay = min(delay * POLL_BACKOFF, POLL_MAX)

    # Should not reach here due to retry decorator
    raise TaskTimeoutError(f"Scene {scene.scene_id}: unexpected exit from poll loop")


# ─── Batch Generation ─────────────────────────────────────────────────────────


async def generate_all_scenes(
    scenes: list[SceneConfig],
    api_key: Optional[str] = None,
    max_concurrency: int = 3,
) -> dict[str, VideoTask]:
    """Generate multiple scenes with concurrency control.

    Args:
        scenes: List of SceneConfig objects.
        api_key: Ark API key.
        max_concurrency: Maximum parallel Seedance tasks.

    Returns:
        Dict mapping scene_id → VideoTask.
    """
    semaphore = asyncio.Semaphore(max_concurrency)

    async def _generate_with_limit(scene: SceneConfig) -> VideoTask:
        async with semaphore:
            return await generate_scene(scene, api_key)

    logger.info("Generating %d scenes (max concurrency=%d)", len(scenes), max_concurrency)
    tasks = [_generate_with_limit(scene) for scene in scenes]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    output: dict[str, VideoTask] = {}
    for scene, result in zip(scenes, results):
        if isinstance(result, Exception):
            logger.error("Scene %s failed: %s", scene.scene_id, result)
            output[scene.scene_id] = VideoTask(
                scene_id=scene.scene_id,
                status=VideoTaskStatus.FAILED,
                error_message=str(result),
            )
        else:
            output[scene.scene_id] = result

    succeeded = sum(1 for t in output.values() if t.status == VideoTaskStatus.SUCCEEDED)
    logger.info("Batch complete: %d/%d succeeded", succeeded, len(scenes))
    return output
