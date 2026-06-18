"""Pydantic 2.x schemas for LuminFlow AI Backend."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


# ─── Chat ────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str = Field(..., description="Message role: system/user/assistant")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., description="Conversation messages")
    context: Optional[dict[str, Any]] = Field(default=None, description="Page context data")
    role: str = Field(default="auditor", description="Current user role")


# ─── Risk Analysis ───────────────────────────────────────────────────────────

class RiskArea(BaseModel):
    area: str = Field(..., description="Risk area name")
    likelihood: float = Field(..., ge=0, le=10, description="Likelihood score 0-10")
    impact: float = Field(..., ge=0, le=10, description="Impact score 0-10")
    control_effectiveness: float = Field(..., ge=0, le=1, description="Control effectiveness 0-1")
    residual_risk: float = Field(..., description="Residual risk = likelihood * impact * (1 - control_effectiveness)")
    description: str = Field(default="", description="Risk description")


class RiskAnalysisResult(BaseModel):
    risk_areas: list[RiskArea] = Field(default_factory=list)
    overall_score: float = Field(..., ge=0, le=100, description="Overall risk score")
    recommendations: list[str] = Field(default_factory=list)


# ─── Sampling ────────────────────────────────────────────────────────────────

class SampleSizeRange(BaseModel):
    min: int = Field(..., description="Minimum sample size")
    max: int = Field(..., description="Maximum sample size")


class DocumentDistribution(BaseModel):
    document_type: str = Field(..., description="Document type")
    count: int = Field(..., description="Number of documents")
    priority: str = Field(default="medium", description="Priority: high/medium/low")


class ElevatedControl(BaseModel):
    control_id: str = Field(..., description="Control identifier")
    reason: str = Field(..., description="Reason for elevation")
    original_sample_size: int = Field(default=0)
    elevated_sample_size: int = Field(default=0)


class SamplingPreviewRequest(BaseModel):
    risk_threshold: float = Field(default=5.0, description="Risk threshold for elevation")
    confidence_level: float = Field(default=0.95, description="Confidence level")
    elevation_factor: float = Field(default=1.5, description="Elevation multiplier")


class SamplingPlanResult(BaseModel):
    sample_size_range: SampleSizeRange
    confidence_level: float = Field(..., ge=0, le=1)
    document_distribution: list[DocumentDistribution] = Field(default_factory=list)
    logic_explanation: list[str] = Field(default_factory=list)
    elevated_controls: list[ElevatedControl] = Field(default_factory=list)


# ─── Impact Simulation ───────────────────────────────────────────────────────

class ImpactSimulationRequest(BaseModel):
    event_type: str = Field(..., description="Event type identifier")
    severity: int = Field(..., ge=1, le=10, description="Severity 1-10")
    affected_dimensions: list[str] = Field(default_factory=list, description="Affected COSO dimensions")
    response_strategy: str = Field(default="mitigate", description="Response strategy")


class GraphNode(BaseModel):
    id: str
    label: str
    category: str = Field(default="default")
    impact_score: float = Field(default=0.0)
    level: int = Field(default=0)


class GraphLink(BaseModel):
    source: str
    target: str
    weight: float = Field(default=1.0)
    label: str = Field(default="")


class ComparisonItem(BaseModel):
    dimension: str
    before: float
    after: float
    delta: float


class ImpactResult(BaseModel):
    nodes: list[GraphNode] = Field(default_factory=list)
    links: list[GraphLink] = Field(default_factory=list)
    comparison: list[ComparisonItem] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    summary: str = Field(default="")


# ─── Narrative ───────────────────────────────────────────────────────────────

class NarrativeRequest(BaseModel):
    topic: str = Field(..., description="Communication topic")
    audience: str = Field(..., description="Target audience: CFO/internal_audit/IT")
    findings: list[str] = Field(default_factory=list, description="Audit findings")


class NarrativeResult(BaseModel):
    narrative: str = Field(default="", description="Generated narrative text")
    key_points: list[str] = Field(default_factory=list)
    suggested_actions: list[str] = Field(default_factory=list)
