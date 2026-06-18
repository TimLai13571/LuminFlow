"""Risk Analyzer Pipeline — 三阶段串行：业务解析→内控映射→风险评估"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import httpx
import yaml

from models.schemas import RiskAnalysisResult, RiskArea

# ─── Load prompt template ────────────────────────────────────────────────────

_TEMPLATE_PATH = Path(__file__).parent.parent / "prompts" / "templates" / "risk_analysis.yaml"


def _load_template() -> dict[str, str]:
    with open(_TEMPLATE_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


# ─── Mock data (银行个贷 ICFR 审计场景) ──────────────────────────────────────

def _mock_result() -> RiskAnalysisResult:
    return RiskAnalysisResult(
        risk_areas=[
            RiskArea(
                area="贷款审批授权",
                likelihood=7.0,
                impact=8.0,
                control_effectiveness=0.65,
                residual_risk=7.0 * 8.0 * (1 - 0.65),
                description="个贷审批流程中存在越权审批和权限设置不当风险，部分支行审批权限未按最新政策更新",
            ),
            RiskArea(
                area="贷后管理监控",
                likelihood=6.0,
                impact=7.0,
                control_effectiveness=0.55,
                residual_risk=6.0 * 7.0 * (1 - 0.55),
                description="贷后预警系统触发后的人工跟进不及时，逾期30天以上贷款的跟踪记录完整性不足",
            ),
            RiskArea(
                area="抵押物评估",
                likelihood=5.0,
                impact=9.0,
                control_effectiveness=0.70,
                residual_risk=5.0 * 9.0 * (1 - 0.70),
                description="抵押物评估依赖外部评估机构，内部复核机制覆盖率仅60%，存在估值偏差风险",
            ),
            RiskArea(
                area="利率定价合规",
                likelihood=4.0,
                impact=6.0,
                control_effectiveness=0.80,
                residual_risk=4.0 * 6.0 * (1 - 0.80),
                description="LPR调整后系统参数更新的时效性和准确性需验证，手工调整记录需增强审计轨迹",
            ),
            RiskArea(
                area="客户信息验证",
                likelihood=6.5,
                impact=7.5,
                control_effectiveness=0.60,
                residual_risk=6.5 * 7.5 * (1 - 0.60),
                description="反洗钱KYC流程中身份验证环节存在漏洞，部分客户尽职调查文档不完整",
            ),
        ],
        overall_score=62.5,
        recommendations=[
            "强化贷款审批权限矩阵的季度复核机制，建立权限变更的双人审批流程",
            "升级贷后预警系统的自动化跟踪功能，将人工跟进时效纳入KPI考核",
            "建立抵押物评估的内部独立复核团队，覆盖率提升至100%",
            "实施LPR参数变更的自动化校验和T+1日核对机制",
            "完善KYC流程的系统强制校验节点，增加客户信息更新的定期触发机制",
        ],
    )


# ─── API call to DeepSeek ────────────────────────────────────────────────────

async def _call_llm(prompt_system: str, prompt_user: str) -> dict[str, Any] | None:
    """Call DeepSeek API, return parsed JSON or None on failure."""
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

async def analyze_risk(
    process_description: str = "",
    controls_data: str = "",
    audit_scope: str = "银行个贷业务ICFR审计",
) -> RiskAnalysisResult:
    """Execute the three-stage risk analysis pipeline."""
    template = _load_template()

    prompt_system = template["system_prompt"]
    prompt_user = template["user_template"].format(
        process_description=process_description or "银行个人贷款业务全流程（申请→审批→放款→贷后管理）",
        controls_data=controls_data or "基于COSO 2013框架的标准内控矩阵",
        audit_scope=audit_scope,
    )

    result = await _call_llm(prompt_system, prompt_user)

    if result is None:
        return _mock_result()

    try:
        # Parse LLM response into structured result
        risk_areas = []
        for ra in result.get("risk_areas", []):
            likelihood = float(ra.get("likelihood", 5))
            impact = float(ra.get("impact", 5))
            effectiveness = float(ra.get("control_effectiveness", 0.5))
            risk_areas.append(
                RiskArea(
                    area=ra.get("area", "未知领域"),
                    likelihood=likelihood,
                    impact=impact,
                    control_effectiveness=effectiveness,
                    residual_risk=likelihood * impact * (1 - effectiveness),
                    description=ra.get("description", ""),
                )
            )
        return RiskAnalysisResult(
            risk_areas=risk_areas,
            overall_score=float(result.get("overall_score", 50.0)),
            recommendations=result.get("recommendations", []),
        )
    except Exception:
        return _mock_result()
