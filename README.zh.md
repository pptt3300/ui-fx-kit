# ui-fx-kit

64 个可组合的 React UI 视觉效果。源码交付，不是 npm 依赖。

[在线演示 & Playground](https://pptt3300.github.io/ui-fx-kit/) · [English](./README.md)

## 工作方式

你描述想要什么效果，AI 选择匹配的组件，拉取源码，接入你的项目。你拥有代码，没有运行时依赖。

### 配置（一次性）

在 Claude Code 的 MCP 设置中添加（`~/.claude.json` 或项目 `.mcp.json`）：

```json
{
  "mcpServers": {
    "ui-fx-kit": {
      "command": "node",
      "args": ["/你的路径/ui-fx-kit/mcp-server.js"]
    }
  }
}
```

### 告诉 AI 你想要什么

**具体效果：**

```
"给 hero section 加个星空背景，用 neon 配色"
"定价卡片加个全息效果"
"首页标题加个打字机效果"
```

**按意图：**

```
"我需要一个 SaaS 仪表盘的背景效果——低性能消耗，mobile safe"
"给定价卡片加个强调效果，但要高级感不要花哨"
"内容加载时需要一个 loading 反馈效果"
```

**带约束条件：**

```
"加个背景效果，要求 mobile safe、低性能消耗、不要 WebGL"
"我需要一个触屏也能用的光标效果"
"给卡片加点质感，不想大改，越简单越好"
```

**自由组合 hooks：**

```
"用 useCanvasSetup + useParticles + useMousePosition 组合一个鼠标粒子拖尾"
"用弹簧物理 + 3D 倾斜做一个卡片交互"
```

### AI 在背后做了什么

```
你的 prompt
  → find_effects（按分类/性能/移动端兼容结构化筛选）
  → get_effect_bundle（一次调用拿到源码 + 全部依赖）
  → 写入文件到你的项目
```

一句话，一次请求，完整源码。

## AI 工具速查

MCP 服务器提供 16 个工具。你不需要直接调用——AI 会根据你的 prompt 自动选择。但了解有什么可以帮你写出更好的 prompt。

| 工具 | AI 用它来做什么 |
|------|---------------|
| `find_effects` | 按意图+目标筛选（如 `'button emphasis'`、`'background ambient'`），返回 usage_tip 辅助决策 |
| `get_effect_bundle` | 一次拿到效果源码 + 全部 hook/CSS/preset 依赖 |
| `suggest_combination` | 描述意图 → 返回 hook 组合建议 + 源码 |
| `check_performance_budget` | 检查多个效果能否在同一页面共存 |
| `list_effects` | 浏览所有效果，带 usage_tip 指引，支持多分类 AND 筛选 |
| `search` | 跨效果、hooks、CSS 的关键词搜索 |
| `list_css` | 浏览 CSS 片段（加个 class 就生效） |
| `get_css` | 获取 CSS 片段源码 |
| `list_hooks` | 浏览 hooks 及其组合关系图 |
| `get_hook` | 获取 hook 源码 |
| `get_preset` | 获取调色板或弹簧配置 |
| `get_effect` | 获取单个效果源码（要完整依赖用 bundle） |
| `get_examples` | 获取效果的完整可运行示例代码 |
| `audit_install` | 安装后检查清单——验证文件、导入路径、依赖、无障碍 |
| `get_project_status` | 分析已安装效果——hook 共享关系、性能风险、更新提示 |
| `check_updates` | 检查已安装效果是否有上游更新 |

## Prompt 技巧

| 场景 | 好的 prompt | 为什么有效 |
|------|-----------|-----------|
| 浏览 | "有什么 mobile safe 的背景效果？" | 映射到 `find_effects(category="background", mobile_safe=true)` |
| 具体需求 | "hero 背景换成流体渐变" | AI 搜索"流体渐变背景" → silk-waves 或 gradient-mesh |
| 快速加质感 | "给卡片加个玻璃质感，不想改组件" | AI 选 CSS 片段 `glass-card`——加个 class 就行 |
| 性能 | "当前页面已经有 3 个 canvas 效果了，还能加吗？" | AI 调用 `check_performance_budget` |
| 自定义 | "用粒子 + 鼠标跟踪 + canvas 组合一个自定义效果" | AI 调用 `suggest_combination` |
| 主题 | "所有效果统一用 spotify 配色" | AI 给每个效果传 `palette="spotify"` |
| 按意图 | "CTA 按钮需要吸引注意力" | AI 查询 `find_effects(category="button emphasis")` → 返回 magnetic-button、ripple-button 及 usage_tip |

**避免模糊 prompt**，比如"加点效果"或"用 ui-fx-kit"——AI 需要知道要什么效果、放在哪里。

## 调色板

13 套精选配色。支持 palette 的效果可以传 `palette="名字"`：

`default` · `neon` · `pastel` · `warm` · `arctic` · `mono` · `stripe` · `vercel` · `linear` · `supabase` · `figma` · `discord` · `spotify`

同一页面使用多个效果时，用相同的 palette 保持视觉一致性。

## 不用 AI 也能用

### CLI 命令行

```bash
npx ui-fx-kit add holographic-card --target ./src
npx ui-fx-kit add gradient-mesh silk-waves --target ./src
npx ui-fx-kit add holographic-card --target ./src --force  # 重新安装最新版
npx ui-fx-kit status --target ./src                        # 检查可用更新
npx ui-fx-kit list background
npx ui-fx-kit info silk-waves
```

### Playground

[演示站](https://pptt3300.github.io/ui-fx-kit/)上每个效果都有 Playground 面板——实时调参，然后复制带参数的 CLI 命令。

### 手动复制

```bash
cp -r ui-fx-kit/effects/holographic-card/ 你的项目/src/effects/
```

## 包含内容

| 层级 | 数量 | 用途 |
|------|------|------|
| Effects | 64 | 完整 React 组件（背景、文字、卡片、光标、着色器、交互） |
| Hooks | 19 | 零依赖构建块（物理、手势、WebGL、canvas、粒子） |
| CSS | 13 | 即插即用动画类（玻璃、全息、霓虹、微光） |
| Palettes | 13 | 精选配色方案 |

效果由 hooks 构建，hooks 可自由组合。AI 通过 `combinesWith` 图谱知道哪些 hooks 能搭配使用。

## 项目结构

```
effects/      → React 组件（源码，不是编译产物）
hooks/        → 可组合的 React hooks
css/          → 独立 CSS 动画类
presets/      → 调色板 + 弹簧配置
bin/          → CLI 命令行工具
mcp-server.js → AI 工具接口（16 个工具）
```

源码交付：CLI 和 MCP 服务器把文件复制到你的项目。你拥有并可以修改所有代码。

## 许可证

MIT
