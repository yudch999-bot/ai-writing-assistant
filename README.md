# 墨笔 AI · 公众号智能写作助手

> AI 赋能公众号创作 · 风格复刻 · 热点追踪 · 内容规划 · 爆款标题 · 内容检测

基于 DeepSeek 大模型的公众号内容创作平台，提供从选题到发布的全链路 AI 辅助工具。

---

## 功能一览

| 功能 | 说明 |
|------|------|
| 🎨 **风格复刻** | 输入文章链接或内容，AI 分析写作风格，生成可复用的专属提示词 |
| 🔥 **热点追踪** | 覆盖微博、百度、头条、抖音、知乎、微信 6 大平台热点，支持联网刷新 |
| 🏷️ **标题生成** | 按主题、内容类型、目标人群、风格批量生成爆款标题 |
| 📝 **文章生成** | 输入标题和需求，AI 一键生成完整公众号文章，支持联网搜索 |
| ✍️ **文章仿写** | 粘贴原文链接或内容，AI 深度改写，100% 原创 |
| 🔍 **内容检测** | AI 痕迹检测、敏感词检查、原创度评估，支持一键优化 |
| 📱 **公众号排版** | Markdown 写作，一键排版，支持复制到公众号编辑器 |
| 🌐 **多平台矩阵** | 为朋友圈、微博、小红书、知乎等平台分别生成适配内容 |
| 📅 **内容规划** | AI 推荐选题 + 选题池 + 内容日历，从灵感到发布全管线管理 |
| 🤖 **智能体** | 自定义写作 AI，设定角色人设和风格 |
| 📚 **知识库** | RAG 知识库，上传文档供 AI 写作时参考 |
| 💾 **历史记录** | 自动保存所有生成内容，刷新不丢失 |

## 技术栈

- **框架**: Next.js 15 (App Router) + React 19
- **样式**: Tailwind CSS 4 + 深色主题
- **AI**: DeepSeek API
- **搜索**: DuckDuckGo Instant Answer API
- **部署**: Node.js

## 快速开始

### 环境要求

- Node.js 18+
- DeepSeek API Key（[免费注册](https://platform.deepseek.com/)）

### 安装

```bash
# 克隆仓库
git clone https://github.com/yudch999-bot/ai-writing-assistant.git
cd ai-writing-assistant

# 安装依赖
npm install

# 构建
npm run build

# 启动
npm start
```

访问 http://localhost:3333

### 配置 API Key

1. 打开设置页 http://localhost:3333/settings
2. 填入 DeepSeek API Key
3. 点击「保存配置」并「测试连接」
4. 所有 AI 功能即刻可用

## 项目结构

```
src/
├── app/
│   ├── api/                    # 后端 API 路由
│   │   ├── chat/              # DeepSeek API 代理
│   │   ├── fetch-url/         # 文章链接抓取
│   │   └── search/            # 联网搜索
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
│   └── title-generator/       # 标题生成页面
├── components/
│   ├── SaveButton.tsx         # 保存到历史记录
│   ├── Sidebar.tsx            # 侧边导航
│   ├── ThemeProvider.tsx      # 主题切换
│   ├── Toast.tsx              # 全局提示
│   ├── TopBar.tsx             # 顶部导航栏
│   └── WebSearchToggle.tsx    # 联网搜索开关
└── lib/
    ├── ai.ts                  # AI 调用封装
    ├── useCopy.ts             # 复制功能
    └── useSavedContent.ts     # 历史记录存储
```

## 使用截图

> 启动后访问 http://localhost:3333 查看

## License

MIT
