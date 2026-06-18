"""Sampling route — POST /api/sampling/preview"""

from __future__ import annotations

from fastapi import APIRouter

from engines.sample_recommender import recommend_sampling
from models.schemas import SamplingPlanResult, SamplingPreviewRequest

router = APIRouter()


@router.post("/api/sampling/preview", response_model=SamplingPlanResult)
async def sampling_preview(request: SamplingPreviewRequest):
    """Generate audit sampling plan preview."""
    result = await recommend_sampling(
        risk_threshold=request.risk_threshold,
        confidence_level=request.confidence_level,
        elevation_factor=request.elevation_factor,
    )
    return result
