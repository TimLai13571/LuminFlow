/**
 * 前端客户端 Mock 服务 — 当后端 Python 服务不可用时自动降级
 *
 * 与 server/routes/chat.py 的 _MOCK_RESPONSES + _classify_query 保持同步，
 * 提供一致的用户体验：后端在线 → 后端 mock/LLM；后端离线 → 前端 mock
 */

// ─── 关键词分类（与 chat.py _classify_query 优先级一致）─────────────────────

export function classifyQuery(messages: { role: string; content: string }[]): string {
  const allUserText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ')
  const lastMsg = messages[messages.length - 1]?.content || ''
  const combined = (lastMsg + ' ' + allUserText).toLowerCase()

  // PBC / overdue
  if (['pbc', '逾期', 'overdue', '提供资料', '客户提供'].some((kw) => combined.includes(kw)))
    return 'pbc'

  // Progress / status
  if (['进度', '概览', '进展', '状态', 'progress', 'status', 'overview'].some((kw) => combined.includes(kw)))
    return 'progress'

  // Control deficiency / severity
  if (['标红', '严重程度', '缺陷', '重大缺陷', 'flagged', 'deficiency', 'severity'].some((kw) =>
    combined.includes(kw)
  ))
    return 'control_deficiency'

  // COSO framework / objective completion / prioritization
  if (
    ['coso', '目标', '完成度', '优先', '映射', '控制点', '覆盖率', '覆盖', '趋势', 'objective', 'completion',
     'prioritize', 'mapping', 'control point', 'coverage'].some((kw) => combined.includes(kw))
  )
    return 'objective'

  // Impact simulation (before sampling to avoid "置信" conflict)
  if (
    ['模拟', '影响', '连锁', '降低', '推荐方案', '传播', 'impact', 'simulation', 'cascading', 'mitigate',
     'recommendation'].some((kw) => combined.includes(kw))
  )
    return 'impact'

  // Sampling
  if (
    ['抽样', '样本', '置信', '分行', '历史', 'sample', 'sampling', 'confidence', 'branch',
     'historical'].some((kw) => combined.includes(kw))
  )
    return 'sampling'

  // Risk analysis
  if (['风险', '重点', '关注', 'risk', 'focus', 'key risk', 'key area'].some((kw) => combined.includes(kw)))
    return 'risk'

  // Team / collaboration / approval / communication
  if (
    ['客户关注', '审批', '团队', '协作', '沟通', '待审批', '效率', 'client', 'approval', 'team', 'collaboration',
     'communication', 'pending', 'metric', '指标'].some((kw) => combined.includes(kw))
  )
    return 'team'

  return 'default'
}

// ─── Mock 回复数据（与后端 _MOCK_RESPONSES 语义一致）─────────────────

export type MockLanguage = 'zh' | 'en'

const MOCK_RESPONSES_ZH: Record<string, string> = {
  default: `您好！我是 LuminFlow 智能审计助手，专注于银行个人贷款业务的内部控制与财务报告(ICFR)审计。

我可以帮助您进行：

1. **风险分析** — 基于 COSO 2013 框架识别业务流程中的风险点，评估残余风险水平
2. **抽样建议** — 根据控制属性、风险等级和历史缺陷推荐审计抽样方案
3. **影响模拟** — 评估控制缺陷在COSO五要素框架内的传播路径和连锁影响
4. **沟通协助** — 将技术发现转化为面向CFO、内审团队、IT部门等不同受众的叙述
5. **审计目标管理** — 追踪审计目标完成度，分析控制缺陷严重程度
6. **团队协作** — 优化PBC管理、AI内容审批流程和团队沟通效率

请问您需要哪方面的帮助？您可以直接点击下方的快捷问题，或描述具体的审计场景。`,

  risk: `## 个贷业务 ICFR 风险分析报告

基于最新一期审计数据，我对个贷业务流程进行了全面的风险评估，覆盖 COSO 2013 五大要素：

### 🔴 高风险领域（残余风险 ≥ 18）

| 控制域 | 控制编号 | 残余风险 | 主要问题 |
|--------|----------|----------|----------|
| 控制活动 | CTL-APPR-001 | 19.6 | 贷款审批分级授权执行存在偏差，越权审批率21% |
| 风险评估 | CTL-KYC-002 | 19.5 | 客户尽调文档完整性不足，关键文档缺失率25% |
| 控制活动 | CTL-COLL-003 | 19.2 | 抵押物评估独立复核机制运行失效 |

### 🟡 中风险领域（残余风险 13-18）

| 控制域 | 控制编号 | 残余风险 | 主要问题 |
|--------|----------|----------|----------|
| 监控活动 | CTL-MON-004 | 18.9 | 贷后预警跟进时效性不足，T+3闭环率仅62% |
| 控制环境 | CTL-ENV-005 | 15.2 | 分行信贷文化执行不一致 |
| 信息与沟通 | CTL-INFO-006 | 13.5 | 风险信号跨部门传递存在时滞 |

### 重点关注事项

1. **审批授权**：建议立即启动权限矩阵重构，实施基于金额/产品/区域的三维度ABAC模型
2. **KYC流程**：需在Q3前完成客户尽调标准操作流程(SOP)更新和系统强制校验功能上线
3. **抵押物评估**：建议引入外部评估机构轮换机制，内部复核覆盖率提升至100%

需要我对某个具体控制点做深入分析吗？`,

  objective: `## 审计目标与控制点分析

### 当前审计目标完成度

| 审计目标 | 状态 | 完成度 | 关键发现 |
|----------|------|--------|----------|
| OBJ-01 审批授权有效性 | 🔴 进行中 | 65% | 发现1项重大缺陷 |
| OBJ-02 KYC尽调完整性 | 🟡 进行中 | 72% | 发现1项重要缺陷 |
| OBJ-03 抵押物评估准确性 | 🟡 进行中 | 58% | 测试样本不足 |
| OBJ-04 贷后监控及时性 | 🟢 进行中 | 80% | 未发现显著异常 |
| OBJ-05 系统访问控制 | 🟢 已完成 | 100% | 无缺陷 |

### COSO 2013 五要素映射

当前审计覆盖的17个控制点与COSO框架的映射关系如下：

- **控制环境** (3个控制点) — OBJ-01, OBJ-05, OBJ-11
- **风险评估** (4个控制点) — OBJ-02, OBJ-06, OBJ-07, OBJ-12
- **控制活动** (6个控制点) — OBJ-01, OBJ-03, OBJ-08, OBJ-09, OBJ-13, OBJ-14 ⚠️ 薄弱环节
- **信息与沟通** (2个控制点) — OBJ-10, OBJ-15
- **监控活动** (2个控制点) — OBJ-04, OBJ-16 ⚠️ 薄弱环节

### 控制点标红原因分析

控制点被标红（高风险）通常基于以下综合判断：

1. **测试偏差率超阈值**：样本偏差率超过可容忍偏差率(TDR)的1.5倍
2. **固有风险×控制风险**：乘积超过风险矩阵红色区域阈值(≥15)
3. **历史缺陷未整改**：上期审计发现的缺陷在跟踪审计中确认未有效整改
4. **RAWTC评分**：风险权重调整后的综合评分≥65分

### 优先级建议

基于风险导向审计原则，建议按以下优先级处理：

1. ⚠️ **CTL-APPR-001 审批授权** — 重大缺陷，存在监管合规风险
2. ⚠️ **CTL-KYC-002 客户尽调** — 重要缺陷，影响风险评估可靠性
3. ⚠️ **CTL-COLL-003 抵押物评估** — 重要缺陷，影响减值准备计提准确性
4. ⚠️ **CTL-MON-004 贷后监控** — 一般缺陷，但趋势恶化

需要我生成具体的控制缺陷整改建议吗？`,

  sampling: `## 审计抽样方案

### 抽样方法论

本次审计采用**属性抽样(Attribute Sampling)**与**货币单位抽样(MUS)**相结合的混合策略：

- **控制测试**：采用属性抽样，置信水平95%，可容忍偏差率(TDR)设定为8%
- **实质性测试**：采用MUS方法，基于账面价值加权抽取

### 样本量计算逻辑

依据 AICPA Audit Sampling Guide (2023)，样本量计算公式为：

> n = (N × Z² × p × (1-p)) / (N × E² + Z² × p × (1-p))

其中 Z=1.96(95%置信), p=0.5(最大方差), E=0.08(可容忍误差)

### 各控制样本量分配

| 控制编号 | 总体数量 | 基准样本量 | 调整因子 | 最终样本量 | 调整原因 |
|----------|----------|------------|----------|------------|----------|
| CTL-APPR-001 | 2,340 | 25 | ×1.5 | **57** | RAWTC超阈值+缺陷历史 |
| CTL-KYC-002 | 1,860 | 25 | ×1.3 | **45** | KYC完整性历史不达标 |
| CTL-COLL-003 | 420 | 20 | ×1.2 | **31** | 评估值偏差＞±15% |
| CTL-MON-004 | 890 | 25 | ×1.1 | **33** | 预警闭环率低于目标 |
| CTL-ENV-005 | 156 | 15 | ×1.0 | **20** | 无特殊因子 |
| **合计** | **5,666** | **110** | — | **186** | — |

### 分行抽样分布

选择以下6家分行作为抽样单元：

- 分行A（上海）：个贷余额最大，占总量的28% → 分配45个样本
- 分行B（深圳）：上年缺陷集中地区 → 分配38个样本
- 分行C（北京）：新开业分行，控制环境待验证 → 分配35个样本
- 分行D（广州）：高风险产品集中 → 分配30个样本
- 分行E（成都）：中等风险基准 → 分配25个样本
- 分行F（武汉）：低风险对照 → 分配13个样本

需要我生成详细的PBC请求清单吗？`,

  impact: `## 控制缺陷影响模拟分析

### 模拟场景设定

基于 CTL-APPR-001（审批授权缺陷）为起点，模拟控制失效在COSO五要素间的传播路径：

### 影响传播路径

CTL-APPR-001 失效
  ├──→ 控制活动层：分级授权机制失效
  │     ├──→ CTL-APPR-002（合同审核）依赖失效 → 影响度 0.72
  │     └──→ CTL-APPR-003（放款审批）依赖失效 → 影响度 0.65
  ├──→ 风险评估层：信用风险暴露增加
  │     ├──→ 贷前评级模型偏差扩大 → 影响度 0.58
  │     └──→ 风险拨备计提不足 → 影响度 0.51
  ├──→ 信息沟通层：风险信号传递中断
  │     └──→ 管理层风险报告不完整 → 影响度 0.43
  └──→ 监控活动层：异常检测能力下降
        └──→ 持续监控指标失真 → 影响度 0.38

### 量化影响估算

| 影响维度 | 数值估算 | 置信区间(95%) |
|----------|----------|---------------|
| 预计新增不良贷款 | ¥2,300万-¥3,100万 | [1,850万, 3,450万] |
| 预计信贷损失增幅 | 个贷利润的2.8%-4.1% | [2.3%, 4.7%] |
| 监管合规风险 | 可能面临行政处罚 | 中高概率 |
| 整改投入产出比 | 180万投入→降低损失1,500万 | ROI ≈ 833% |

### 连锁反应评估

**一级效应**：审批缺陷直接导致不合格贷款放行  
**二级效应**：不良贷款增加触发风险拨备补充，影响当期利润  
**三级效应**：连续两个季度拨备增加引发监管关注和投资者质疑

### 缓释建议

1. **紧急**：暂停超权限审批功能，强制实施金额分层审批
2. **短期**：部署补偿性检测控制(Compensating Detective Controls)
3. **中期**：完成ABAC权限模型设计和系统上线
4. **长期**：建立控制自我评估(CSA)和持续监控(CM)机制

需要我对其他控制点的连锁影响进行模拟吗？`,

  team: `## 团队协作与沟通建议

### 客户关注的核心指标

根据审计委员会和高级管理层的关注重点，以下是指标优先级矩阵：

| 优先级 | 指标 | 利益相关方 | 关注原因 |
|--------|------|------------|----------|
| P0 | 重大缺陷数量及整改状态 | 审计委员会/CFO | 直接影响审计意见 |
| P0 | 监管合规风险敞口 | CCO/法务 | 行政处罚风险 |
| P1 | 控制测试偏差率趋势 | 内审总监 | 内控有效性判断 |
| P1 | PBC提供及时率 | PMO | 影响审计进度 |
| P2 | AI审批采纳率 | IT/业务部门 | 流程数字化转型 |

### AI内容审批最佳实践

1. **分层审批机制**：根据内容敏感度设置三级审批流程
   - L1：常规技术描述 → AI自动通过
   - L2：风险评级结论 → AI建议+人工复核
   - L3：审计意见/监管报告 → 强制人工审批
2. **审批记录可追溯**：所有AI生成内容的审批决策需保留完整日志
3. **定期质量抽检**：按5%比例对L1级别AI内容进行事后抽查

### 待审批项优先级排列

1. 🔴 **紧急—24h内**：审计调整分录、重大缺陷确认函
2. 🟡 **重要—48h内**：PBC跟进清单、测试底稿审阅
3. 🟢 **常规—72h内**：工作底稿归档、周报汇总
4. ⚪ **可延后—本周**：经验教训总结、知识库更新

需要我帮助您生成任何沟通材料吗？`,

  pbc: `## PBC（客户提供资料）逾期项处理指南

### 当前PBC状态概览

| 状态 | 数量 | 占比 | 处理优先级 |
|------|------|------|------------|
| 🔴 逾期>7天 | 12项 | 8% | 紧急升级 |
| 🟡 逾期3-7天 | 18项 | 12% | 主动跟进 |
| 🟠 逾期1-3天 | 23项 | 15% | 提醒催办 |
| 🟢 已按时提供 | 98项 | 65% | 正常审阅 |

### 分级处理流程

**第一级 — 自动提醒（逾期1天）**  
系统自动发送提醒邮件至客户对接人，在审计进度面板标记黄色预警。

**第二级 — 主动跟进（逾期3天）**  
审计助理电话/微信联系客户对接人确认原因，更新PBC跟踪表，记录逾期原因和预计提供时间，评估对审计进度的影响。

**第三级 — 正式升级（逾期7天）**  
发送正式书面通知至客户财务总监/CFO级别，在审计状态报告中标记为"范围受限"风险项，审计经理评估是否需调整审计程序。

**第四级 — 高层沟通（逾期14天）**  
审计合伙人直接与客户CEO/审计委员会沟通，评估对审计意见类型的潜在影响，考虑是否需要出具"范围受限"的保留意见。

### 常见逾期原因及应对

| 逾期原因 | 占比 | 应对策略 |
|----------|------|----------|
| 数据需跨部门协调 | 35% | 协助客户明确数据Owner，出具协调函 |
| 系统数据导出困难 | 25% | 安排IT支持，提供数据提取脚本 |
| 业务人员出差/休假 | 20% | 确认Backup人员，获取临时授权 |
| 对需求理解有偏差 | 15% | 安排需求澄清会议 |
| 主观配合意愿不足 | 5% | 升级至管理层沟通 |

需要我帮您生成PBC催办函或更新PBC跟踪表吗？`,

  progress: `## 本期审计进度概览

### 整体进度仪表盘

████████████░░░░░░░░░░░░░░░░  65% 整体完成度

### 三阶段进度明细

| 阶段 | 状态 | 完成度 | 计划时间 | 实际/预计 | 偏差 |
|------|------|--------|----------|-----------|------|
| Ⅰ 计划阶段 | 🟢 已完成 | 100% | 6/1-6/5 | 6/1-6/5 | 0天 |
| Ⅱ 实施阶段 | 🟡 进行中 | 68% | 6/6-6/20 | 6/6-6/22 | +2天 |
| Ⅲ 缺陷评价 | ⚪ 未开始 | 0% | 6/21-6/28 | — | — |

### 实施阶段详细状态

| 任务模块 | 状态 | 完成度 | 负责人 | 关键风险 |
|----------|------|--------|--------|----------|
| 控制测试执行 | 🟡 进行中 | 62% | 李明 | PBC逾期影响测试进度 |
| 实质性测试 | 🟡 进行中 | 55% | 王芳 | 个别分行数据未到齐 |
| PBC资料审阅 | 🟢 正常 | 78% | 张伟 | 无 |
| 访谈纪要整理 | 🟢 已完成 | 100% | 赵丽 | 无 |
| 风险控制矩阵更新 | 🟡 进行中 | 45% | 李明 | 待缺陷确认后更新 |

### 关键里程碑预警

- ⚠️ **6月18日**：控制测试需全部完成（当前偏差2天）
- ⚠️ **6月20日**：PBC补充资料截止日（12项逾期需加速跟进）
- 📌 **6月22日**：缺陷评价阶段启动会
- 📌 **6月28日**：审计报告初稿提交

需要我协助制定具体的赶工计划吗？`,

  control_deficiency: `## 控制缺陷严重程度分析

### 缺陷分类标准

根据 PCAOB AS 1305 和 COSO 内部控制框架，缺陷分为三级：

| 等级 | 定义 | 判定标准 | 审计意见影响 |
|------|------|----------|-------------|
| 重大缺陷 | 存在合理可能性导致重大错报且无法被及时防止或发现 | 定量>税前利润5% 或 定性影响重大 | 可能导致否定意见 |
| 重要缺陷 | 重要性不及重大缺陷，但足以引起财务报告监督者注意 | 定量>税前利润1% 或 定性影响较大 | 可能导致保留意见 |
| 一般缺陷 | 控制设计或运行中存在不足，但不构成重大或重要缺陷 | 定量<税前利润1% 且 定性影响有限 | 不影响审计意见 |

### 当前缺陷分析

**CTL-APPR-001 贷款审批分级授权 — 重大缺陷**  
- **缺陷性质**：设计缺陷 + 运行缺陷  
- **定量影响**：57个测试样本中12个越权审批(21.0%)，涉及金额4,260万元  
- **定性影响**：违反《商业银行内部控制指引》第28条分级授权要求  
- **根因分析**：RBAC权限模型粒度过粗，未按金额分级；审批日志未实时监控  
- **COSO映射**：控制活动(CA) - 原则10：选择和发展一般控制活动

**CTL-COLL-003 抵押物评估独立复核 — 重要缺陷**  
- **缺陷性质**：运行缺陷  
- **定量影响**：15个样本中4个缺少独立复核记录(27%)，评估值偏差>20%  
- **定性影响**：减值准备计提可能不足，影响财务报表准确性  
- **根因分析**：复核流程依赖人工触发，缺少系统强制节点  
- **COSO映射**：监控活动(MA) - 原则16：实施和进行持续和/或单独评估

**CTL-KYC-002 客户尽调完整性 — 重要缺陷**  
- **缺陷性质**：运行缺陷  
- **定量影响**：12个样本中3个关键文档缺失(25%)  
- **定性影响**：客户风险评估不完整，可能漏报可疑交易  
- **根因分析**：KYC文档清单未系统化强制校核  
- **COSO映射**：风险评估(RA) - 原则7：识别和分析风险

需要我生成详细的缺陷整改方案吗？`,
}

// ─── 英文 Mock 回复 ─────────────────────────────────────────────────────────

const MOCK_RESPONSES_EN: Record<string, string> = {
  default: `Hello! I'm the LuminFlow Intelligent Audit Assistant, specializing in Internal Control over Financial Reporting (ICFR) audits for personal loan businesses.

I can assist you with:

1. **Risk Analysis** — Identify risk points in business processes based on the COSO 2013 framework and assess residual risk levels
2. **Sampling Recommendations** — Recommend audit sampling plans based on control attributes, risk levels, and historical deficiencies
3. **Impact Simulation** — Evaluate the propagation path and cascading effects of control deficiencies across the five COSO components
4. **Communication Support** — Translate technical findings into narratives tailored for different audiences such as CFO, internal audit team, and IT department
5. **Audit Objective Management** — Track audit objective completion and analyze control deficiency severity
6. **Team Collaboration** — Optimize PBC management, AI content approval workflows, and team communication efficiency

How can I assist you today? You can click on the quick prompts below or describe your specific audit scenario.`,

  risk: `## Personal Loan ICFR Risk Analysis Report

Based on the latest audit cycle data, I have conducted a comprehensive risk assessment covering all five COSO 2013 components:

### 🔴 High-Risk Areas (Residual Risk ≥ 18)

| Control Domain | Control ID | Residual Risk | Key Issue |
|--------|----------|----------|----------|
| Control Activities | CTL-APPR-001 | 19.6 | Deviations in tiered loan approval authority; 21% override rate |
| Risk Assessment | CTL-KYC-002 | 19.5 | Incomplete KYC documentation; 25% missing critical documents |
| Control Activities | CTL-COLL-003 | 19.2 | Independent collateral appraisal review mechanism is ineffective |

### 🟡 Medium-Risk Areas (Residual Risk 13–18)

| Control Domain | Control ID | Residual Risk | Key Issue |
|--------|----------|----------|----------|
| Monitoring Activities | CTL-MON-004 | 18.9 | Delayed post-loan early warning follow-up; T+3 closure rate only 62% |
| Control Environment | CTL-ENV-005 | 15.2 | Inconsistent branch credit culture implementation |
| Information & Communication | CTL-INFO-006 | 13.5 | Cross-departmental risk signal transmission lag |

### Key Focus Areas

1. **Approval Authority**: Recommend immediate launch of authority matrix redesign, implementing a 3-dimensional ABAC model based on amount/product/region
2. **KYC Process**: Complete SOP updates and mandatory system validation features before Q3
3. **Collateral Appraisal**: Introduce external appraiser rotation mechanism with independent review coverage increased to 100%

Would you like me to conduct a deeper analysis on a specific control point?`,

  objective: `## Audit Objectives & Control Point Analysis

### Current Audit Objective Completion Status

| Audit Objective | Status | Completion | Key Finding |
|----------|------|--------|----------|
| OBJ-01 Approval Authority Effectiveness | 🔴 In Progress | 65% | 1 material weakness identified |
| OBJ-02 KYC Due Diligence Completeness | 🟡 In Progress | 72% | 1 significant deficiency identified |
| OBJ-03 Collateral Appraisal Accuracy | 🟡 In Progress | 58% | Insufficient test samples |
| OBJ-04 Post-Loan Monitoring Timeliness | 🟢 In Progress | 80% | No significant anomalies |
| OBJ-05 System Access Control | 🟢 Complete | 100% | No deficiencies |

### COSO 2013 Five-Component Mapping

The 17 control points covered in the current audit are mapped to the COSO framework as follows:

- **Control Environment** (3 controls) — OBJ-01, OBJ-05, OBJ-11
- **Risk Assessment** (4 controls) — OBJ-02, OBJ-06, OBJ-07, OBJ-12
- **Control Activities** (6 controls) — OBJ-01, OBJ-03, OBJ-08, OBJ-09, OBJ-13, OBJ-14 ⚠️ Weak area
- **Information & Communication** (2 controls) — OBJ-10, OBJ-15
- **Monitoring Activities** (2 controls) — OBJ-04, OBJ-16 ⚠️ Weak area

### Why Controls Are Flagged Red

Controls are flagged red (high risk) based on the following comprehensive assessment:

1. **Test Deviation Rate Exceeds Threshold**: Sample deviation rate exceeds 1.5× the Tolerable Deviation Rate (TDR)
2. **Inherent Risk × Control Risk**: Product exceeds the risk matrix red zone threshold (≥15)
3. **Unremediated Historical Deficiencies**: Deficiencies from prior audits confirmed as not effectively remediated in follow-up
4. **RAWTC Score**: Risk-Adjusted Weighted Total Control score ≥ 65

### Prioritization Recommendations

Based on risk-based audit principles, recommend the following priority order:

1. ⚠️ **CTL-APPR-001 Approval Authority** — Material weakness with regulatory compliance risk
2. ⚠️ **CTL-KYC-002 Customer Due Diligence** — Significant deficiency affecting risk assessment reliability
3. ⚠️ **CTL-COLL-003 Collateral Appraisal** — Significant deficiency affecting impairment provisioning accuracy
4. ⚠️ **CTL-MON-004 Post-Loan Monitoring** — Reportable condition with deteriorating trend

Would you like me to generate detailed control remediation recommendations?`,

  sampling: `## Audit Sampling Plan

### Sampling Methodology

This audit employs a hybrid approach combining **Attribute Sampling** and **Monetary Unit Sampling (MUS)**:

- **Tests of Controls**: Attribute sampling at 95% confidence level with a Tolerable Deviation Rate (TDR) of 8%
- **Substantive Tests**: MUS method, weighted extraction based on carrying value

### Sample Size Calculation Logic

Per AICPA Audit Sampling Guide (2023), the sample size formula is:

> n = (N × Z² × p × (1-p)) / (N × E² + Z² × p × (1-p))

Where Z = 1.96 (95% confidence), p = 0.5 (maximum variance), E = 0.08 (tolerable error)

### Sample Size Allocation by Control

| Control ID | Population | Base Sample | Adjustment Factor | Final Sample | Adjustment Reason |
|----------|----------|------------|----------|------------|----------|
| CTL-APPR-001 | 2,340 | 25 | ×1.5 | **57** | RAWTC above threshold + deficiency history |
| CTL-KYC-002 | 1,860 | 25 | ×1.3 | **45** | Historical KYC completeness non-compliance |
| CTL-COLL-003 | 420 | 20 | ×1.2 | **31** | Appraisal value deviation > ±15% |
| CTL-MON-004 | 890 | 25 | ×1.1 | **33** | Alert closure rate below target |
| CTL-ENV-005 | 156 | 15 | ×1.0 | **20** | No special factors |
| **Total** | **5,666** | **110** | — | **186** | — |

### Branch Sampling Distribution

The following 6 branches are selected as sampling units:

- Branch A (Shanghai): Largest personal loan balance, 28% of total → 45 samples
- Branch B (Shenzhen): Concentration of prior-year deficiencies → 38 samples
- Branch C (Beijing): Newly established branch, control environment to be verified → 35 samples
- Branch D (Guangzhou): Concentration of high-risk products → 30 samples
- Branch E (Chengdu): Medium-risk baseline → 25 samples
- Branch F (Wuhan): Low-risk control group → 13 samples

Would you like me to generate a detailed PBC request list?`,

  impact: `## Control Deficiency Impact Simulation Analysis

### Simulation Scenario Setup

Taking CTL-APPR-001 (approval authority deficiency) as the starting point, simulating the propagation path of control failure across the five COSO components:

### Impact Propagation Path

CTL-APPR-001 Failure
  ├──→ Control Activities: Tiered authorization mechanism fails
  │     ├──→ CTL-APPR-002 (Contract Review) dependency failure → Impact 0.72
  │     └──→ CTL-APPR-003 (Disbursement Approval) dependency failure → Impact 0.65
  ├──→ Risk Assessment: Credit risk exposure increases
  │     ├──→ Pre-lending rating model deviation expands → Impact 0.58
  │     └──→ Risk provisioning insufficient → Impact 0.51
  ├──→ Information & Communication: Risk signal transmission interrupted
  │     └──→ Incomplete management risk reports → Impact 0.43
  └──→ Monitoring Activities: Anomaly detection capability degraded
        └──→ Continuous monitoring metric distortion → Impact 0.38

### Quantified Impact Estimates

| Impact Dimension | Estimated Value | 95% Confidence Interval |
|----------|----------|---------------|
| Estimated New NPLs | ¥23M–¥31M | [¥18.5M, ¥34.5M] |
| Estimated Credit Loss Increase | 2.8%–4.1% of PL profit | [2.3%, 4.7%] |
| Regulatory Compliance Risk | Potential administrative penalty | Medium-high probability |
| Remediation ROI | ¥1.8M investment → ¥15M loss reduction | ROI ≈ 833% |

### Cascading Effects Assessment

**Primary Effect**: Approval deficiency directly results in non-qualifying loan disbursements  
**Secondary Effect**: NPL increase triggers risk provision replenishment, impacting current period profit  
**Tertiary Effect**: Two consecutive quarters of increased provisioning trigger regulatory scrutiny and investor concerns

### Mitigation Recommendations

1. **Immediate**: Suspend override approval functionality; enforce amount-tiered approval
2. **Short-term**: Deploy Compensating Detective Controls
3. **Medium-term**: Complete ABAC model design and system go-live
4. **Long-term**: Establish Control Self-Assessment (CSA) and Continuous Monitoring (CM) mechanisms

Would you like me to simulate cascading impacts for other control points?`,

  team: `## Team Collaboration & Communication Recommendations

### Client-Focused Key Metrics

Based on the audit committee and senior management's focus areas, here is the metric priority matrix:

| Priority | Metric | Stakeholder | Reason for Focus |
|--------|------|------------|----------|
| P0 | Material weakness count & remediation status | Audit Committee / CFO | Directly impacts audit opinion |
| P0 | Regulatory compliance risk exposure | CCO / Legal | Administrative penalty risk |
| P1 | Control test deviation rate trend | CAE | Internal control effectiveness assessment |
| P1 | PBC submission timeliness rate | PMO | Impacts audit timeline |
| P2 | AI approval adoption rate | IT / Business Units | Process digital transformation |

### AI Content Approval Best Practices

1. **Tiered Approval Mechanism**: Three-level approval workflow based on content sensitivity
   - L1: Routine technical descriptions → AI auto-approved
   - L2: Risk rating conclusions → AI recommendation + human review
   - L3: Audit opinions / regulatory reports → Mandatory human approval
2. **Audit Trail**: All AI-generated content approval decisions must retain complete logs
3. **Periodic Quality Sampling**: 5% post-hoc review of L1 AI content on a sampling basis

### Pending Approvals by Priority

1. 🔴 **Urgent – within 24h**: Audit adjustments, material weakness confirmation letter
2. 🟡 **Important – within 48h**: PBC follow-up list, test working paper review
3. 🟢 **Routine – within 72h**: Working paper filing, weekly report compilation
4. ⚪ **Deferrable – within the week**: Lessons learned summary, knowledge base update

Would you like me to help you generate any communication materials?`,

  pbc: `## PBC (Provided by Client) Overdue Item Handling Guide

### Current PBC Status Overview

| Status | Count | Percentage | Handling Priority |
|------|------|------|------------|
| 🔴 Overdue > 7 days | 12 items | 8% | Escalate immediately |
| 🟡 Overdue 3–7 days | 18 items | 12% | Active follow-up |
| 🟠 Overdue 1–3 days | 23 items | 15% | Send reminder |
| 🟢 Submitted on time | 98 items | 65% | Normal review |

### Tiered Handling Process

**Tier 1 — Automatic Reminder (overdue by 1 day)**  
System automatically sends reminder email to client liaison; marks yellow warning on audit progress dashboard.

**Tier 2 — Active Follow-up (overdue by 3 days)**  
Audit assistant contacts client liaison via phone/WeChat to confirm reason; updates PBC tracking sheet with reason and estimated submission date; assesses impact on audit timeline.

**Tier 3 — Formal Escalation (overdue by 7 days)**  
Issues formal written notice to client CFO/Director level; marks as "scope limitation" risk item in audit status report; audit manager assesses whether alternative procedures are required.

**Tier 4 — Senior Communication (overdue by 14 days)**  
Engagement partner directly communicates with client CEO / Audit Committee; evaluates potential impact on audit opinion type; considers whether a qualified opinion due to scope limitation is warranted.

### Common Overdue Causes & Responses

| Overdue Cause | Percentage | Response Strategy |
|----------|------|----------|
| Cross-departmental data coordination needed | 35% | Assist client in identifying data owners; issue coordination letter |
| System data extraction difficulties | 25% | Arrange IT support; provide data extraction scripts |
| Business personnel travel / leave | 20% | Confirm backup personnel; obtain temporary authorization |
| Misunderstanding of requirements | 15% | Schedule requirement clarification meeting |
| Insufficient willingness to cooperate | 5% | Escalate to management communication |

Would you like me to help you generate a PBC follow-up letter or update the PBC tracking sheet?`,

  progress: `## Current Audit Progress Overview

### Overall Progress Dashboard

████████████░░░░░░░░░░░░░░░░  65% Overall Completion

### Three-Phase Progress Detail

| Phase | Status | Completion | Planned Dates | Actual / Estimated | Variance |
|------|------|--------|----------|-----------|------|
| I Planning | 🟢 Complete | 100% | Jun 1 – Jun 5 | Jun 1 – Jun 5 | 0 days |
| II Execution | 🟡 In Progress | 68% | Jun 6 – Jun 20 | Jun 6 – Jun 22 | +2 days |
| III Deficiency Evaluation | ⚪ Not Started | 0% | Jun 21 – Jun 28 | — | — |

### Execution Phase Detailed Status

| Task Module | Status | Completion | Owner | Key Risk |
|----------|------|--------|--------|----------|
| Control Test Execution | 🟡 In Progress | 62% | Li Ming | PBC overdue impacts testing progress |
| Substantive Testing | 🟡 In Progress | 55% | Wang Fang | Individual branch data not yet received |
| PBC Document Review | 🟢 Normal | 78% | Zhang Wei | None |
| Interview Notes Compilation | 🟢 Complete | 100% | Zhao Li | None |
| Risk Control Matrix Update | 🟡 In Progress | 45% | Li Ming | Pending deficiency confirmation |

### Key Milestone Alerts

- ⚠️ **Jun 18**: All control testing to be completed (currently 2 days behind)
- ⚠️ **Jun 20**: PBC supplementary data deadline (12 overdue items require accelerated follow-up)
- 📌 **Jun 22**: Deficiency evaluation phase kickoff meeting
- 📌 **Jun 28**: Draft audit report submission

Would you like me to help develop a specific catch-up plan?`,

  control_deficiency: `## Control Deficiency Severity Analysis

### Deficiency Classification Criteria

Per PCAOB AS 1305 and the COSO Internal Control Framework, deficiencies are classified into three levels:

| Level | Definition | Criteria | Audit Opinion Impact |
|------|------|----------|-------------|
| Material Weakness | Reasonable possibility that a material misstatement would not be prevented or detected on a timely basis | Quantitative > 5% of PBT OR qualitatively significant | May result in adverse opinion |
| Significant Deficiency | Less severe than a material weakness, yet important enough to merit attention by those charged with governance | Quantitative > 1% of PBT OR qualitatively important | May result in qualified opinion |
| Reportable Condition | Shortcoming in the design or operation of a control that does not constitute a material weakness or significant deficiency | Quantitative < 1% of PBT AND limited qualitative impact | No impact on audit opinion |

### Current Deficiency Analysis

**CTL-APPR-001 Loan Approval Tiered Authorization — Material Weakness**  
- **Deficiency Nature**: Design deficiency + Operating deficiency  
- **Quantitative Impact**: 12 override approvals out of 57 test samples (21.0%), involving ¥42.6M  
- **Qualitative Impact**: Violation of Article 28 of the Commercial Bank Internal Control Guidelines on tiered authorization  
- **Root Cause**: RBAC model granularity too coarse; no real-time monitoring of approval logs  
- **COSO Mapping**: Control Activities (CA) – Principle 10: Selects and develops general control activities

**CTL-COLL-003 Independent Collateral Appraisal Review — Significant Deficiency**  
- **Deficiency Nature**: Operating deficiency  
- **Quantitative Impact**: 4 out of 15 samples missing independent review records (27%), appraisal value deviations > 20%  
- **Qualitative Impact**: Impairment provisioning may be insufficient, affecting financial statement accuracy  
- **Root Cause**: Review process relies on manual triggers; lacks system-enforced checkpoints  
- **COSO Mapping**: Monitoring Activities (MA) – Principle 16: Conducts ongoing and/or separate evaluations

**CTL-KYC-002 Customer Due Diligence Completeness — Significant Deficiency**  
- **Deficiency Nature**: Operating deficiency  
- **Quantitative Impact**: 3 out of 12 samples missing critical documentation (25%)  
- **Qualitative Impact**: Incomplete customer risk assessment; risk of unreported suspicious transactions  
- **Root Cause**: KYC document checklist not systematically enforced  
- **COSO Mapping**: Risk Assessment (RA) – Principle 7: Identifies and analyzes risks

Would you like me to generate a detailed deficiency remediation plan?`,
}

// ─── 语言 → 回复映射 ──────────────────────────────────────────────────────

const MOCK_RESPONSES_MAP: Record<MockLanguage, Record<string, string>> = {
  zh: MOCK_RESPONSES_ZH,
  en: MOCK_RESPONSES_EN,
}

// ─── 模拟 SSE 流式传输 ────────────────────────────────────────────────────

export type StreamCallback = (data: { content: string; done: boolean }) => void

/**
 * 模拟 SSE 流式回复，逐步逐块输出文本
 *
 * @param category - 回复类别（对应 MOCK_RESPONSES 的 key）
 * @param language - 回复语言 ('zh' | 'en')，默认 'zh'
 * @param onChunk - 每块文本的回调，模拟 { content, done } 结构
 * @param signal - 可选的 AbortSignal，用于取消流式传输
 */
export function simulateMockStream(
  category: string,
  language: MockLanguage,
  onChunk: StreamCallback,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve) => {
    const responses = MOCK_RESPONSES_MAP[language] || MOCK_RESPONSES_MAP.zh
    const text = responses[category] || responses.default
    let index = 0

    const pushNext = () => {
      if (signal?.aborted) {
        resolve()
        return
      }

      if (index >= text.length) {
        onChunk({ content: '', done: true })
        resolve()
        return
      }

      // 模拟 LLM 输出：随机块大小 (3-8 字符) + 随机延迟 (15-45ms)
      const chunkSize = 3 + Math.floor(Math.random() * 6)
      const chunk = text.slice(index, index + chunkSize)
      index += chunkSize

      onChunk({ content: chunk, done: false })

      const delay = 15 + Math.floor(Math.random() * 30)
      setTimeout(pushNext, delay)
    }

    // 初始延迟模拟"思考"
    setTimeout(pushNext, 200 + Math.random() * 200)
  })
}

/**
 * 获取指定分类和语言的完整 mock 回复文本（用于非流式场景）
 */
export function getMockResponse(category: string, language: MockLanguage = 'zh'): string {
  const responses = MOCK_RESPONSES_MAP[language] || MOCK_RESPONSES_MAP.zh
  return responses[category] || responses.default
}
