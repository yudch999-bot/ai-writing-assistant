# 墨笔 AI · 公众号智能写作助手

> AI 赋能公众号创作 · 风格复刻 · 热点追踪 · 内容规划 · 爆款标题 · 内容检测 · 精美排版

基于 DeepSeek / OpenAI / Claude / SiliconFlow 多模型驱动的公众号内容创作平台，提供从选题到发布的全链路 AI 辅助工具。

---

## 功能一览

| 功能 | 说明 |
|------|------|
| 🎨 **风格复刻** | 输入文章链接或内容，AI 分析写作风格，生成可复用的专属提示词 |
| 🔥 **热点追踪** | 覆盖微博、百度、头条、抖音、知乎 5 大平台，每日自动轮换，AI 一键改写 |
| 🏷️ **标题生成** | 按主题、内容类型、目标人群、风格批量生成爆款标题，支持联网搜索 |
| 📝 **文章生成** | 输入标题和需求，AI 一键生成完整公众号文章，支持联网搜索 + 中途取消 |
| ✍️ **文章仿写** | 粘贴原文链接或内容，AI 深度改写，100% 原创 |
| 🔍 **内容检测** | AI 痕迹检测、敏感词检查、原创度评估，支持一键优化 |
| 📱 **公众号排版** | 15 套精品模板 + 6 种排版组件（提示框/引用卡片/金句/对比/Q&A/要点），一键复制到公众号编辑器 |
| 🌐 **多平台矩阵** | 为朋友圈、微博、小红书、知乎、抖音等平台分别生成适配内容 |
| 📅 **内容规划** | AI 推荐选题 + 选题池 + 内容日历 + 状态流转，从灵感到发布全管线管理 |
| 🤖 **智能体** | 自定义写作 AI，设定角色人设和风格，AI 辅助生成人设描述 |
| 📚 **知识库** | 上传文档或链接，供 AI 写作时参考 |
| 📑 **文章模板** | 预设文章结构模板，快速开始创作，支持自定义 CRUD |
| 💾 **历史记录** | 自动保存所有生成内容，重启不丢失 |

## 技术栈

- **框架**: Next.js 15 (App Router) + React 19
- **样式**: Tailwind CSS 4 + 深色/浅色/跟随系统 三主题
- **AI**: 多模型支持（DeepSeek / OpenAI / Claude / SiliconFlow）
- **搜索**: 多层搜索降级（公开 API + DuckDuckGo Instant Answer）
- **测试**: Jest + Testing Library
- **PWA**: 可安装桌面应用

## 快速开始

### 环境要求

- Node.js 18+
- AI API Key（任选一家）

### 安装

```bash
# 克隆仓库
git clone https://github.com/yudch999-bot/ai-writing-assistant.git
cd ai-writing-assistant

# 安装依赖
npm install

# 开发模式启动（端口 3333）
npm run dev -- -p 3333

# 或构建后启动（生产模式）
npm run build
npm start -- -p 3333
```

访问 http://localhost:3333

### 配置 API Key

**方式一（推荐 · 安全）：设置服务端环境变量**

```bash
export DEEPSEEK_API_KEY=sk-your-key-here
```
启动后无需在前端配置 Key，API 请求通过服务端转发，Key 不会暴露给浏览器。

**方式二：前端设置页面**

1. 打开 http://localhost:3333/settings
2. 选择 AI 模型提供商（DeepSeek / OpenAI / Claude / SiliconFlow）
3. 填入对应的 API Key
4. 点击「保存配置」并「测试连接」

## 新功能亮点

### 🎯 多模型切换

不再局限于单一模型。在设置页可以选择不同 AI 提供商：

| 提供商 | 可用模型 | 环境变量 |
|--------|---------|---------|
| DeepSeek | deepseek-chat, deepseek-reasoner | `DEEPSEEK_API_KEY` |
| OpenAI | gpt-4o-mini, gpt-4o, gpt-4.1-nano | `OPENAI_API_KEY` |
| Claude | claude-sonnet-4, claude-haiku-4 | `ANTHROPIC_API_KEY` |
| SiliconFlow | DeepSeek-V3, DeepSeek-R1 | `SILICONFLOW_API_KEY` |

### 📱 PWA 支持

支持安装为桌面应用，离线也可查看历史记录和知识库。

### 📑 文章模板

预设公众号爆款文、干货教程文、热点评论文 3 个模板，支持自定义创建和编辑。

### 🛑 生成取消

文章生成过程中可随时取消，无需干等。

### 💾 数据持久化

所有用户数据通过服务端 JSON 文件持久化存储，**重启电脑/清浏览器缓存不会丢失**。同时以 localStorage 作为兜底。

## 项目结构

```
src/
├── app/
│   ├── api/                    # 后端 API 路由
│   │   ├── chat/              # AI 多模型代理
│   │   ├── fetch-url/         # 文章链接抓取
│   │   ├── hot/               # 热点数据 API
│   │   ├── search/            # 联网搜索
│   │   └── storage/           # 本地文件持久化存储
│   ├── agents/                # 智能体页面
│   ├── article-generation/    # 文章生成页面
│   ├── content-detection/     # 内容检测页面
│   ├── content-plan/          # 内容规划页面
│   ├── formatting/            # 公众号排版页面
│   ├── history/               # 历史记录页面
│   ├── hot-topics/            # 热点追踪页面
│   ├── knowledge-base/        # 知识库页面
│   ├── multi-platform/        # 多平台矩阵页面
│   ├── rewriting/             # 文章仿写页面
│   ├── settings/              # 设置中心页面
│   ├── style-clone/           # 风格复刻页面
│   ├── templates/             # 文章模板页面
│   └── title-generator/       # 标题生成页面
├── components/
│   ├── SaveButton.tsx         # 保存到历史记录
│   ├── Sidebar.tsx            # 侧边导航
│   ├── ThemeProvider.tsx       # 主题切换
│   ├── Toast.tsx              # 全局提示
│   ├── TopBar.tsx             # 顶部导航栏
│   └── WebSearchToggle.tsx    # 联网搜索开关
├── lib/
│   ├── ai.ts                  # AI 调用封装（多模型支持）
│   ├── export.ts              # Markdown/HTML 导出
│   ├── useCopy.ts             # 复制功能
│   ├── usePersistentStorage.ts # 本地文件持久化存储 Hook
│   ├── useSavedContent.ts     # 历史记录存储
│   └── useSEO.ts              # 页面 SEO 标题
├── __tests__/                 # 单元测试
└── data/                      # 本地持久化数据（自动生成）
```

## 运行测试

```bash
npm test
```

## 开机自启（macOS）

已配置 LaunchAgent，开机自动启动 + 崩溃重启：

```bash
# 注册服务
launchctl load ~/Library/LaunchAgents/com.ai-writing-assistant.plist

# 查看状态
launchctl list | grep ai-writing-assistant

# 查看日志
tail -f .next/logs/stdout.log
```

## License

MIT
