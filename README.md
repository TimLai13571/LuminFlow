
<p align="center">
  <h1 align="center">🔍 LuminFlow</h1>
  <p align="center"><strong>AI 驱动的智能审计透明度平台</strong></p>
  <p align="center">让每一次审计决策都有据可依，让团队协作透明可追溯</p>
</p>

---

## 📖 项目简介

LuminFlow 是一个面向审计领域的 AI 驱动透明协作平台，基于 COSO 2013 内控框架构建。平台覆盖审计全流程——从目标设定、风险评估、智能抽样到影响模拟与报告生成，通过 AI 引擎和交互式可视化，将复杂的审计工作流转化为直观、可协作的数字化体验。

**核心价值**：提升审计过程的可视化程度、团队协作效率与最终结果的可信度。

---

## ✨ 核心功能

### 📊 仪表盘 (Dashboard)
一站式审计门户，提供关键 KPI 指标卡、风险热力图、活动时间线、待办事项和审计阶段进度追踪。

### 🎯 审计目标设定 (Audit Objectives)
- **目标树 (TraceMap)**：以交互式 D3 力导向图展示审计目标与子目标的层级关系
- **COSO 控制矩阵**：逐节点配置控制措施，实时查看覆盖率与风险敞口
- **AI 洞察面板**：根据目标配置自动生成风险提示和关注建议

### 🔬 智能抽样 (Smart Sampling)
- 支持分层抽样、货币单位抽样等多种统计方法
- AI 推荐最优样本量和参数组合
- 可视化抽样逻辑（旭日图、历史柱状图）让决策过程透明
- 事件增强面板，灵活添加审计发现

### 💥 影响分析 (Impact Simulator)
- 配置风险事件、调整参数（概率、影响、控制有效性）
- 实时 D3 力导向图展示风险传播路径
- AI 生成建议与缓解措施
- 多情景对比表，辅助管理层决策

### 🌡️ 热力透镜 (HeatLens)
- 全维度风险因子评分与权重配置
- 交互式热力图（ECharts）按流程/部门/风险类型着色
- 风险驱动因子拆解分析

### 🧠 AI 审计助手
- 上下文感知的智能问答，支持所有模块的即时咨询
- 快速提示词 (Quick Prompts) 覆盖常见审计场景
- SSE 流式响应，实时生成答案
- **离线 Mock 降级**：无需 API Key 也能正常演示

### 🖊️ 审计叙事 (NarrativeLens)
- 审计发现自动转化为结构化叙事
- 多受众适配（董事会 / 管理层 / 运营团队）
- 内置审批流程与版本管理

### 📋 PBC 视图 (PBCView)
- PBC (Provided by Client) 请求清单管理与统计
- 逾期预警与进度追踪
- 一键生成 PBC 邮件草稿

### 👥 团队协作 (Team Panel)
- 多角色权限控制（审计经理 / 高级审计师 / 初级审计师）
- 热门提问与知识共享
- 审批队列与证据复核
- 内容发布与可见性管理

### 🌐 国际化
- 完整的中英文双语支持
- UI 文本、数据字段、AI 回复均可切换语言
- 基于 Zustand + 翻译字典的轻量方案

### 🎬 Remotion 演示视频生成
- 基于 React 组件渲染专业产品演示动画
- 覆盖六大核心功能模块
- 支持字幕旁白同步

---

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | React 19 + TypeScript 6.0 | 函数式组件 + Hooks |
| **构建工具** | Vite 8 | 极速 HMR 热更新 |
| **CSS 框架** | TailwindCSS 3.4 | 原子化 CSS，shadcn/ui 组件体系 |
| **状态管理** | Zustand 5 | 轻量、类型安全 |
| **数据获取** | TanStack React Query + Axios | 缓存与请求管理 |
| **可视化** | D3.js 7 + ECharts 6 + Recharts | 图表与交互图形 |
| **动效** | Framer Motion 12 | 声明式动画 |
| **后端框架** | Python FastAPI | 异步 REST API |
| **ASGI 服务器** | Uvicorn | 高性能异步服务 |
| **AI 引擎** | DeepSeek API (可选) | 4 大 AI Pipeline |
| **流式响应** | SSE (sse-starlette) | 实时推送 AI 生成内容 |
| **视频渲染** | Remotion 4 | React 驱动的视频生成框架 |

---

## 🚀 快速开始

### 环境要求

| 工具 | 最低版本 | 推荐版本 |
|------|----------|----------|
| Node.js | ≥ 18.0 | 20.x LTS |
| npm | ≥ 9.0 | 最新版 |
| Python | ≥ 3.11 | 3.12.x |
| pip | ≥ 23.0 | 最新版 |

### Windows 一键启动

```bash
# 双击项目根目录下的
一键启动.bat
```

脚本会自动检测环境 → 安装依赖 → 复制 `.env` → 启动前后端。

### 手动启动

```bash
# 1. 克隆仓库
git clone git@github.com:TimLai13571/LuminFlow.git
cd LuminFlow

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填写 API Key（可选，不填则使用 Mock 降级）

# 3. 启动后端 (Python)
cd server
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 4. 新建终端，启动前端
cd ..
npm install
npm run dev
```

浏览器访问 `http://localhost:5173` 即可看到 LuminFlow 审计门户。

> **零配置即可跑通全流程**：即使不填写 DeepSeek API Key，所有 AI 功能自动降级为本地 Mock 响应。

---

## 📂 项目结构

```
LuminFlow/
├── src/                          # 前端源码 (React + TypeScript)
│   ├── components/
│   │   ├── ai/                   # AI 对话面板
│   │   ├── dashboard/            # 仪表板图表与卡片
│   │   ├── heatlens/             # 热力透镜风险评估
│   │   ├── impact/               # 影响模拟器
│   │   ├── layout/               # 全局布局 (侧边栏/顶栏/语言切换)
│   │   ├── narrative/            # 审计叙事生成
│   │   ├── objective/            # 审计目标树与 TraceMap
│   │   ├── pbcview/              # PBC 请求管理
│   │   ├── sampling/             # 智能抽样配置
│   │   ├── team/                 # 团队协作面板
│   │   └── ui/                   # 通用 UI 组件 (shadcn/ui)
│   ├── pages/                    # 8 个功能页面入口
│   ├── hooks/                    # 自定义数据获取 Hook
│   ├── services/                 # Mock 数据服务层
│   ├── store/                    # Zustand 状态管理 (auth/language/ui)
│   ├── locales/                  # 中英文翻译字典
│   ├── types/                    # TypeScript 类型定义
│   ├── lib/                      # 常量/工具函数/权限控制
│   ├── data/                     # JSON 静态数据 (COSO/RCM/风险因子)
│   └── remotion/                 # Remotion 演示视频组件
├── server/                       # 后端源码 (Python FastAPI)
│   ├── engines/                  # 4 大 AI 引擎 (Chat/Sampling/Impact/Narrative)
│   ├── models/                   # Pydantic 数据模型
│   ├── prompts/                  # YAML Prompt 模板库
│   ├── routes/                   # API 路由定义
│   ├── scripts/                  # 视频生成辅助脚本
│   └── main.py                   # FastAPI 入口
├── public/                       # 静态资源 (favicon/图标/截图/音频)
├── docs/demo/                    # 交互式演示页面与字幕
├── package.json                  # 前端依赖与 npm scripts
├── server/requirements.txt       # 后端 Python 依赖
├── .env.example                  # 环境变量模板
├── DEPLOY.md                     # 详细部署说明
├── 一键启动.bat                   # Windows 一键启动脚本
└── README.md                     # 本文件
```

---

## 📖 使用说明

### 角色切换
平台内置三种审计角色，可通过顶部角色切换器切换：
- **审计经理 (Audit Manager)**：全局视角，可配置项目、审批报告
- **高级审计师 (Senior Auditor)**：可执行抽样、影响分析、审批 PBC
- **初级审计师 (Junior Auditor)**：可查看仪表盘、提交发现、请求 PBC

### AI 助手使用
点击右下角浮动 AI 按钮打开对话面板，可：
1. 选择预设快速提示词（如"分析当前风险热力图"）
2. 自由输入审计相关问题
3. 在任意模块中获取上下文感知的建议

### 工作流示例
```
Dashboard (查看全局状态)
  → Audit Objectives (设定审计目标与范围)
  → HeatLens (识别高风险领域)
  → Smart Sampling (选取抽样样本)
  → PBCView (管理客户提供的资料)
  → Impact Simulator (评估风险事件影响)
  → NarrativeLens (生成审计报告)
  → Team Panel (审批与发布)
```

---

## 🚢 部署

### 生产构建

```bash
# 前端构建
npm run build          # 输出到 dist/
npm run preview        # 本地预览构建结果

# 后端部署
cd server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `VITE_API_URL` | 是 | 后端 API 地址，默认 `http://localhost:8000` |
| `DEEPSEEK_API_KEY` | 否 | DeepSeek API Key，不填则 Mock 降级 |
| `DEEPSEEK_BASE_URL` | 否 | DeepSeek API 地址，默认官方地址 |
| `ARK_API_KEY` | 否 | 火山方舟 API Key（Seedance 视频生成） |

详细部署说明请参阅 [DEPLOY.md](./DEPLOY.md)。

---

## 🤝 贡献指南

本项目为 Hackathon 参赛项目，欢迎提交 Issue 和 Pull Request。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范，使用中文描述：

| 前缀 | 用途 | 示例 |
|------|------|------|
| `feat` | 新增功能 | `feat(Dashboard): 添加实时KPI趋势图` |
| `fix` | Bug 修复 | `fix(Sampling): 修复样本量计算精度` |
| `chore` | 构建/依赖 | `chore: 更新.gitignore排除规则` |
| `docs` | 文档变更 | `docs: 完善API文档` |
| `refactor` | 重构 | `refactor: 统一状态管理为Zustand` |

---

## 📄 许可证

本项目基于 [MIT License](https://opensource.org/licenses/MIT) 开源。

---

<p align="center">
  <sub>Built with ❤️ by the LuminFlow Team</sub>
</p>
