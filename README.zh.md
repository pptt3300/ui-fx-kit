# ui-fx-kit

64 个可组合的 React UI 视觉效果。Hooks · CSS · 组件。

[在线演示](https://pptt3300.github.io/ui-fx-kit/) · [English](./README.md)

## 快速开始

### 方式一：CLI 命令行（推荐）

```bash
# 直接用 npx（无需安装）
npx ui-fx-kit add holographic-card --target ./src

# 或者全局安装，后续使用更快
npm install -g ui-fx-kit
ui-fx-kit add holographic-card --target ./src

# 一次添加多个效果
ui-fx-kit add gradient-mesh silk-waves cursor-glow --target ./src
```

CLI 会自动复制效果源码 + 依赖的 hooks + CSS 到你的项目。你拥有代码，无运行时依赖，可以自由修改。

### 方式二：MCP 服务器（Claude Code 用户）

在 Claude Code 的 MCP 设置中添加：

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

然后直接告诉 Claude 你想要什么：

```
"给我的登录页加一个全息卡片效果"
"我需要一个矩阵雨背景"
"加一个跟随鼠标的光标特效"
```

Claude 会自动选择合适的效果，复制源码到你的项目，并配置好 import。

### 方式三：手动复制

```bash
# 复制你需要的
cp -r ui-fx-kit/effects/holographic-card/ 你的项目/src/effects/
cp ui-fx-kit/hooks/useTilt3D.ts 你的项目/src/hooks/
cp ui-fx-kit/css/holographic.css 你的项目/src/css/
```

## CLI 命令

```bash
# 列出全部 64 个效果
npx ui-fx-kit list

# 按分类筛选
npx ui-fx-kit list background

# 查看效果详情
npx ui-fx-kit info silk-waves

# 添加到项目
npx ui-fx-kit add silk-waves --target ./src
```

## 包含内容

### 效果组件（64 个）

| 分类 | 数量 | 示例 |
|------|------|------|
| 背景效果 | 14 | 极光、渐变网格、矩阵雨、丝绸波浪、等离子体、液态铬 |
| 文字效果 | 10 | 乱码解密、翻页牌、文字变形、故障文字、文字压力 |
| 卡片效果 | 9 | 全息卡片、翻转卡片、堆叠滑动、瀑布流网格、反射卡片 |
| 光标效果 | 6 | 光标光晕、液态光标、飞溅光标、像素轨迹、幽灵光标 |
| 着色器效果 | 8 | 金属漆、虹彩、液态以太、棱镜折射、元球 |
| 交互效果 | 17 | Dock 放大、五彩纸屑、拖拽排序、数字计数器、视差滚动 |

### Hooks（19 个）

每个 hook 零依赖，可独立使用：

| Hook | 功能 |
|------|------|
| `useWebGL` | WebGL 着色器管线——编译、渲染循环、uniform 管理 |
| `useSpring` | 弹簧物理动画 |
| `useMousePosition` | 鼠标位置追踪（ref 模式用于 canvas，state 模式用于 CSS）|
| `useParticles` | 粒子系统——生成、更新、渲染 |
| `usePerlinNoise` | 柏林噪声 + FBM，用于有机运动 |
| `useGesture` | 拖拽/滑动手势处理 |
| `useTilt3D` | 跟随鼠标的 3D 透视倾斜 |
| `useCanvasSetup` | 适配 DPI 的 canvas 画布 + requestAnimationFrame 循环 |
| `useStagger` | 交错动画时序编排 |
| `useInView` | Intersection Observer 封装，滚动触发 |

### CSS 片段（13 个）

即插即用的动画类：`glass-card`、`holographic`、`shimmer`、`neon-glow`、`glitch-effect`、`sticker-peel`、`iridescent` 等。

### 调色板（13 套）

精选配色方案，直接作为 props 传入效果组件：`default`、`neon`、`pastel`、`warm`、`arctic`、`mono`、`stripe`、`vercel`、`supabase`、`discord`、`spotify` 等。

## 项目结构

```
effects/     → 完整的 React 组件（每个在独立目录）
  ├── holographic-card/
  │   ├── HolographicCard.tsx
  │   └── meta.json
  ├── gradient-mesh/
  └── ...
hooks/       → 可复用的 React hooks（物理、手势、WebGL）
css/         → 独立的 CSS 动画片段
presets/     → 调色板和弹簧配置
bin/         → CLI 命令行工具
mcp-server.js → Claude Code 用的 MCP 服务器
```

效果组件从 `hooks/` 和 `css/` 导入依赖。CLI 在添加效果时会自动解析并复制这些依赖。

## 技术栈

- React 18+、TypeScript
- WebGL（着色器效果）
- framer-motion（可选，部分效果使用）
- Hooks 零运行时依赖

## 许可证

MIT
