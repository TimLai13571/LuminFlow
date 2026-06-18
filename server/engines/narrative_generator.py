"""Narrative Generator Pipeline — 技术术语→Plain Language + 受众适配"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import httpx
import yaml

from models.schemas import NarrativeRequest, NarrativeResult

# ─── Load prompt template ────────────────────────────────────────────────────

_TEMPLATE_PATH = Path(__file__).parent.parent / "prompts" / "templates" / "narrative.yaml"


def _load_template() -> dict[str, str]:
    with open(_TEMPLATE_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


# ─── Audience-specific mock narratives ───────────────────────────────────────

_MOCK_NARRATIVES: dict[str, dict[str, Any]] = {
    "CFO": {
        "narrative": (
            "尊敬的财务总监，\n\n"
            "本次个人贷款业务 ICFR 审计已完成实施阶段的关键评估。以下为核心发现和建议：\n\n"
            "## 一、财务影响量化评估\n\n"
            "| 影响维度 | 当前估算 | 置信区间 (95%) |\n"
            "|----------|----------|---------------|\n"
            "| 潜在新增不良贷款 | ¥2,300万 | [¥1,850万, ¥3,450万] |\n"
            "| 占个贷税前利润比例 | 3.2% | [2.3%, 4.7%] |\n"
            "| 预计信用减值损失增幅 | +¥1,200万 | [¥900万, ¥1,600万] |\n\n"
            "以上测算基于历史违约率迁移模型和当前控制缺陷样本偏差率(21%)。"
            "若考虑抵押物评估复核缺陷(偏差率27%)的叠加效应，"
            "不良贷款上限可能上移至¥3,800万。\n\n"
            "## 二、合规与监管风险\n\n"
            "- **银保监会《商业银行内部控制指引》第28条**：分级授权机制存在执行偏差，"
            "若监管现场检查发现，可能面临行政处罚（罚款区间¥50万-¥200万）\n"
            "- **《商业银行金融资产风险分类办法》**：抵押物评估偏差可能影响风险分类准确性\n"
            "- **IAS 39 / IFRS 9**：减值准备计提可能存在不足，需重新评估ECL模型参数\n\n"
            "## 三、整改投入产出分析\n\n"
            "| 整改项目 | 预计投入 | 年度收益 | 回收期 | ROI |\n"
            "|----------|----------|----------|--------|-----|\n"
            "| 审批权限矩阵重构 | ¥180万 | ¥1,500万 | 1.4个月 | 833% |\n"
            "| KYC系统强制校验 | ¥120万 | ¥600万 | 2.4个月 | 500% |\n"
            "| 抵押物复核自动化 | ¥150万 | ¥700万 | 2.6个月 | 467% |\n"
            "| **合计** | **¥450万** | **¥2,800万** | **1.9个月** | **622%** |\n\n"
            "## 四、战略建议\n\n"
            "1. **立即行动**：暂停超权限审批功能，启用临时补偿性控制\n"
            "2. **Q3目标**：完成审批权限矩阵重构和生产上线\n"
            "3. **Q4目标**：完成KYC和抵押物评估的系统增强并实施跟踪审计\n"
            "4. **长期机制**：建立控制自我评估(CSA)和持续监控(CM)体系\n\n"
            "详细技术报告已同步提交，建议在下次审计委员会上专项讨论。"
        ),
        "key_points": [
            "潜在信贷损失影响：¥2,300万-¥3,450万/年（占个贷利润2.3%-4.7%）",
            "监管合规风险：违反《商业银行内部控制指引》第28条，面临行政处罚",
            "整改总投入¥450万，预计年化收益¥2,800万，综合ROI达622%",
            "建议Q3前完成审批权限矩阵重构（最高优先级）",
            "需重新评估IFRS 9预期信用损失(ECL)模型参数",
        ],
        "suggested_actions": [
            "【紧急-本周】审批权限矩阵重构立项，指定项目负责人和预算",
            "【重要-Q3】拨付IT系统改造专项预算¥450万（分三期拨付）",
            "【重要-Q3】启动ECL模型参数回溯测试和重评估",
            "【常规】将内控有效性指标纳入分行绩效考核KPI体系",
            "【跟踪】每月向审计委员会和风控委员会双线汇报整改进展",
        ],
    },
    "internal_audit": {
        "narrative": (
            "## 个贷业务 ICFR 审计发现报告\n\n"
            "**审计期间**: 2026年6月 | **审计方法**: 风险导向审计 (Risk-Based Audit)\n\n"
            "### 1. 控制缺陷汇总\n\n"
            "本次审计覆盖6个关键控制领域(共17个控制点)，识别到以下显著缺陷：\n\n"
            "| 控制编号 | 控制描述 | 缺陷性质 | COSO要素 | 严重程度 | RAWTC |\n"
            "|---------|---------|---------|---------|--------|------|\n"
            "| CTL-APPR-001 | 贷款审批分级授权 | 设计+运行 | 控制活动(CA) | 🔴 重大缺陷 | 72 |\n"
            "| CTL-COLL-003 | 抵押物评估独立复核 | 运行 | 监控活动(MA) | 🟡 重要缺陷 | 48 |\n"
            "| CTL-KYC-002 | 客户尽调完整性 | 运行 | 风险评估(RA) | 🟡 重要缺陷 | 45 |\n"
            "| CTL-MON-004 | 贷后预警监控 | 运行 | 监控活动(MA) | 🟢 一般缺陷 | 32 |\n\n"
            "### 2. 控制测试结果详情\n\n"
            "**CTL-APPR-001 贷款审批分级授权**\n"
            "- 测试样本：57个（覆盖6家分行、3条产品线）\n"
            "- 偏差数量：12个（偏差率21.0%）\n"
            "- 偏差类型：越权审批9个(15.8%)、审批记录不完整3个(5.3%)\n"
            "- 可容忍偏差率(TDR)：8.0% → 🔴 超标2.6倍\n"
            "- 上年同期偏差率：14.3% → 📈 趋势恶化\n\n"
            "**CTL-COLL-003 抵押物评估独立复核**\n"
            "- 测试样本：15个（覆盖住房/商业物业两类）\n"
            "- 偏差数量：4个（偏差率26.7%）\n"
            "- 偏差类型：缺少独立复核记录4个(26.7%)\n"
            "- TDR：12.0% → 🔴 超标2.2倍\n"
            "- 涉及评估值偏差：最高达+23%，平均+15%\n\n"
            "**CTL-KYC-002 客户尽调完整性**\n"
            "- 测试样本：12个（覆盖新客户/存量续贷两类）\n"
            "- 偏差数量：3个（偏差率25.0%）\n"
            "- 偏差类型：身份证件缺失1个、收入证明缺失1个、用途证明缺失1个\n"
            "- TDR：10.0% → 🔴 超标2.5倍\n\n"
            "### 3. 风险矩阵评估\n\n"
            "```\n"
            "              影响程度\n"
            "          低      中      高     极高\n"
            "        ┌──────┬──────┬──────┬──────┐\n"
            "   极低 │      │      │      │      │\n"
            "        ├──────┼──────┼──────┼──────┤\n"
            "可能性 低  │      │MON-004│      │      │\n"
            "        ├──────┼──────┼──────┼──────┤\n"
            "   中   │      │COLL-003│      │APPR-001│\n"
            "        │      │KYC-002 │      │  ★重大 │\n"
            "        ├──────┼──────┼──────┼──────┤\n"
            "   高   │      │      │      │      │\n"
            "        └──────┴──────┴──────┴──────┘\n"
            "```\n\n"
            "综合残余风险评分：62.5/100（高风险区间）\n\n"
            "### 4. 审计意见影响评估\n\n"
            "基于PCAOB AS 1305标准，当前发现的缺陷组合可能触发以下影响：\n"
            "- **重大缺陷**：CTL-APPR-001 单独构成重大缺陷 → 可能导致否定意见\n"
            "- **重要缺陷组合**：COLL-003 + KYC-002 叠加 → 强化保留意见依据\n"
            "- **建议审计意见**：带保留意见（如整改计划可接受）或否定意见（如整改不可行）"
        ),
        "key_points": [
            "识别1项重大缺陷（CTL-APPR-001，RAWTC=72）和2项重要缺陷",
            "CTL-APPR-001 偏差率21.0%为TDR的2.6倍，且较上年恶化(14.3%→21.0%)",
            "COSO映射：控制活动(CA)和监控活动(MA)为当前最薄弱环节",
            "综合残余风险62.5分（高风险），建议审计意见为保留意见或否定意见",
            "需要扩大CTL-APPR-001测试范围至全量审批记录的统计抽样",
            "建议对3项缺陷实施穿行测试(Walkthrough)和根因分析(RCA)",
        ],
        "suggested_actions": [
            "【紧急】扩展CTL-APPR-001测试样本至全量2,340笔审批记录",
            "【紧急】对重大缺陷CTL-APPR-001实施穿行测试验证控制设计有效性",
            "【重要】发出管理层声明函，要求确认缺陷整改计划和时间表",
            "【重要】更新风险控制矩阵(RCM)和工作底稿反映最新评估结果",
            "【常规】安排缺陷整改后跟踪审计（建议60-90天内）",
            "【常规】与外部审计师沟通缺陷评估结论和审计意见影响",
        ],
    },
    "IT": {
        "narrative": (
            "## 内部控制缺陷整改 — 技术实施方案\n\n"
            "**文档版本**: v1.0 | **目标受众**: IT 开发与架构团队 | **密级**: 内部\n\n"
            "### 1. 背景与业务需求\n\n"
            "2026年6月ICFR审计发现个贷审批系统存在3项控制缺陷，需要从技术层面实施整改。"
            "本方案聚焦CTL-APPR-001（重大缺陷），兼顾COLL-003和KYC-002。\n\n"
            "### 2. 当前技术架构问题诊断\n\n"
            "| 问题域 | 当前状态 | 根因 | 影响范围 |\n"
            "|--------|---------|------|----------|\n"
            "| 权限模型 | RBAC仅按角色>岗位，无金额维度 | 设计缺陷 | 越权审批率21% |\n"
            "| 审计日志 | 仅记录操作，无实时异常检测 | 缺少检测控制 | 事后发现延迟T+7天 |\n"
            "| 评估接口 | 无偏差校验，人工比对 | 缺少预防控制 | 评估偏差>20%占比27% |\n"
            "| KYC校验 | 文档清单人工勾选，无系统强制 | 缺少预防控制 | 关键文档缺失率25% |\n\n"
            "### 3. 技术实现方案\n\n"
            "#### 3.1 审批权限重构：RBAC → ABAC 升级\n\n"
            "```yaml\n"
            "# 新权限策略模型 (基于XACML 3.0)\n"
            "policy:\n"
            "  target: loan_approval\n"
            "  rules:\n"
            "    - id: amount_tier_control\n"
            "      condition:\n"
            "        - attr.amount <= attr.approver_limit\n"
            "        - attr.product_type in ['housing', 'consumer', 'business']\n"
            "        - attr.region in attr.approver_regions\n"
            "      obligation: LOG_APPROVAL_DECISION\n"
            "    - id: dual_approval_trigger\n"
            "      condition:\n"
            "        - attr.amount > threshold(5000000)  # ¥500万以上双人审批\n"
            "      obligation: REQUIRE_SECOND_APPROVER\n"
            "```\n\n"
            "**技术选型**：\n"
            "- 策略引擎：Open Policy Agent (OPA) v0.60+\n"
            "- 策略存储：PostgreSQL + Redis 缓存(5min TTL)\n"
            "- 策略管理：自研Policy Admin UI (React + Monaco Editor)\n\n"
            "#### 3.2 审计日志增强：实时异常检测\n\n"
            "```\n"
            "审批请求 → [ABAC引擎] → 决策日志\n"
            "                        ↓\n"
            "                   [Log Middleware]\n"
            "                        ↓\n"
            "              ┌──────┴──────┐\n"
            "              ↓             ↓\n"
            "        [ELK Stack]    [SIEM/Splunk]\n"
            "        (数据分析)     (实时告警)\n"
            "              ↓             ↓\n"
            "        [Kibana]       [AlertManager]\n"
            "        (可视化)       (通知: 邮件/钉钉)\n"
            "```\n\n"
            "**告警规则**（Phase 1 上线）：\n"
            "- 同一审批人单日审批金额超¥5,000万 → P1 告警\n"
            "- 非工作时间(22:00-06:00)审批操作 → P2 告警\n"
            "- 审批驳回率单日>50% → P3 通知\n"
            "- 权限变更无对应CR单号 → P0 紧急告警\n\n"
            "#### 3.3 评估值偏差自动校验\n\n"
            "```python\n"
            "# 偏差检测算法（伪代码）\n"
            "def validate_appraisal(external_value, internal_value, property_type):\n"
            "    deviation = abs(external_value - internal_value) / internal_value\n"
            "    threshold = THRESHOLD_MAP.get(property_type, 0.15)  # 默认±15%\n"
            "    \n"
            "    if deviation > threshold:\n"
            "        trigger_manual_review(\n"
            "            external_value, internal_value, deviation, property_type\n"
            "        )\n"
            "        return ReviewStatus.PENDING_MANUAL\n"
            "    return ReviewStatus.AUTO_APPROVED\n"
            "```\n\n"
            "#### 3.4 KYC文档强制校核\n\n"
            "- 实施文档清单模板引擎（基于产品类型+客户类型动态生成必传项）\n"
            "- 前端+后端双重校验：文件类型(MIME)、大小(<10MB)、OCR可读性\n"
            "- 缺失必传项时：阻断流程提交 + 明确提示缺失文档列表\n\n"
            "### 4. 工作量与排期估算\n\n"
            "| Sprint | 任务 | 人周 | 前置依赖 |\n"
            "|--------|------|------|----------|\n"
            "| Sprint 1 | ABAC模型设计+数据迁移方案 | 8 | 无 |\n"
            "| Sprint 2 | OPA引擎集成+Policy Admin UI | 10 | Sprint 1 |\n"
            "| Sprint 3 | 审计日志中间件+SIEM告警规则 | 6 | Sprint 2 |\n"
            "| Sprint 4 | 评估值校验引擎+自动化测试 | 8 | 无 |\n"
            "| Sprint 5 | KYC文档强制校核+前端校验 | 6 | 无 |\n"
            "| Sprint 6 | 集成测试+UAT+性能压测 | 8 | Sprint 1-5 |\n"
            "| **合计** | — | **46** | — |\n\n"
            "### 5. 非功能性需求\n\n"
            "- **性能**: ABAC决策P99延迟<50ms，缓存命中率>95%\n"
            "- **可用性**: 权限服务SLA 99.9%，降级策略：缓存过期后使用本地策略副本\n"
            "- **安全**: 权限变更双人复核，操作日志保留≥3年（满足银保监合规要求）\n"
            "- **兼容性**: 新权限服务通过API Gateway灰度发布，旧RBAC并行运行1个月后下线"
        ),
        "key_points": [
            "RBAC→ABAC升级：基于金额/产品/区域三维度细粒度控制，采用OPA策略引擎",
            "实时异常检测：审计日志对接ELK+Splunk SIEM，5类告警规则Phase1上线",
            "评估偏差自动校验：外部评估值偏差>±15%自动触发人工复核",
            "KYC文档强制校核：前端+后端双重校验，缺失必传项阻断流程提交",
            "总工作量46人周，建议6个Sprint并行推进（约3个月）",
            "非功能性指标：ABAC决策P99<50ms，权限服务SLA 99.9%",
        ],
        "suggested_actions": [
            "【Sprint 1】完成ABAC权限模型设计和数据迁移方案（8人周）",
            "【Sprint 2】实施OPA策略引擎集成和Policy Admin UI（10人周）",
            "【Sprint 3】部署审计日志中间件和SIEM告警规则（6人周）",
            "【Sprint 4】开发评估值校验引擎和单元测试套件（8人周）",
            "【Sprint 5】开发KYC文档强制校核和前端校验组件（6人周）",
            "【Sprint 6】集成测试+UAT+性能压测+灰度上线（8人周）",
            "【持续】权限变更走CR流程，每次发版CI管线包含权限回归测试",
        ],
    },
    "board": {
        "narrative": (
            "## 个贷业务内部控制审计 — 董事会简报\n\n"
            "**呈报对象**: 董事会 / 审计委员会 | **日期**: 2026年6月17日\n\n"
            "### 审计总体结论\n\n"
            "本期个贷业务ICFR审计在实施阶段发现**1项重大缺陷和2项重要缺陷**，"
            "综合残余风险评分62.5/100（高风险区间）。"
            "建议审计意见等级为**带保留意见**（如整改计划可接受）或否定意见（如整改不可行）。\n\n"
            "### 核心发现 (Executive Summary)\n\n"
            "1. **审批授权失控（重大缺陷）**：21%的审批样本存在越权审批，"
            "涉及金额¥4,260万，且较上年恶化（14.3%→21.0%）。"
            "该缺陷可能导致年度新增不良贷款¥2,300万-¥3,450万。\n\n"
            "2. **抵押物评估复核缺失（重要缺陷）**：27%的评估缺少独立复核，"
            "评估值偏差最高达+23%，可能影响减值准备计提准确性。\n\n"
            "3. **KYC尽调不完整（重要缺陷）**：25%的客户关键文档缺失，"
            "存在反洗钱合规风险和可疑交易漏报隐患。\n\n"
            "### 财务与合规影响\n\n"
            "| 影响维度 | 量化估计 | 置信度 |\n"
            "|----------|----------|--------|\n"
            "| 潜在不良贷款增加 | ¥2,300万-¥3,450万/年 | 中高 |\n"
            "| 监管处罚风险 | ¥50万-¥200万（单次） | 中 |\n"
            "| 整改总投入 | ¥450万（一次性） | 高 |\n"
            "| 年化整改收益 | ¥2,800万 | 中高 |\n"
            "| 声誉风险 | 不可量化但影响重大 | 低概率高影响 |\n\n"
            "### 请求董事会决策事项\n\n"
            "1. **批准整改预算¥450万**：分三期拨付（Q3 ¥180万 + Q4 ¥150万 + Q4 ¥120万）\n"
            "2. **确认整改优先级**：审批权限重构（P0）→ KYC系统增强（P1）→ 抵押物复核自动化（P1）\n"
            "3. **授权启动管理层整改承诺函**：需在6月30日前向外部审计师提交\n"
            "4. **纳入Q3经营计划**：将整改里程碑纳入各相关部门KPI考核\n\n"
            "详细技术报告和整改方案已提交，建议下次审计委员会上专项审议。"
        ),
        "key_points": [
            "发现1项重大缺陷（审批授权），建议审计意见为保留意见或否定意见",
            "潜在财务影响：新增不良贷款¥2,300万-¥3,450万/年",
            "整改总投入¥450万，年化收益¥2,800万，投资回收期不足2个月",
            "请求批准¥450万整改预算和整改优先级方案",
            "建议6月30日前向外部审计师提交管理层整改承诺函",
        ],
        "suggested_actions": [
            "【决策】批准¥450万整改预算（分三期拨付）",
            "【决策】确认审批权限重构为全行级优先项目（P0）",
            "【授权】启动管理层整改承诺函签署流程",
            "【要求】将整改里程碑纳入Q3相关部门KPI考核",
            "【安排】下次审计委员会专项审议整改实施方案",
        ],
    },
}


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
                    "temperature": 0.5,
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

def _mock_result(request: NarrativeRequest) -> NarrativeResult:
    """Return audience-adapted mock narrative."""
    audience_key = request.audience.strip()

    # Normalize audience key to match _MOCK_NARRATIVES keys
    audience_lower = audience_key.lower()

    if audience_key.upper() == "CFO" or "cfo" in audience_lower or "财务" in audience_key:
        audience_key = "CFO"
    elif "board" in audience_lower or "董事会" in audience_key or "committee" in audience_lower or "委员会" in audience_key:
        audience_key = "board"
    elif "audit" in audience_lower or "内审" in audience_key or "internal" in audience_lower:
        audience_key = "internal_audit"
    elif "it" in audience_lower or "信息技术" in audience_key or "tech" in audience_lower:
        audience_key = "IT"
    else:
        audience_key = "internal_audit"  # default

    mock = _MOCK_NARRATIVES.get(audience_key, _MOCK_NARRATIVES["internal_audit"])
    return NarrativeResult(
        narrative=mock["narrative"],
        key_points=mock["key_points"],
        suggested_actions=mock["suggested_actions"],
    )


async def generate_narrative(request: NarrativeRequest) -> NarrativeResult:
    """Execute the narrative generation pipeline with audience adaptation."""
    template = _load_template()

    prompt_system = template["system_prompt"]
    prompt_user = template["user_template"].format(
        audience=request.audience,
        topic=request.topic,
        findings="\n".join(f"- {f}" for f in request.findings) if request.findings else "暂无具体发现",
    )

    result = await _call_llm(prompt_system, prompt_user)

    if result is None:
        return _mock_result(request)

    try:
        return NarrativeResult(
            narrative=result.get("narrative", ""),
            key_points=result.get("key_points", []),
            suggested_actions=result.get("suggested_actions", []),
        )
    except Exception:
        return _mock_result(request)
