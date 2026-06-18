"""Chat route — POST /api/chat with SSE streaming."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, AsyncGenerator

import httpx
import yaml
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from models.schemas import ChatRequest

router = APIRouter()

_TEMPLATE_PATH = Path(__file__).parent.parent / "prompts" / "templates" / "chat.yaml"


def _load_template() -> dict[str, str]:
    with open(_TEMPLATE_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


# ─── Mock streaming response ────────────────────────────────────────────────

_MOCK_RESPONSES: dict[str, str] = {
    "default": (
        "您好！我是 LuminFlow 智能审计助手，专注于银行个人贷款业务的内部控制与财务报告(ICFR)审计。\n\n"
        "我可以帮助您进行：\n\n"
        "1. **风险分析** — 基于 COSO 2013 框架识别业务流程中的风险点，评估残余风险水平\n"
        "2. **抽样建议** — 根据控制属性、风险等级和历史缺陷推荐审计抽样方案\n"
        "3. **影响模拟** — 评估控制缺陷在COSO五要素框架内的传播路径和连锁影响\n"
        "4. **沟通协助** — 将技术发现转化为面向CFO、内审团队、IT部门等不同受众的叙述\n"
        "5. **审计目标管理** — 追踪审计目标完成度，分析控制缺陷严重程度\n"
        "6. **团队协作** — 优化PBC管理、AI内容审批流程和团队沟通效率\n\n"
        "请问您需要哪方面的帮助？您可以直接点击下方的快捷问题，或描述具体的审计场景。"
    ),
    "risk": (
        "## 个贷业务 ICFR 风险分析报告\n\n"
        "基于最新一期审计数据，我对个贷业务流程进行了全面的风险评估，覆盖 COSO 2013 五大要素：\n\n"
        "### 🔴 高风险领域（残余风险 ≥ 18）\n\n"
        "| 控制域 | 控制编号 | 残余风险 | 主要问题 |\n"
        "|--------|----------|----------|----------|\n"
        "| 控制活动 | CTL-APPR-001 | 19.6 | 贷款审批分级授权执行存在偏差，越权审批率21% |\n"
        "| 风险评估 | CTL-KYC-002 | 19.5 | 客户尽调文档完整性不足，关键文档缺失率25% |\n"
        "| 控制活动 | CTL-COLL-003 | 19.2 | 抵押物评估独立复核机制运行失效 |\n\n"
        "### 🟡 中风险领域（残余风险 13-18）\n\n"
        "| 控制域 | 控制编号 | 残余风险 | 主要问题 |\n"
        "|--------|----------|----------|----------|\n"
        "| 监控活动 | CTL-MON-004 | 18.9 | 贷后预警跟进时效性不足，T+3闭环率仅62% |\n"
        "| 控制环境 | CTL-ENV-005 | 15.2 | 分行信贷文化执行不一致 |\n"
        "| 信息与沟通 | CTL-INFO-006 | 13.5 | 风险信号跨部门传递存在时滞 |\n\n"
        "### 重点关注事项\n\n"
        "1. **审批授权**：建议立即启动权限矩阵重构，实施基于金额/产品/区域的三维度ABAC模型\n"
        "2. **KYC流程**：需在Q3前完成客户尽调标准操作流程(SOP)更新和系统强制校验功能上线\n"
        "3. **抵押物评估**：建议引入外部评估机构轮换机制，内部复核覆盖率提升至100%\n\n"
        "需要我对某个具体控制点做深入分析吗？"
    ),
    "objective": (
        "## 审计目标与控制点分析\n\n"
        "### 当前审计目标完成度\n\n"
        "| 审计目标 | 状态 | 完成度 | 关键发现 |\n"
        "|----------|------|--------|----------|\n"
        "| OBJ-01 审批授权有效性 | 🔴 进行中 | 65% | 发现1项重大缺陷 |\n"
        "| OBJ-02 KYC尽调完整性 | 🟡 进行中 | 72% | 发现1项重要缺陷 |\n"
        "| OBJ-03 抵押物评估准确性 | 🟡 进行中 | 58% | 测试样本不足 |\n"
        "| OBJ-04 贷后监控及时性 | 🟢 进行中 | 80% | 未发现显著异常 |\n"
        "| OBJ-05 系统访问控制 | 🟢 已完成 | 100% | 无缺陷 |\n\n"
        "### COSO 2013 五要素映射\n\n"
        "当前审计覆盖的17个控制点与COSO框架的映射关系如下：\n\n"
        "- **控制环境** (3个控制点) — OBJ-01, OBJ-05, OBJ-11\n"
        "- **风险评估** (4个控制点) — OBJ-02, OBJ-06, OBJ-07, OBJ-12\n"
        "- **控制活动** (6个控制点) — OBJ-01, OBJ-03, OBJ-08, OBJ-09, OBJ-13, OBJ-14 ⚠️ 薄弱环节\n"
        "- **信息与沟通** (2个控制点) — OBJ-10, OBJ-15\n"
        "- **监控活动** (2个控制点) — OBJ-04, OBJ-16 ⚠️ 薄弱环节\n\n"
        "### 控制点标红原因分析\n\n"
        "控制点被标红（高风险）通常基于以下综合判断：\n\n"
        "1. **测试偏差率超阈值**：样本偏差率超过可容忍偏差率(TDR)的1.5倍\n"
        "2. **固有风险×控制风险**：乘积超过风险矩阵红色区域阈值(≥15)\n"
        "3. **历史缺陷未整改**：上期审计发现的缺陷在跟踪审计中确认未有效整改\n"
        "4. **RAWTC评分**：风险权重调整后的综合评分≥65分\n\n"
        "### 优先级建议\n\n"
        "基于风险导向审计原则，建议按以下优先级处理：\n\n"
        "1. ⚠️ **CTL-APPR-001 审批授权** — 重大缺陷，存在监管合规风险\n"
        "2. ⚠️ **CTL-KYC-002 客户尽调** — 重要缺陷，影响风险评估可靠性\n"
        "3. ⚠️ **CTL-COLL-003 抵押物评估** — 重要缺陷，影响减值准备计提准确性\n"
        "4. ⚠️ **CTL-MON-004 贷后监控** — 一般缺陷，但趋势恶化\n\n"
        "需要我生成具体的控制缺陷整改建议吗？"
    ),
    "sampling": (
        "## 审计抽样方案\n\n"
        "### 抽样方法论\n\n"
        "本次审计采用**属性抽样(Attribute Sampling)**与**货币单位抽样(MUS)**相结合的混合策略：\n\n"
        "- **控制测试**：采用属性抽样，置信水平95%，可容忍偏差率(TDR)设定为8%\n"
        "- **实质性测试**：采用MUS方法，基于账面价值加权抽取\n\n"
        "### 样本量计算逻辑\n\n"
        "依据 AICPA Audit Sampling Guide (2023)，样本量计算公式为：\n\n"
        "> n = (N × Z² × p × (1-p)) / (N × E² + Z² × p × (1-p))\n\n"
        "其中 Z=1.96(95%置信), p=0.5(最大方差), E=0.08(可容忍误差)\n\n"
        "### 各控制样本量分配\n\n"
        "| 控制编号 | 总体数量 | 基准样本量 | 调整因子 | 最终样本量 | 调整原因 |\n"
        "|----------|----------|------------|----------|------------|----------|\n"
        "| CTL-APPR-001 | 2,340 | 25 | ×1.5 | **57** | RAWTC超阈值+缺陷历史 |\n"
        "| CTL-KYC-002 | 1,860 | 25 | ×1.3 | **45** | KYC完整性历史不达标 |\n"
        "| CTL-COLL-003 | 420 | 20 | ×1.2 | **31** | 评估值偏差＞±15% |\n"
        "| CTL-MON-004 | 890 | 25 | ×1.1 | **33** | 预警闭环率低于目标 |\n"
        "| CTL-ENV-005 | 156 | 15 | ×1.0 | **20** | 无特殊因子 |\n"
        "| **合计** | **5,666** | **110** | — | **186** | — |\n\n"
        "### 分行抽样分布\n\n"
        "选择以下6家分行作为抽样单元，基于以下标准：\n\n"
        "- 分行A（上海）：个贷余额最大，占总量的28% → 分配45个样本\n"
        "- 分行B（深圳）：上年缺陷集中地区 → 分配38个样本\n"
        "- 分行C（北京）：新开业分行，控制环境待验证 → 分配35个样本\n"
        "- 分行D（广州）：高风险产品集中 → 分配30个样本\n"
        "- 分行E（成都）：中等风险基准 → 分配25个样本\n"
        "- 分行F（武汉）：低风险对照 → 分配13个样本\n\n"
        "### 样本量充分性判断\n\n"
        "根据量化评估，186个样本能够满足以下条件：\n"
        "- 统计显著性：95%置信水平下误差边际≤5%\n"
        "- 覆盖率：覆盖个贷业务流程全部17个控制点\n"
        "- 代表性：覆盖6家分行、3类产品线(住房/消费/经营)\n\n"
        "需要我生成详细的PBC请求清单或抽样工作底稿吗？"
    ),
    "impact": (
        "## 控制缺陷影响模拟分析\n\n"
        "### 模拟场景设定\n\n"
        "基于 CTL-APPR-001（审批授权缺陷）为起点，模拟控制失效在COSO五要素间的传播路径：\n\n"
        "### 影响传播路径\n\n"
        "```\n"
        "CTL-APPR-001 失效\n"
        "  ├──→ 控制活动层：分级授权机制失效\n"
        "  │     ├──→ CTL-APPR-002（合同审核）依赖失效 → 影响度 0.72\n"
        "  │     └──→ CTL-APPR-003（放款审批）依赖失效 → 影响度 0.65\n"
        "  ├──→ 风险评估层：信用风险暴露增加\n"
        "  │     ├──→ 贷前评级模型偏差扩大 → 影响度 0.58\n"
        "  │     └──→ 风险拨备计提不足 → 影响度 0.51\n"
        "  ├──→ 信息沟通层：风险信号传递中断\n"
        "  │     └──→ 管理层风险报告不完整 → 影响度 0.43\n"
        "  └──→ 监控活动层：异常检测能力下降\n"
        "        └──→ 持续监控指标失真 → 影响度 0.38\n"
        "```\n\n"
        "### 量化影响估算\n\n"
        "| 影响维度 | 数值估算 | 置信区间(95%) |\n"
        "|----------|----------|---------------|\n"
        "| 预计新增不良贷款 | ¥2,300万-¥3,100万 | [1,850万, 3,450万] |\n"
        "| 预计信贷损失增幅 | 个贷利润的2.8%-4.1% | [2.3%, 4.7%] |\n"
        "| 监管合规风险 | 可能面临行政处罚 | 中高概率 |\n"
        "| 整改投入产出比 | 180万投入→降低损失1,500万 | ROI ≈ 833% |\n\n"
        "### 连锁反应评估\n\n"
        "**一级效应**：审批缺陷直接导致不合格贷款放行\n"
        "**二级效应**：不良贷款增加触发风险拨备补充，影响当期利润\n"
        "**三级效应**：连续两个季度拨备增加引发监管关注和投资者质疑\n\n"
        "### 缓释建议\n\n"
        "1. **紧急**：暂停超权限审批功能，强制实施金额分层审批\n"
        "2. **短期**：部署补偿性检测控制(Compensating Detective Controls)\n"
        "3. **中期**：完成ABAC权限模型设计和系统上线\n"
        "4. **长期**：建立控制自我评估(CSA)和持续监控(CM)机制\n\n"
        "需要我对其他控制点的连锁影响进行模拟吗？"
    ),
    "team": (
        "## 团队协作与沟通建议\n\n"
        "### 客户关注的核心指标\n\n"
        "根据审计委员会和高级管理层的关注重点，以下是指标优先级矩阵：\n\n"
        "| 优先级 | 指标 | 利益相关方 | 关注原因 |\n"
        "|--------|------|------------|----------|\n"
        "| P0 | 重大缺陷数量及整改状态 | 审计委员会/CFO | 直接影响审计意见 |\n"
        "| P0 | 监管合规风险敞口 | CCO/法务 | 行政处罚风险 |\n"
        "| P1 | 控制测试偏差率趋势 | 内审总监 | 内控有效性判断 |\n"
        "| P1 | PBC提供及时率 | PMO | 影响审计进度 |\n"
        "| P2 | AI审批采纳率 | IT/业务部门 | 流程数字化转型 |\n\n"
        "### AI内容审批最佳实践\n\n"
        "1. **分层审批机制**：根据内容敏感度设置三级审批流程\n"
        "   - L1：常规技术描述 → AI自动通过\n"
        "   - L2：风险评级结论 → AI建议+人工复核\n"
        "   - L3：审计意见/监管报告 → 强制人工审批\n"
        "2. **审批记录可追溯**：所有AI生成内容的审批决策需保留完整日志\n"
        "3. **定期质量抽检**：按5%比例对L1级别AI内容进行事后抽查\n\n"
        "### 团队协作效率提升\n\n"
        "| 改进领域 | 当前痛点 | 建议措施 | 预期效果 |\n"
        "|----------|----------|----------|----------|\n"
        "| PBC管理 | 逾期率35% | 自动化催办+升级机制 | 逾期率降至15% |\n"
        "| 底稿审阅 | 平均周期3.5天 | 并行审阅+批注模板 | 周期缩短至1.5天 |\n"
        "| 发现沟通 | 信息传递层级多 | 每日15分钟站会 | 响应速度提升50% |\n"
        "| 报告编写 | 多轮反复修改 | AI辅助初稿+模板化 | 编写时间减少40% |\n\n"
        "### 待审批项优先级排列\n\n"
        "1. 🔴 **紧急—24h内**：审计调整分录、重大缺陷确认函\n"
        "2. 🟡 **重要—48h内**：PBC跟进清单、测试底稿审阅\n"
        "3. 🟢 **常规—72h内**：工作底稿归档、周报汇总\n"
        "4. ⚪ **可延后—本周**：经验教训总结、知识库更新\n\n"
        "需要我帮助您生成任何沟通材料吗？"
    ),
    "pbc": (
        "## PBC（客户提供资料）逾期项处理指南\n\n"
        "### 当前PBC状态概览\n\n"
        "| 状态 | 数量 | 占比 | 处理优先级 |\n"
        "|------|------|------|------------|\n"
        "| 🔴 逾期>7天 | 12项 | 8% | 紧急升级 |\n"
        "| 🟡 逾期3-7天 | 18项 | 12% | 主动跟进 |\n"
        "| 🟠 逾期1-3天 | 23项 | 15% | 提醒催办 |\n"
        "| 🟢 已按时提供 | 98项 | 65% | 正常审阅 |\n\n"
        "### 分级处理流程\n\n"
        "**第一级 — 自动提醒（逾期1天）**\n"
        "- 系统自动发送提醒邮件至客户对接人\n"
        "- 在审计进度面板标记黄色预警\n\n"
        "**第二级 — 主动跟进（逾期3天）**\n"
        "- 审计助理电话/微信联系客户对接人确认原因\n"
        "- 更新PBC跟踪表，记录逾期原因和预计提供时间\n"
        "- 评估对审计进度的影响，必要时调整测试计划\n\n"
        "**第三级 — 正式升级（逾期7天）**\n"
        "- 发送正式书面通知至客户财务总监/CFO级别\n"
        "- 在审计状态报告中标记为\"范围受限\"风险项\n"
        "- 审计经理评估是否需调整审计程序(如增加替代程序)\n\n"
        "**第四级 — 高层沟通（逾期14天）**\n"
        "- 审计合伙人直接与客户CEO/审计委员会沟通\n"
        "- 评估对审计意见类型的潜在影响\n"
        "- 考虑是否需要出具\"范围受限\"的保留意见\n\n"
        "### 常见逾期原因及应对\n\n"
        "| 逾期原因 | 占比 | 应对策略 |\n"
        "|----------|------|----------|\n"
        "| 数据需跨部门协调 | 35% | 协助客户明确数据Owner，出具协调函 |\n"
        "| 系统数据导出困难 | 25% | 安排IT支持，提供数据提取脚本 |\n"
        "| 业务人员出差/休假 | 20% | 确认Backup人员，获取临时授权 |\n"
        "| 对需求理解有偏差 | 15% | 安排需求澄清会议 |\n"
        "| 主观配合意愿不足 | 5% | 升级至管理层沟通 |\n\n"
        "需要我帮您生成PBC催办函或更新PBC跟踪表吗？"
    ),
    "progress": (
        "## 本期审计进度概览\n\n"
        "### 整体进度仪表盘\n\n"
        "```\n"
        "████████████░░░░░░░░░░░░░░░░  65% 整体完成度\n"
        "```\n\n"
        "### 三阶段进度明细\n\n"
        "| 阶段 | 状态 | 完成度 | 计划时间 | 实际/预计 | 偏差 |\n"
        "|------|------|--------|----------|-----------|------|\n"
        "| Ⅰ 计划阶段 | 🟢 已完成 | 100% | 6/1-6/5 | 6/1-6/5 | 0天 |\n"
        "| Ⅱ 实施阶段 | 🟡 进行中 | 68% | 6/6-6/20 | 6/6-6/22 | +2天 |\n"
        "| Ⅲ 缺陷评价 | ⚪ 未开始 | 0% | 6/21-6/28 | — | — |\n\n"
        "### 实施阶段详细状态\n\n"
        "| 任务模块 | 状态 | 完成度 | 负责人 | 关键风险 |\n"
        "|----------|------|--------|--------|----------|\n"
        "| 控制测试执行 | 🟡 进行中 | 62% | 李明 | PBC逾期影响测试进度 |\n"
        "| 实质性测试 | 🟡 进行中 | 55% | 王芳 | 个别分行数据未到齐 |\n"
        "| PBC资料审阅 | 🟢 正常 | 78% | 张伟 | 无 |\n"
        "| 访谈纪要整理 | 🟢 已完成 | 100% | 赵丽 | 无 |\n"
        "| 风险控制矩阵更新 | 🟡 进行中 | 45% | 李明 | 待缺陷确认后更新 |\n\n"
        "### 关键里程碑预警\n\n"
        "- ⚠️ **6月18日**：控制测试需全部完成（当前偏差2天）\n"
        "- ⚠️ **6月20日**：PBC补充资料截止日（12项逾期需加速跟进）\n"
        "- 📌 **6月22日**：缺陷评价阶段启动会\n"
        "- 📌 **6月28日**：审计报告初稿提交\n\n"
        "### 进度提速建议\n\n"
        "1. 优先完成CTL-APPR-001的测试收尾（影响3个下游控制点）\n"
        "2. 对逾期PBC启动第三级正式升级流程\n"
        "3. 考虑抽调1名审计员支援实质性测试模块\n\n"
        "需要我协助制定具体的赶工计划吗？"
    ),
    "control_deficiency": (
        "## 控制缺陷严重程度分析\n\n"
        "### 缺陷分类标准\n\n"
        "根据 PCAOB AS 1305 和 COSO 内部控制框架，缺陷分为三级：\n\n"
        "| 等级 | 定义 | 判定标准 | 审计意见影响 |\n"
        "|------|------|----------|-------------|\n"
        "| 重大缺陷 | 存在合理可能性导致重大错报且无法被及时防止或发现 | 定量>税前利润5% 或 定性影响重大 | 可能导致否定意见 |\n"
        "| 重要缺陷 | 重要性不及重大缺陷，但足以引起财务报告监督者注意 | 定量>税前利润1% 或 定性影响较大 | 可能导致保留意见 |\n"
        "| 一般缺陷 | 控制设计或运行中存在不足，但不构成重大或重要缺陷 | 定量<税前利润1% 且 定性影响有限 | 不影响审计意见 |\n\n"
        "### 当前缺陷分析\n\n"
        "**CTL-APPR-001 贷款审批分级授权 — 重大缺陷**\n\n"
        "- **缺陷性质**：设计缺陷 + 运行缺陷\n"
        "- **定量影响**：57个测试样本中12个越权审批(21.0%)，涉及金额4,260万元\n"
        "- **定性影响**：违反《商业银行内部控制指引》第28条分级授权要求\n"
        "- **根因分析**：RBAC权限模型粒度过粗，未按金额分级；审批日志未实时监控\n"
        "- **COSO映射**：控制活动(CA) - 原则10：选择和发展一般控制活动\n\n"
        "**CTL-COLL-003 抵押物评估独立复核 — 重要缺陷**\n\n"
        "- **缺陷性质**：运行缺陷\n"
        "- **定量影响**：15个样本中4个缺少独立复核记录(27%)，涉及评估值偏差>20%\n"
        "- **定性影响**：减值准备计提可能不足，影响财务报表准确性\n"
        "- **根因分析**：复核流程依赖人工触发，缺少系统强制节点\n"
        "- **COSO映射**：监控活动(MA) - 原则16：实施和进行持续和/或单独评估\n\n"
        "**CTL-KYC-002 客户尽调完整性 — 重要缺陷**\n\n"
        "- **缺陷性质**：运行缺陷\n"
        "- **定量影响**：12个样本中3个关键文档缺失(25%)\n"
        "- **定性影响**：客户风险评估不完整，可能漏报可疑交易\n"
        "- **根因分析**：KYC文档清单未系统化强制校核\n"
        "- **COSO映射**：风险评估(RA) - 原则7：识别和分析风险\n\n"
        "### 建议整改路线图\n\n"
        "| 时间线 | CTL-APPR-001 | CTL-COLL-003 | CTL-KYC-002 |\n"
        "|--------|-------------|-------------|------------|\n"
        "| Q3 第1月 | 权限矩阵设计 | 系统需求编写 | SOP更新 |\n"
        "| Q3 第2月 | ABAC开发 | 强制节点开发 | 系统校验上线 |\n"
        "| Q3 第3月 | UAT测试 | UAT测试 | UAT测试 |\n"
        "| Q4 第1月 | 生产上线 | 生产上线 | 生产上线 |\n"
        "| Q4 第2月 | 跟踪审计 | 跟踪审计 | 跟踪审计 |\n\n"
        "需要我生成详细的缺陷整改方案吗？"
    ),
}

# ─── English mock responses (used when language == 'en') ──────────────────

_MOCK_RESPONSES_EN: dict[str, str] = {
    "default": (
        "Hello! I'm the LuminFlow Intelligent Audit Assistant, specializing in "
        "Internal Control over Financial Reporting (ICFR) audits for personal loan businesses.\n\n"
        "I can assist you with:\n\n"
        "1. **Risk Analysis** — Identify risk points based on the COSO 2013 framework and assess residual risk levels\n"
        "2. **Sampling Recommendations** — Recommend audit sampling plans based on control attributes and risk levels\n"
        "3. **Impact Simulation** — Evaluate the propagation path and cascading effects of control deficiencies\n"
        "4. **Communication Support** — Translate technical findings into narratives tailored for different audiences\n"
        "5. **Audit Objective Management** — Track audit objective completion and analyze control deficiency severity\n"
        "6. **Team Collaboration** — Optimize PBC management, AI content approval workflows, and team communication\n\n"
        "How can I assist you today? You can click on the quick prompts below or describe your specific audit scenario."
    ),
    "risk": (
        "## Personal Loan ICFR Risk Analysis Report\n\n"
        "Based on the latest audit cycle, here is a comprehensive risk assessment covering all five COSO 2013 components:\n\n"
        "### High-Risk Areas (Residual Risk >= 18)\n\n"
        "| Control Domain | Control ID | Residual Risk | Key Issue |\n"
        "|--------|----------|----------|----------|\n"
        "| Control Activities | CTL-APPR-001 | 19.6 | Loan approval tiered authorization deviations; 21% override rate |\n"
        "| Risk Assessment | CTL-KYC-002 | 19.5 | Incomplete KYC documentation; 25% critical document missing rate |\n"
        "| Control Activities | CTL-COLL-003 | 19.2 | Independent collateral appraisal review mechanism ineffective |\n\n"
        "### Medium-Risk Areas (Residual Risk 13-18)\n\n"
        "| Control Domain | Control ID | Residual Risk | Key Issue |\n"
        "|--------|----------|----------|----------|\n"
        "| Monitoring Activities | CTL-MON-004 | 18.9 | Delayed post-loan early warning follow-up; T+3 closure rate only 62% |\n"
        "| Control Environment | CTL-ENV-005 | 15.2 | Inconsistent branch credit culture implementation |\n"
        "| Info & Communication | CTL-INFO-006 | 13.5 | Cross-departmental risk signal transmission lag |\n\n"
        "### Key Focus Areas\n\n"
        "1. **Approval Authority**: Recommend immediate redesign of the authority matrix using a 3-dimensional ABAC model (amount/product/region)\n"
        "2. **KYC Process**: Complete SOP updates and mandatory system validation features before Q3\n"
        "3. **Collateral Appraisal**: Introduce external appraiser rotation mechanism; increase independent review coverage to 100%\n\n"
        "Would you like me to conduct a deeper analysis on a specific control point?"
    ),
    "objective": (
        "## Audit Objectives & Control Point Analysis\n\n"
        "### Current Audit Objective Completion\n\n"
        "| Audit Objective | Status | Completion | Key Finding |\n"
        "|----------|------|--------|----------|\n"
        "| OBJ-01 Approval Authority Effectiveness | In Progress | 65% | 1 material weakness identified |\n"
        "| OBJ-02 KYC Due Diligence Completeness | In Progress | 72% | 1 significant deficiency identified |\n"
        "| OBJ-03 Collateral Appraisal Accuracy | In Progress | 58% | Insufficient test samples |\n"
        "| OBJ-04 Post-Loan Monitoring Timeliness | In Progress | 80% | No significant anomalies |\n"
        "| OBJ-05 System Access Control | Complete | 100% | No deficiencies |\n\n"
        "### COSO 2013 Five-Component Mapping\n\n"
        "- **Control Environment** (3 controls) — OBJ-01, OBJ-05, OBJ-11\n"
        "- **Risk Assessment** (4 controls) — OBJ-02, OBJ-06, OBJ-07, OBJ-12\n"
        "- **Control Activities** (6 controls) — OBJ-01, OBJ-03, OBJ-08, OBJ-09, OBJ-13, OBJ-14  Weak area\n"
        "- **Information & Communication** (2 controls) — OBJ-10, OBJ-15\n"
        "- **Monitoring Activities** (2 controls) — OBJ-04, OBJ-16  Weak area\n\n"
        "### Why Controls Are Flagged Red\n\n"
        "1. **Deviation Rate Exceeds Threshold**: Sample deviation rate > 1.5x the Tolerable Deviation Rate (TDR)\n"
        "2. **Inherent Risk x Control Risk**: Product exceeds the risk matrix red zone threshold (>=15)\n"
        "3. **Unremediated Historical Deficiencies**: Prior audit deficiencies not effectively remediated in follow-up\n"
        "4. **RAWTC Score**: Risk-Adjusted Weighted Total Control score >= 65\n\n"
        "### Prioritization\n\n"
        "1. CTL-APPR-001 Approval Authority — Material weakness with regulatory compliance risk\n"
        "2. CTL-KYC-002 Customer Due Diligence — Significant deficiency affecting risk assessment reliability\n"
        "3. CTL-COLL-003 Collateral Appraisal — Significant deficiency affecting impairment provisioning accuracy\n"
        "4. CTL-MON-004 Post-Loan Monitoring — Reportable condition with deteriorating trend\n\n"
        "Would you like me to generate detailed control remediation recommendations?"
    ),
    "sampling": (
        "## Audit Sampling Plan\n\n"
        "### Sampling Methodology\n\n"
        "Hybrid approach: **Attribute Sampling** + **Monetary Unit Sampling (MUS)**\n\n"
        "- **Tests of Controls**: Attribute sampling at 95% confidence, TDR = 8%\n"
        "- **Substantive Tests**: MUS method, weighted by carrying value\n\n"
        "### Sample Size Formula (AICPA Audit Sampling Guide 2023)\n\n"
        "> n = (N x Z^2 x p x (1-p)) / (N x E^2 + Z^2 x p x (1-p))\n\n"
        "Where Z = 1.96 (95% confidence), p = 0.5, E = 0.08\n\n"
        "### Sample Size Allocation\n\n"
        "| Control ID | Population | Base Sample | Adj. Factor | Final Sample | Reason |\n"
        "|----------|----------|------------|----------|------------|----------|\n"
        "| CTL-APPR-001 | 2,340 | 25 | x1.5 | **57** | RAWTC above threshold + deficiency history |\n"
        "| CTL-KYC-002 | 1,860 | 25 | x1.3 | **45** | KYC completeness non-compliance history |\n"
        "| CTL-COLL-003 | 420 | 20 | x1.2 | **31** | Appraisal value deviation > +/-15% |\n"
        "| CTL-MON-004 | 890 | 25 | x1.1 | **33** | Alert closure rate below target |\n"
        "| CTL-ENV-005 | 156 | 15 | x1.0 | **20** | No special factors |\n"
        "| **Total** | **5,666** | **110** | — | **186** | — |\n\n"
        "### Branch Sampling Distribution\n\n"
        "- Branch A (Shanghai): Largest PL balance (28%) -> 45 samples\n"
        "- Branch B (Shenzhen): Prior-year deficiency concentration -> 38 samples\n"
        "- Branch C (Beijing): New branch, control environment to verify -> 35 samples\n"
        "- Branch D (Guangzhou): High-risk product concentration -> 30 samples\n"
        "- Branch E (Chengdu): Medium-risk baseline -> 25 samples\n"
        "- Branch F (Wuhan): Low-risk control group -> 13 samples\n\n"
        "Would you like me to generate a detailed PBC request list?"
    ),
    "impact": (
        "## Control Deficiency Impact Simulation\n\n"
        "Starting from CTL-APPR-001 (approval authority deficiency), simulating cascading effects:\n\n"
        "### Propagation Path\n\n"
        "CTL-APPR-001 Failure\n"
        "  |-- Control Activities: Tiered authorization fails\n"
        "  |     |-- CTL-APPR-002 (Contract Review) -> Impact 0.72\n"
        "  |     +-- CTL-APPR-003 (Disbursement Approval) -> Impact 0.65\n"
        "  |-- Risk Assessment: Credit risk exposure increases\n"
        "  |     |-- Pre-lending rating model deviation -> Impact 0.58\n"
        "  |     +-- Risk provisioning insufficient -> Impact 0.51\n"
        "  |-- Info & Communication: Risk signal interrupted\n"
        "  |     +-- Incomplete management risk reports -> Impact 0.43\n"
        "  +-- Monitoring Activities: Anomaly detection degraded\n"
        "        +-- Continuous monitoring metrics distorted -> Impact 0.38\n\n"
        "### Estimated Impact\n\n"
        "| Dimension | Estimate | 95% CI |\n"
        "|----------|----------|----------|\n"
        "| New NPLs | 23M-31M | [18.5M, 34.5M] |\n"
        "| Credit Loss Increase | 2.8%-4.1% of PL profit | [2.3%, 4.7%] |\n"
        "| Regulatory Risk | Potential admin penalty | Medium-high probability |\n"
        "| Remediation ROI | 1.8M -> 15M loss reduction | ROI ~833% |\n\n"
        "### Mitigation\n\n"
        "1. **Immediate**: Suspend override approvals; enforce amount-tiered approval\n"
        "2. **Short-term**: Deploy Compensating Detective Controls\n"
        "3. **Medium-term**: Complete ABAC model design and go-live\n"
        "4. **Long-term**: Establish CSA and Continuous Monitoring mechanisms\n\n"
        "Would you like me to simulate cascading impacts for other control points?"
    ),
    "team": (
        "## Team Collaboration & Communication\n\n"
        "### Key Metrics by Stakeholder Priority\n\n"
        "| Priority | Metric | Stakeholder |\n"
        "|--------|------|------------|\n"
        "| P0 | Material weakness count & remediation | Audit Committee / CFO |\n"
        "| P0 | Regulatory compliance risk exposure | CCO / Legal |\n"
        "| P1 | Control test deviation rate trend | CAE |\n"
        "| P1 | PBC submission timeliness rate | PMO |\n"
        "| P2 | AI approval adoption rate | IT / Business Units |\n\n"
        "### AI Content Approval Best Practices\n\n"
        "1. **Tiered Approval**: L1 (auto-approved) -> L2 (AI + human review) -> L3 (mandatory human)\n"
        "2. **Audit Trail**: Complete logs for all AI-generated content approval decisions\n"
        "3. **Quality Sampling**: 5% post-hoc review of L1 AI content\n\n"
        "### Pending Approvals by Priority\n\n"
        "1. Urgent (24h): Audit adjustments, material weakness confirmation letter\n"
        "2. Important (48h): PBC follow-up list, working paper review\n"
        "3. Routine (72h): Working paper filing, weekly report compilation\n"
        "4. Deferrable (week): Lessons learned, knowledge base update\n\n"
        "Would you like me to help generate any communication materials?"
    ),
    "pbc": (
        "## PBC Overdue Item Handling Guide\n\n"
        "### Current Status\n\n"
        "| Status | Count | % | Priority |\n"
        "|------|------|------|------|\n"
        "| Overdue > 7 days | 12 | 8% | Escalate immediately |\n"
        "| Overdue 3-7 days | 18 | 12% | Active follow-up |\n"
        "| Overdue 1-3 days | 23 | 15% | Send reminder |\n"
        "| Submitted on time | 98 | 65% | Normal review |\n\n"
        "### Tiered Handling Process\n\n"
        "- **Tier 1** (1 day overdue): Auto-reminder email; yellow warning on dashboard\n"
        "- **Tier 2** (3 days): Phone/WeChat follow-up; update tracking sheet; assess timeline impact\n"
        "- **Tier 3** (7 days): Formal written notice to CFO level; mark as scope limitation risk\n"
        "- **Tier 4** (14 days): Partner communication with CEO/Audit Committee; evaluate opinion impact\n\n"
        "### Common Overdue Causes\n\n"
        "| Cause | % | Response |\n"
        "|----------|------|------|\n"
        "| Cross-department coordination | 35% | Identify data owners; issue coordination letter |\n"
        "| System extraction difficulties | 25% | Provide IT support and data extraction scripts |\n"
        "| Personnel travel/leave | 20% | Confirm backup; obtain temporary authorization |\n"
        "| Requirement misunderstanding | 15% | Schedule clarification meeting |\n"
        "| Insufficient cooperation | 5% | Escalate to management |\n\n"
        "Would you like me to help generate a PBC follow-up letter?"
    ),
    "progress": (
        "## Current Audit Progress Overview\n\n"
        "### Overall: 65% Complete\n\n"
        "| Phase | Status | Completion | Dates | Variance |\n"
        "|------|------|--------|----------|------|\n"
        "| I Planning | Complete | 100% | Jun 1-5 | 0 days |\n"
        "| II Execution | In Progress | 68% | Jun 6-22 | +2 days |\n"
        "| III Deficiency Eval | Not Started | 0% | Jun 21-28 | — |\n\n"
        "### Execution Phase Detail\n\n"
        "| Task | Status | % | Owner | Risk |\n"
        "|----------|------|------|------|------|\n"
        "| Control Test Execution | In Progress | 62% | Li Ming | PBC overdue impacts |\n"
        "| Substantive Testing | In Progress | 55% | Wang Fang | Branch data pending |\n"
        "| PBC Document Review | Normal | 78% | Zhang Wei | None |\n"
        "| Interview Notes | Complete | 100% | Zhao Li | None |\n"
        "| RCM Update | In Progress | 45% | Li Ming | Pending deficiency confirm |\n\n"
        "### Key Milestones\n\n"
        "- Jun 18: All control testing complete (currently 2 days behind)\n"
        "- Jun 20: PBC supplementary deadline (12 overdue items)\n"
        "- Jun 22: Deficiency evaluation kickoff\n"
        "- Jun 28: Draft audit report submission\n\n"
        "Would you like me to help develop a catch-up plan?"
    ),
    "control_deficiency": (
        "## Control Deficiency Severity Analysis\n\n"
        "### Classification (PCAOB AS 1305)\n\n"
        "| Level | Criteria | Opinion Impact |\n"
        "|------|----------|----------|\n"
        "| Material Weakness | Reasonable possibility of material misstatement not prevented/detected timely; >5% PBT or qualitatively significant | May result in adverse opinion |\n"
        "| Significant Deficiency | Less severe than MW but important to those charged with governance; >1% PBT or qualitatively important | May result in qualified opinion |\n"
        "| Reportable Condition | Shortcoming not rising to MW or SD level; <1% PBT and limited qualitative impact | No opinion impact |\n\n"
        "### Current Deficiencies\n\n"
        "**CTL-APPR-001 — Material Weakness**\n"
        "- 12 override approvals out of 57 samples (21.0%), 42.6M involved\n"
        "- Violates Article 28 of Commercial Bank Internal Control Guidelines\n"
        "- Root Cause: RBAC granularity too coarse; no real-time approval log monitoring\n"
        "- COSO: Control Activities (CA) — Principle 10\n\n"
        "**CTL-COLL-003 — Significant Deficiency**\n"
        "- 4 out of 15 samples missing independent review records (27%)\n"
        "- Appraisal value deviations >20%\n"
        "- Root Cause: Review process relies on manual triggers; no system-enforced checkpoints\n"
        "- COSO: Monitoring Activities (MA) — Principle 16\n\n"
        "**CTL-KYC-002 — Significant Deficiency**\n"
        "- 3 out of 12 samples missing critical documentation (25%)\n"
        "- Root Cause: KYC checklist not systematically enforced\n"
        "- COSO: Risk Assessment (RA) — Principle 7\n\n"
        "Would you like me to generate a detailed remediation plan?"
    ),
}

# ─── Unified mock lookup ────────────────────────────────────────────────────

_ALL_MOCK_RESPONSES: dict[str, dict[str, str]] = {
    "zh": _MOCK_RESPONSES,
    "en": _MOCK_RESPONSES_EN,
}


def _get_mock_response(category: str, language: str = "zh") -> str:
    """Get mock response text for the given category and language."""
    lang_responses = _ALL_MOCK_RESPONSES.get(language, _ALL_MOCK_RESPONSES["zh"])
    return lang_responses.get(category, lang_responses["default"])
    """Classify the user query to determine which mock response category to use.
    
    Checks all messages for keywords, giving higher weight to the most recent
    user message. Returns a key from _MOCK_RESPONSES.
    """
    # Build combined text from all user messages
    all_user_text = " ".join(
        m["content"] for m in messages if m.get("role") == "user"
    )
    last_msg = messages[-1]["content"] if messages else ""
    combined = (last_msg + " " + all_user_text).lower()

    # ── Keyword matching (order matters: specific → general) ──

    # PBC / overdue
    if any(kw in combined for kw in ("pbc", "逾期", "overdue", "提供资料", "客户提供")):
        return "pbc"

    # Progress / status
    if any(kw in combined for kw in ("进度", "概览", "进展", "状态", "progress", "status", "overview")):
        return "progress"

    # Control deficiency / severity
    if any(kw in combined for kw in (
        "标红", "严重程度", "缺陷", "重大缺陷",
        "flagged", "deficiency", "severity"
    )):
        return "control_deficiency"

    # COSO framework / objective completion / prioritization
    if any(kw in combined for kw in (
        "coso", "目标", "完成度", "优先", "映射", "控制点", "覆盖率", "覆盖", "趋势",
        "objective", "completion", "prioritize", "mapping", "control point", "coverage"
    )):
        return "objective"

    # Impact simulation (check before sampling to avoid "置信" keyword conflict)
    if any(kw in combined for kw in (
        "模拟", "影响", "连锁", "降低", "推荐方案", "传播",
        "impact", "simulation", "cascading", "mitigate", "recommendation"
    )):
        return "impact"

    # Sampling
    if any(kw in combined for kw in (
        "抽样", "样本", "置信", "分行", "历史",
        "sample", "sampling", "confidence", "branch", "historical"
    )):
        return "sampling"

    # Risk analysis
    if any(kw in combined for kw in (
        "风险", "重点", "关注",
        "risk", "focus", "key risk", "key area"
    )):
        return "risk"

    # Team / collaboration / approval / communication
    if any(kw in combined for kw in (
        "客户关注", "审批", "团队", "协作", "沟通", "待审批", "效率",
        "client", "approval", "team", "collaboration", "communication",
        "pending", "metric", "指标"
    )):
        return "team"

    # Default fallback
    return "default"


async def _mock_stream(messages: list[dict[str, str]], language: str = "zh") -> AsyncGenerator[str, None]:
    """Generate mock SSE stream based on user query classification."""
    category = _classify_query(messages)
    response_text = _get_mock_response(category, language)

    # Stream character by character (chunked for performance)
    chunk_size = 4
    for i in range(0, len(response_text), chunk_size):
        chunk = response_text[i : i + chunk_size]
        yield f"data: {json.dumps({'content': chunk, 'done': False}, ensure_ascii=False)}\n\n"

    yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"


# ─── LLM Streaming ──────────────────────────────────────────────────────────

async def _llm_stream(
    system_prompt: str, messages: list[dict[str, str]], language: str = "zh"
) -> AsyncGenerator[str, None]:
    """Stream from DeepSeek API via SSE."""
    api_key = os.getenv("DEEPSEEK_API_KEY")
    base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")

    if not api_key:
        async for chunk in _mock_stream(messages, language):
            yield chunk
        return

    try:
        all_messages = [{"role": "system", "content": system_prompt}] + messages

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{base_url}/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "deepseek-chat",
                    "messages": all_messages,
                    "temperature": 0.7,
                    "stream": True,
                },
            ) as resp:
                if resp.status_code != 200:
                    async for chunk in _mock_stream(messages, language):
                        yield chunk
                    return

                async for line in resp.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    data_str = line[6:]
                    if data_str.strip() == "[DONE]":
                        break
                    try:
                        data = json.loads(data_str)
                        delta = data.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            yield f"data: {json.dumps({'content': content, 'done': False}, ensure_ascii=False)}\n\n"
                    except (json.JSONDecodeError, IndexError, KeyError):
                        continue

        yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"

    except Exception:
        async for chunk in _mock_stream(messages, language):
            yield chunk


# ─── Route ───────────────────────────────────────────────────────────────────

@router.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """SSE streaming chat endpoint."""
    template = _load_template()

    # Build context-injected system prompt
    context = request.context or {}
    language = context.get("language", "zh")

    # Add language instruction to system prompt
    lang_instruction = (
        "\n\nYou MUST respond in English only."
        if language == "en"
        else "\n\n请始终使用中文回答。"
    )

    system_prompt = template["system_prompt"].format(
        user_role=request.role or "auditor",
        current_page=context.get("current_page", "dashboard"),
        selected_data=json.dumps(context.get("selected_data", {}), ensure_ascii=False),
    ) + lang_instruction

    # Convert messages to dict format
    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    return StreamingResponse(
        _llm_stream(system_prompt, messages, language),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
