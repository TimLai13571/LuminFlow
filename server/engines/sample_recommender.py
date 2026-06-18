"""Sample Recommender Pipeline — 条件分支：控制属性→样本量→文档预测→PBC"""

from __future__ import annotations

import json
import math
import os
from pathlib import Path
from typing import Any

import httpx
import yaml

from models.schemas import (
    DocumentDistribution,
    ElevatedControl,
    SampleSizeRange,
    SamplingPlanResult,
)

# ─── Load prompt template ────────────────────────────────────────────────────

_TEMPLATE_PATH = Path(__file__).parent.parent / "prompts" / "templates" / "sampling.yaml"


def _load_template() -> dict[str, str]:
    with open(_TEMPLATE_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


# ─── Sample size calculation logic ──────────────────────────────────────────

# Baseline sample sizes by control frequency
_FREQUENCY_BASE: dict[str, tuple[int, int]] = {
    "daily": (25, 40),
    "weekly": (5, 9),
    "monthly": (2, 4),
    "quarterly": (2, 2),
    "annually": (1, 1),
}

# Multiplier for manual vs automated
_TYPE_MULTIPLIER: dict[str, float] = {
    "manual": 1.0,
    "automated": 0.4,
    "it_dependent_manual": 0.7,
}


def _calculate_sample_size(
    frequency: str,
    run_type: str,
    prior_deficiency: bool,
    rawtc_score: float,
    elevation_factor: float,
    risk_threshold: float,
) -> tuple[int, int, bool]:
    """Calculate sample size range and whether control is elevated."""
    base_min, base_max = _FREQUENCY_BASE.get(frequency, (25, 40))
    multiplier = _TYPE_MULTIPLIER.get(run_type, 1.0)

    # Apply type multiplier
    adj_min = math.ceil(base_min * multiplier)
    adj_max = math.ceil(base_max * multiplier)

    # Prior deficiency increases sample
    if prior_deficiency:
        adj_min = math.ceil(adj_min * 1.5)
        adj_max = math.ceil(adj_max * 1.5)

    # Check if risk elevation needed
    elevated = rawtc_score >= risk_threshold
    if elevated:
        adj_min = math.ceil(adj_min * elevation_factor)
        adj_max = math.ceil(adj_max * elevation_factor)

    return adj_min, adj_max, elevated


# ─── Mock data ───────────────────────────────────────────────────────────────

def _mock_result(risk_threshold: float, confidence_level: float) -> SamplingPlanResult:
    """Professional mock for 银行个贷 ICFR audit."""
    # If risk < 3, simplified result
    if risk_threshold < 3:
        return SamplingPlanResult(
            sample_size_range=SampleSizeRange(min=10, max=15),
            confidence_level=confidence_level,
            document_distribution=[
                DocumentDistribution(document_type="贷款审批单", count=5, priority="low"),
                DocumentDistribution(document_type="放款凭证", count=5, priority="low"),
            ],
            logic_explanation=[
                "风险阈值低于3，执行简化抽样程序",
                "仅需验证关键控制点的基本运行有效性",
            ],
            elevated_controls=[],
        )

    return SamplingPlanResult(
        sample_size_range=SampleSizeRange(min=45, max=78),
        confidence_level=confidence_level,
        document_distribution=[
            DocumentDistribution(document_type="贷款审批单（含授信审批表）", count=25, priority="high"),
            DocumentDistribution(document_type="抵押物评估报告", count=15, priority="high"),
            DocumentDistribution(document_type="贷后检查报告", count=12, priority="medium"),
            DocumentDistribution(document_type="利率变更审批记录", count=8, priority="medium"),
            DocumentDistribution(document_type="KYC客户尽调文档", count=10, priority="high"),
            DocumentDistribution(document_type="系统权限变更日志", count=8, priority="low"),
        ],
        logic_explanation=[
            "基于PCAOB AS 2201抽样准则，日常控制基准样本25个",
            "贷款审批为日常手工控制（频次:daily, 类型:manual），基准25-40",
            "上年存在审批越权缺陷，样本量上浮50%至38-60",
            "RAWTC评分6.2超过阈值5.0，触发风险提升因子1.5x",
            "最终样本量: 38×1.5=57（审批单），其余按比例分配",
            f"整体置信水平: {confidence_level*100:.0f}%，容忍偏差率: 5%",
        ],
        elevated_controls=[
            ElevatedControl(
                control_id="CTL-APPR-001",
                reason="上年度发现审批越权缺陷，RAWTC评分6.2超过阈值",
                original_sample_size=25,
                elevated_sample_size=57,
            ),
            ElevatedControl(
                control_id="CTL-COLL-003",
                reason="抵押物评估覆盖率不足，外部依赖风险高",
                original_sample_size=10,
                elevated_sample_size=15,
            ),
            ElevatedControl(
                control_id="CTL-KYC-002",
                reason="反洗钱监管处罚风险，KYC文档完整性不达标",
                original_sample_size=8,
                elevated_sample_size=12,
            ),
        ],
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
                    "temperature": 0.2,
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

async def recommend_sampling(
    risk_threshold: float = 5.0,
    confidence_level: float = 0.95,
    elevation_factor: float = 1.5,
) -> SamplingPlanResult:
    """Execute the sampling recommendation pipeline with conditional branching."""

    # Condition branch: low risk → simplified result
    if risk_threshold < 3:
        return _mock_result(risk_threshold, confidence_level)

    template = _load_template()
    prompt_system = template["system_prompt"]
    prompt_user = template["user_template"].format(
        risk_threshold=risk_threshold,
        confidence_level=confidence_level,
        elevation_factor=elevation_factor,
        controls_data="个贷业务标准控制活动清单（含日常审批、月度复核、季度报告等）",
        prior_year_deficiencies="贷款审批越权(CTL-APPR-001)、KYC文档不完整(CTL-KYC-002)",
    )

    result = await _call_llm(prompt_system, prompt_user)

    if result is None:
        return _mock_result(risk_threshold, confidence_level)

    try:
        size_range = result.get("sample_size_range", {})
        return SamplingPlanResult(
            sample_size_range=SampleSizeRange(
                min=int(size_range.get("min", 45)),
                max=int(size_range.get("max", 78)),
            ),
            confidence_level=float(result.get("confidence_level", confidence_level)),
            document_distribution=[
                DocumentDistribution(**d) for d in result.get("document_distribution", [])
            ],
            logic_explanation=result.get("logic_explanation", []),
            elevated_controls=[
                ElevatedControl(**e) for e in result.get("elevated_controls", [])
            ],
        )
    except Exception:
        return _mock_result(risk_threshold, confidence_level)
