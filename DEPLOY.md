# LuminFlow 部署说明

> **适用版本**：v1.0.0 | **最后更新**：2026-06-16  
> 本文档说明如何在全新环境中从零启动 LuminFlow 前后端服务。

---

## 一、压缩包内容说明

### ✅ 包含的文件与目录

| 路径 | 说明 |
|------|------|
| `src/` | 前端全部源代码（React + TypeScript） |
| `public/` | 静态资源（favicon、图标等） |
| `server/` | 后端全部源代码（Python FastAPI），**已剔除 `__pycache__/`** |
| `index.html` | 前端入口 HTML |
| `package.json` | 前端依赖声明与 npm scripts |
| `package-lock.json` | 前端依赖版本锁定（保证一致安装） |
| `tsconfig.json` | TypeScript 编译配置 |
| `tsconfig.node.json` | Vite Node 端 TS 配置 |
| `vite.config.ts` | Vite 构建配置 |
| `tailwind.config.ts` | TailwindCSS 配置 |
| `postcss.config.js` | PostCSS 配置 |
| `components.json` | shadcn/ui 组件配置 |
| `.env.example` | 环境变量模板（前后端通用） |
| `.gitignore` | Git 忽略规则 |
| `一键启动.bat` | Windows 一键启动脚本（自动检测环境+安装依赖+启动服务） |
| `DEPLOY.md` | 本文档 |

### ❌ 排除的文件与目录

| 路径 | 排除原因 |
|------|----------|
| `node_modules/` | 体积巨大（~500MB），通过 `npm install` 重建 |
| `dist/` | 构建产物，通过 `npm run build` 生成 |
| `.git/` | Git 历史，非运行必需 |
| `server/__pycache__/` | Python 字节码缓存 |
| `.env` | 可能包含真实 API Key，用 `.env.example` 替代 |
| `*.local` | 本地开发配置 |
| `.vscode/` / `.idea/` | 个人编辑器配置 |
| `*.suo`, `*.ntvs*`, `*.sln` | Windows IDE 临时文件 |
| `.DS_Store` | macOS 系统文件 |
| `logs/`, `*.log` | 日志文件 |

---

## 二、环境要求

### 最低版本

| 工具 | 版本要求 | 验证命令 |
|------|----------|----------|
| **Node.js** | ≥ 18.0 | `node -v` |
| **npm** | ≥ 9.0 | `npm -v` |
| **Python** | ≥ 3.11 | `python --version` 或 `python3 --version` |
| **pip** | ≥ 23.0 | `pip --version` |

### 推荐版本（开发时使用）

| 工具 | 版本 |
|------|------|
| Node.js | 20.x LTS |
| Python | 3.12.x |

---

## 三、快速启动

### 🚀 方式一：一键启动（Windows，推荐）

> 自动检测环境 → 安装依赖 → 启动前后端，只需双击一个文件。

1. 解压 `LuminFlow.zip` 到任意目录
2. 双击项目根目录下的 **`一键启动.bat`**
3. 等待自动检测和安装（首次约 2-5 分钟）
4. 两个新窗口分别运行后端和前端，浏览器访问 `http://localhost:5173`

脚本会自动完成以下操作：
- 检测 Node.js / npm / Python / pip 是否安装
- 缺失环境时给出清晰的下载指引
- 自动从 `.env.example` 创建 `.env` 配置文件
- 自动 `npm install` 前端依赖
- 自动 `pip install -r requirements.txt` 后端依赖
- 依次启动后端 (端口 8000) 和前端 (端口 5173)

### 方式二：手动逐步启动

#### 步骤 1：解压文件

```bash
# Windows (PowerShell)
Expand-Archive -Path LuminFlow.zip -DestinationPath ./LuminFlow

# macOS / Linux
unzip LuminFlow.zip -d LuminFlow
```

```bash
cd LuminFlow
```

### 步骤 2：配置环境变量

项目根目录已提供 `.env.example` 模板文件。

```bash
# 复制为实际使用的 .env 文件
cp .env.example .env
```

编辑 `.env` 文件，根据需要填写：

```env
# ============ 前端 (Vite) ============
VITE_API_URL=http://localhost:8000

# ============ 后端 (Python) ============
# DeepSeek API Key — 可选，不填则使用内置 Mock 降级
DEEPSEEK_API_KEY=sk-your-key-here

# DeepSeek API 地址 — 可选，默认官方地址
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

> ⚠️ **重要**：`DEEPSEEK_API_KEY` 为可选项。即使不填，AI 功能会自动降级为本地 Mock 响应，所有页面仍可正常演示。这意味着**零配置即可跑通全流程**。

### 步骤 3：启动后端 (Python FastAPI)

```bash
cd server

# 安装 Python 依赖
pip install -r requirements.txt

# 启动后端服务（开发模式，支持热重载）
# Windows
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# macOS / Linux（如遇 python 命令不可用，改用 python3）
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**验证**：浏览器访问 [http://localhost:8000/docs](http://localhost:8000/docs) 应看到 Swagger API 文档页面。

**验证健康检查**：
```bash
curl http://localhost:8000/api/health
# 返回: {"status":"healthy","service":"LuminFlow AI Backend","version":"1.0.0","pipelines":[...]}
```

### 步骤 4：启动前端 (React + Vite)

打开**新的终端窗口**，回到项目根目录：

```bash
cd ..    # 回到 LuminFlow/ 根目录

# 安装前端依赖
npm install

# 启动开发服务器
npm run dev
```

**验证**：浏览器访问 [http://localhost:5173](http://localhost:5173) 应看到 LuminFlow 审计门户页面。

---

## 四、npm Scripts 速查

| 命令 | 用途 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器（HMR 热更新） |
| `npm run build` | TypeScript 类型检查 + 生产构建 |
| `npm run preview` | 本地预览生产构建结果 |

---

## 五、项目结构速查

```
LuminFlow/
├── src/
│   ├── components/       ← 按功能模块分组的 UI 组件
│   │   ├── ai/           ← AI 对话面板相关
│   │   ├── dashboard/    ← 仪表板图表组件
│   │   ├── impact/       ← 影响模拟器组件
│   │   ├── objective/    ← 审计目标树组件
│   │   ├── sampling/     ← 抽样分析组件
│   │   ├── team/         ← 团队协作组件
│   │   ├── layout/       ← 全局布局（侧边栏/顶栏）
│   │   └── ui/           ← 通用 UI 基础组件
│   ├── pages/            ← 5 个页面入口
│   ├── hooks/            ← 自定义数据获取 Hook
│   ├── services/         ← Mock 数据服务层
│   ├── store/            ← Zustand 状态管理
│   ├── types/            ← TypeScript 类型定义
│   ├── lib/              ← 常量/工具函数
│   └── data/             ← JSON 静态数据
├── server/
│   ├── engines/          ← 4 大 AI 引擎
│   ├── models/           ← Pydantic 数据模型
│   ├── prompts/          ← YAML Prompt 模板
│   ├── routes/           ← API 路由
│   └── main.py           ← FastAPI 入口
├── public/               ← 静态资源
├── package.json          ← 前端依赖
├── .env.example          ← 环境变量模板
├── 一键启动.bat           ← Windows 一键启动脚本
└── DEPLOY.md             ← 本文档
```

---

## 六、跨平台兼容性

### 已验证

| 平台 | 前端 (Vite) | 后端 (Python) |
|------|-------------|---------------|
| Windows 10/11 | ✅ | ✅ |
| macOS (Apple Silicon) | ✅ | ✅ |
| Linux (Ubuntu 22.04+) | ✅ | ✅ |

### 注意事项

1. **Python 命令差异**  
   - Windows：使用 `python` 和 `pip`  
   - macOS/Linux：部分系统需用 `python3` 和 `pip3`  
   - 使用 `python -m uvicorn` 可避免路径问题

2. **端口占用**  
   - 后端默认 **8000**，前端默认 **5173**  
   - 如端口被占用：后端修改 `--port` 参数，前端 Vite 会自动尝试下一个可用端口

3. **路径分隔符**  
   - 所有 import 使用正斜杠 `/`（跨平台兼容）  
   - Python 使用 `pathlib.Path` 处理路径（已内置）

4. **Node.js 版本**  
   - 项目使用 `type: "module"`（ESM），需要 Node.js ≥ 14，推荐 ≥ 18

---

## 七、常见问题

### Q1: `npm install` 很慢或失败？

```bash
# 使用国内镜像（清华源）
npm config set registry https://registry.npmmirror.com
npm install
```

### Q2: `pip install` 报错？

```bash
# 确保 pip 是最新版
python -m pip install --upgrade pip

# 使用国内镜像（清华源）
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### Q3: 前端页面显示但数据为空？

- 确认后端已启动（访问 `http://localhost:8000/api/health` 验证）
- 确认 `.env` 中 `VITE_API_URL=http://localhost:8000` 正确
- 前端使用 Mock 数据降级，即使后端未启动，页面也应正常渲染

### Q4: AI 对话没有响应？

- 检查 `.env` 中 `DEEPSEEK_API_KEY` 是否填写
- 未填写时自动使用 Mock 降级（返回预设回复），不影响演示

### Q5: 一键启动.bat 双击后闪退？

**最常见原因：系统缺少 Node.js 或 Python 环境。**

排查步骤：
1. 打开命令行（Win+R → 输入 `cmd` → 回车）
2. 依次执行以下命令验证环境：
   ```
   node -v
   npm -v
   python --version
   ```
3. 如任一命令提示"不是内部或外部命令"，说明该工具未安装或未加入 PATH
4. 安装缺失的工具后重新双击 `一键启动.bat`

> 脚本已针对 Windows CMD 兼容性优化（不使用 chcp 65001），不会因编码问题导致闪退。

### Q6: 端口被占用如何修改？

后端端口修改：
```bash
uvicorn main:app --reload --port 8001
```
同时更新 `.env` 中 `VITE_API_URL=http://localhost:8001`，然后重启前端。

---

## 八、依赖清单

### 前端 (package.json)

| 类别 | 包名 | 用途 |
|------|------|------|
| 框架 | react, react-dom | UI 框架 |
| 路由 | react-router-dom | 页面路由 |
| 状态 | zustand | 轻量状态管理 |
| 数据 | @tanstack/react-query, axios | 服务端数据获取 |
| 可视化 | d3, echarts, echarts-for-react, recharts | 图表与图形 |
| 样式 | tailwindcss, autoprefixer, postcss | CSS 框架 |
| 工具 | framer-motion, lucide-react, clsx, tailwind-merge, class-variance-authority | 动效/图标/工具 |
| 开发 | typescript, vite, @vitejs/plugin-react | 编译与构建 |

### 后端 (requirements.txt)

| 包名 | 用途 |
|------|------|
| fastapi | Web 框架 |
| uvicorn[standard] | ASGI 服务器 |
| httpx | 异步 HTTP 客户端（调用 DeepSeek API） |
| pydantic ≥ 2.0 | 数据验证与序列化 |
| python-dotenv | 环境变量加载 |
| pyyaml | YAML Prompt 模板解析 |
| sse-starlette | SSE 流式响应支持 |
