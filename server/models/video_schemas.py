"""Video pipeline data models for LuminFlow Seedance 2.0 integration."""

from __future__ import annotations

from enum import Enum
from pathlib import Path
from typing import Optional

from pydantic import BaseModel, Field


# ─── Enums ────────────────────────────────────────────────────────────────────


class VideoTaskStatus(str, Enum):
    """Seedance async task lifecycle states."""
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class SceneType(str, Enum):
    """Classification of scene shot types."""
    DIALOGUE_TWO_SHOT = "dialogue_two_shot"   # Two characters in frame
    CLOSEUP = "closeup"                        # Single character closeup
    ATMOSPHERIC = "atmospheric"                # Wide/transition shot
    BRAND_REVEAL = "brand_reveal"              # Logo/title reveal


# ─── Configuration Models ─────────────────────────────────────────────────────


class SceneConfig(BaseModel):
    """Complete configuration for a single video scene generation."""
    scene_id: str = Field(..., description="Unique scene identifier (e.g. 'scene_1')")
    scene_type: SceneType
    order: int = Field(..., description="Playback order (1-based)")
    duration: int = Field(ge=4, le=15, description="Video length in seconds")
    model: str = Field(
        default="doubao-seedance-2-0-260128",
        description="Seedance model ID"
    )
    resolution: str = Field(default="720p", description="Output resolution")
    ratio: str = Field(default="16:9", description="Aspect ratio")
    prompt: str = Field(..., description="English prompt for video generation")
    reference_images: list[str] = Field(default_factory=list, description="HTTPS URLs of reference images")
    generate_audio: bool = Field(default=False, description="Enable native audio generation")
    watermark: bool = Field(default=False, description="Burn watermark into output")
    return_last_frame: bool = Field(default=False)
    subtitles_text: Optional[str] = Field(default=None, description="English dialogue/narration for SRT generation")
    seed: Optional[int] = Field(default=None, description="Reproducibility seed")


class VideoTask(BaseModel):
    """Represents a single Seedance async video generation task."""
    task_id: str = ""
    scene_id: str = ""
    status: VideoTaskStatus = VideoTaskStatus.QUEUED
    video_url: Optional[str] = None
    local_path: Optional[str] = None
    usage_tokens: Optional[int] = None
    error_message: Optional[str] = None
    created_at: Optional[float] = None
    completed_at: Optional[float] = None


class PipelineState(BaseModel):
    """Tracks the full pipeline execution state."""
    phase: str = "initializing"
    reference_images: dict[str, str] = Field(default_factory=dict)
    scenes: dict[str, VideoTask] = Field(default_factory=dict)
    output_path: Optional[str] = None
    errors: list[str] = Field(default_factory=list)
    started_at: Optional[float] = None
    completed_at: Optional[float] = None

    @property
    def all_succeeded(self) -> bool:
        return all(
            task.status == VideoTaskStatus.SUCCEEDED
            for task in self.scenes.values()
        )


# ─── API Models ───────────────────────────────────────────────────────────────


class SeedanceTaskResponse(BaseModel):
    """Response from POST /contents/generations/tasks."""
    id: str


class SeedanceTaskStatus(BaseModel):
    """Response from GET /contents/generations/tasks/{id}."""
    id: str
    status: str
    content: Optional[dict] = None
    usage: Optional[dict] = None
    error: Optional[dict] = None


# ─── Character Specs ──────────────────────────────────────────────────────────


CHARACTER_A_PROMPT = (
    "East Asian male, 30–35 years old, short neat black hair, thin-rimmed silver glasses, "
    "clean-shaven, refined facial features. Wearing dark gray suit jacket, white dress shirt, "
    "simple navy tie. Professional, earnest, slightly concerned expression. "
    "Front-facing chest-up portrait, cinematic soft lighting, neutral corporate background, "
    "photorealistic, 16:9 aspect ratio"
)

CHARACTER_B_PROMPT = (
    "East Asian male, 40–45 years old, short dark hair, mature distinguished face with "
    "slight age lines, no glasses. Wearing charcoal business suit, light blue shirt. "
    "Slightly impatient but restrained expression, subtle frown. "
    "Front-facing chest-up portrait, cinematic soft lighting, neutral corporate background, "
    "photorealistic, 16:9 aspect ratio"
)
