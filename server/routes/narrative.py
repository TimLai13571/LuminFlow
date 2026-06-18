"""Narrative route — POST /api/narrative/generate"""

from __future__ import annotations

from fastapi import APIRouter

from engines.narrative_generator import generate_narrative
from models.schemas import NarrativeRequest, NarrativeResult

router = APIRouter()


@router.post("/api/narrative/generate", response_model=NarrativeResult)
async def narrative_generate(request: NarrativeRequest):
    """Generate audience-adapted narrative from audit findings."""
    result = await generate_narrative(request)
    return result
