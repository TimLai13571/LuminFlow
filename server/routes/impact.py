"""Impact route — POST /api/impact/simulate"""

from __future__ import annotations

from fastapi import APIRouter

from engines.impact_simulator import simulate_impact
from models.schemas import ImpactResult, ImpactSimulationRequest

router = APIRouter()


@router.post("/api/impact/simulate", response_model=ImpactResult)
async def impact_simulate(request: ImpactSimulationRequest):
    """Simulate impact propagation across COSO framework."""
    result = await simulate_impact(request)
    return result
