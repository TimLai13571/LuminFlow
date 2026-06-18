"""Impact Simulator Pipeline — COSO 依赖图 BFS 遍历 + 量化影响 + 行动排序"""

from __future__ import annotations

import json
import os
from collections import deque
from pathlib import Path
from typing import Any

import httpx
import yaml

from models.schemas import (
    ComparisonItem,
    GraphLink,
    GraphNode,
    ImpactResult,
    ImpactSimulationRequest,
)

# ─── Load prompt template ────────────────────────────────────────────────────

_TEMPLATE_PATH = Path(__file__).parent.parent / "prompts" / "templates" / "impact.yaml"


def _load_template() -> dict[str, str]:
    with open(_TEMPLATE_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


# ─── COSO Dependency Graph ───────────────────────────────────────────────────

COSO_GRAPH: dict[str, list[str]] = {
    "control_environment": ["risk_assessment", "control_activities"],
    "risk_assessment": ["control_activities", "monitoring"],
    "control_activities": ["information_communication"],
    "information_communication": ["monitoring"],
    "monitoring": ["control_environment"],
}

COSO_LABELS: dict[str, str] = {
    "control_environment": "控制环境",
    "risk_assessment": "风险评估",
    "control_activities": "控制活动",
    "information_communication": "信息与沟通",
    "monitoring": "监控活动",
}

COSO_WEIGHTS: dict[str, float] = {
    "control_environment": 1.0,
    "risk_assessment": 0.9,
    "control_activities": 0.85,
    "information_communication": 0.7,
    "monitoring": 0.8,
}

PROPAGATION_FACTOR = 0.6


# ─── BFS Impact Calculation ──────────────────────────────────────────────────

def _bfs_impact(
    start_nodes: list[str], severity: int
) -> tuple[dict[str, float], dict[str, int]]:
    """BFS traversal of COSO graph calculating impact propagation."""
    impact_scores: dict[str, float] = {}
    levels: dict[str, int] = {}
    visited: set[str] = set()
    queue: deque[tuple[str, float, int]] = deque()

    for node in start_nodes:
        if node in COSO_GRAPH or node in COSO_LABELS:
            initial_impact = severity * COSO_WEIGHTS.get(node, 0.8)
            queue.append((node, initial_impact, 0))
            impact_scores[node] = initial_impact
            levels[node] = 0
            visited.add(node)

    while queue:
        current, current_impact, level = queue.popleft()
        neighbors = COSO_GRAPH.get(current, [])
        for neighbor in neighbors:
            propagated = current_impact * PROPAGATION_FACTOR
            if neighbor not in visited:
                visited.add(neighbor)
                impact_scores[neighbor] = propagated
                levels[neighbor] = level + 1
                queue.append((neighbor, propagated, level + 1))
            elif propagated > impact_scores.get(neighbor, 0):
                impact_scores[neighbor] = propagated

    return impact_scores, levels


# ─── Mock data ───────────────────────────────────────────────────────────────

def _mock_result(request: ImpactSimulationRequest) -> ImpactResult:
    """Generate professional mock based on BFS calculation."""
    # Map affected dimensions to COSO keys
    dimension_map = {
        "控制环境": "control_environment",
        "风险评估": "risk_assessment",
        "控制活动": "control_activities",
        "信息与沟通": "information_communication",
        "监控活动": "monitoring",
    }

    start_nodes = []
    for dim in request.affected_dimensions:
        if dim in dimension_map:
            start_nodes.append(dimension_map[dim])
        elif dim in COSO_GRAPH:
            start_nodes.append(dim)

    if not start_nodes:
        start_nodes = ["control_activities"]

    impact_scores, levels = _bfs_impact(start_nodes, request.severity)

    # Build graph nodes
    nodes = []
    for node_id, label in COSO_LABELS.items():
        nodes.append(
            GraphNode(
                id=node_id,
                label=label,
                category="coso_component",
                impact_score=round(impact_scores.get(node_id, 0), 2),
                level=levels.get(node_id, -1),
            )
        )

    # Build graph links
    links = []
    for source, targets in COSO_GRAPH.items():
        for target in targets:
            weight = impact_scores.get(source, 0) * PROPAGATION_FACTOR
            links.append(
                GraphLink(
                    source=source,
                    target=target,
                    weight=round(weight, 2),
                    label=f"传播影响: {weight:.1f}",
                )
            )

    # Build comparison
    comparison = []
    for node_id, label in COSO_LABELS.items():
        before = round(COSO_WEIGHTS[node_id] * 10, 1)  # baseline score
        impact = impact_scores.get(node_id, 0)
        # After mitigation, reduce impact based on strategy
        strategy_reduction = {"mitigate": 0.4, "accept": 0.0, "transfer": 0.6, "avoid": 0.8}
        reduction = strategy_reduction.get(request.response_strategy, 0.4)
        after = round(before - impact * (1 - reduction), 1)
        after = max(after, 0)
        comparison.append(
            ComparisonItem(
                dimension=label,
                before=before,
                after=after,
                delta=round(after - before, 1),
            )
        )

    recommendations = [
        f"优先处置「{COSO_LABELS.get(start_nodes[0], '控制活动')}」维度，残余风险降幅/成本比最优",
        "建立跨部门应急响应机制，缩短事件响应时间至24小时内",
        "加强自动化监控覆盖，降低人工依赖型控制的传播风险",
        "更新风险登记册，将本次事件影响纳入季度风险评估",
        "建议实施补偿性控制，覆盖传播路径上的薄弱环节",
    ]

    total_impact = sum(impact_scores.values())
    summary = (
        f"事件「{request.event_type}」（严重程度 {request.severity}/10）影响分析完成。"
        f"通过 COSO 依赖图 BFS 遍历，识别到 {len(impact_scores)} 个受影响组件，"
        f"累计影响评分 {total_impact:.1f}。"
        f"采用「{request.response_strategy}」策略后，预计可降低 "
        f"{strategy_reduction.get(request.response_strategy, 0.4)*100:.0f}% 的传播影响。"
    )

    return ImpactResult(
        nodes=nodes,
        links=links,
        comparison=comparison,
        recommendations=recommendations,
        summary=summary,
    )


# ─── LLM Call ────────────────────────────────────────────────────────────────

async def _call_llm(prompt_system: str, prompt_user: str) -> dict[str, Any] | None:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")

    if not api_key:
        return None

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{base_url}/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": prompt_system},
                        {"role": "user", "content": prompt_user},
                    ],
                    "temperature": 0.3,
                    "response_format": {"type": "json_object"},
                },
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)
    except Exception:
        return None


# ─── Public API ──────────────────────────────────────────────────────────────

async def simulate_impact(request: ImpactSimulationRequest) -> ImpactResult:
    """Execute the impact simulation pipeline."""
    template = _load_template()

    prompt_system = template["system_prompt"]
    prompt_user = template["user_template"].format(
        event_type=request.event_type,
        severity=request.severity,
        affected_dimensions=", ".join(request.affected_dimensions),
        response_strategy=request.response_strategy,
    )

    result = await _call_llm(prompt_system, prompt_user)

    if result is None:
        return _mock_result(request)

    try:
        return ImpactResult(
            nodes=[GraphNode(**n) for n in result.get("nodes", [])],
            links=[GraphLink(**l) for l in result.get("links", [])],
            comparison=[ComparisonItem(**c) for c in result.get("comparison", [])],
            recommendations=result.get("recommendations", []),
            summary=result.get("summary", ""),
        )
    except Exception:
        return _mock_result(request)
