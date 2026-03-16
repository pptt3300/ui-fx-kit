"use client";
import { createContext, useContext, useState, useCallback } from "react";

type Locale = "en" | "zh";

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Hero
    "hero.subtitle": "64 composable React effects",
    "hero.tagline": "Hooks · CSS · Components",
    "hero.github": "View on GitHub",
    "hero.cta": "Use with Claude Code",
    "hero.scroll": "Scroll to explore",

    // Categories
    "cat.background": "Background",
    "cat.text": "Text",
    "cat.card": "Card",
    "cat.cursor": "Cursor",
    "cat.shader": "Shader",
    "cat.interactive": "Interactive",
    "cat.effects": "effects",

    // Palettes
    "palette.title": "Color Palettes",
    "palette.desc": "Pick a palette, see it applied live below. Then copy the colors into your effect props.",
    "palette.step1": "Pick a palette",
    "palette.step2": "Click any color to copy",
    "palette.step3": "Paste as effect props",
    "palette.copy": "Copy props",
    "palette.copyColor": "Copy color",
    "palette.copied": "Copied!",
    "palette.clickToCopy": "click to copy",
    "palette.allColors": "All colors — click to copy",
    "palette.bgPreview": "Background",
    "palette.cardTitle": "Card Title",
    "palette.cardDesc": "A description using the muted color from this palette.",
    "palette.heading": "Heading",
    "palette.gradientText": "Gradient Text",
    "palette.bodyText": "Body text in muted",
    "palette.colorsPerPalette": "9 colors per palette",
    "palette.copyUsage": "Copy usage",
    "palette.bgLabel": "GradientMesh + particles colors",
    "palette.uiLabel": "UI colors: primary, accent, surface, text",
    "palette.textLabel": "Text colors: primary → secondary → accent gradient",

    // Footer
    "footer.getStarted": "Get Started",
    "footer.withClaude": "With Claude Code (Recommended)",
    "footer.manual": "Manual",
    "footer.step1": "Step 1: Add MCP server to Claude Code settings",
    "footer.step2": "Step 2: Ask Claude to add any effect",
    "footer.manualDesc": "Copy any effect directory into your project. Each effect is self-contained:",
    "footer.architecture": "Architecture",
    "footer.hooks": "Hooks",
    "footer.hooksDesc": "Zero-dep physics, gestures, WebGL, noise",
    "footer.css": "CSS",
    "footer.cssDesc": "Standalone animation snippets",
    "footer.effects": "Effects",
    "footer.effectsDesc": "Complete React components",
    "footer.composes": "composes",
    "footer.stats": "effects · 19 hooks · 13 CSS · 13 palettes",
    "footer.license": "MIT License",

    // Effect sections - general
    "effect.moveCursor": "move your cursor",
    "effect.scrollHere": "scroll here to activate",
    "effect.clickAnywhere": "click anywhere",
    "effect.clickToToggle": "click to toggle",

    // Playground
    "pg.playground": "Playground",
    "pg.install": "Install",
    "pg.controls": "Controls",
    "pg.reset": "Reset",
    "pg.cli": "CLI",
    "pg.usage": "Usage",
    "pg.triggerPlayground": "⚙ Playground",
    "pg.triggerInstall": "↓ Install",

    // Language
    "lang.switch": "中文",
  },
  zh: {
    // Hero
    "hero.subtitle": "64 个可组合的 React 视觉效果",
    "hero.tagline": "Hooks · CSS · 组件",
    "hero.github": "GitHub 仓库",
    "hero.cta": "在 Claude Code 中使用",
    "hero.scroll": "向下滚动探索",

    // Categories
    "cat.background": "背景效果",
    "cat.text": "文字效果",
    "cat.card": "卡片效果",
    "cat.cursor": "光标效果",
    "cat.shader": "着色器效果",
    "cat.interactive": "交互效果",
    "cat.effects": "个效果",

    // Palettes
    "palette.title": "调色板",
    "palette.desc": "选择一个调色板，下方实时预览效果。然后复制颜色值到你的 effect props 中。",
    "palette.step1": "选择调色板",
    "palette.step2": "点击颜色复制",
    "palette.step3": "粘贴到 effect props",
    "palette.copy": "复制属性",
    "palette.copyColor": "复制颜色",
    "palette.copied": "已复制！",
    "palette.clickToCopy": "点击复制",
    "palette.allColors": "所有颜色 — 点击复制",
    "palette.bgPreview": "背景",
    "palette.cardTitle": "卡片标题",
    "palette.cardDesc": "使用调色板 muted 颜色的描述文字。",
    "palette.heading": "标题",
    "palette.gradientText": "渐变文字",
    "palette.bodyText": "正文使用 muted 颜色",
    "palette.colorsPerPalette": "每套调色板 9 个颜色",
    "palette.copyUsage": "复制用法",
    "palette.bgLabel": "GradientMesh + particles 颜色",
    "palette.uiLabel": "UI 颜色：primary、accent、surface、text",
    "palette.textLabel": "文字颜色：primary → secondary → accent 渐变",

    // Footer
    "footer.getStarted": "开始使用",
    "footer.withClaude": "使用 Claude Code（推荐）",
    "footer.manual": "手动安装",
    "footer.step1": "第一步：在 Claude Code 设置中添加 MCP 服务器",
    "footer.step2": "第二步：让 Claude 添加任意效果",
    "footer.manualDesc": "将效果目录复制到你的项目中。每个效果都是独立的：",
    "footer.architecture": "架构",
    "footer.hooks": "Hooks",
    "footer.hooksDesc": "零依赖的物理、手势、WebGL、噪声",
    "footer.css": "CSS",
    "footer.cssDesc": "独立的动画片段",
    "footer.effects": "效果组件",
    "footer.effectsDesc": "完整的 React 组件",
    "footer.composes": "组合",
    "footer.stats": "个效果 · 19 个 hooks · 13 个 CSS · 13 套调色板",
    "footer.license": "MIT 许可证",

    // Effect sections
    "effect.moveCursor": "移动鼠标",
    "effect.scrollHere": "滚动到此处激活",
    "effect.clickAnywhere": "点击任意位置",
    "effect.clickToToggle": "点击切换",

    // Playground
    "pg.playground": "调参面板",
    "pg.install": "安装",
    "pg.controls": "控件",
    "pg.reset": "重置",
    "pg.cli": "安装命令",
    "pg.usage": "使用方式",
    "pg.triggerPlayground": "⚙ 调参",
    "pg.triggerInstall": "↓ 安装",

    // Language
    "lang.switch": "EN",
  },
};

interface I18nContextType {
  locale: Locale;
  t: (key: string) => string;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  t: (key) => key,
  toggleLocale: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const t = useCallback(
    (key: string) => translations[locale][key] ?? key,
    [locale],
  );

  const toggleLocale = useCallback(() => {
    setLocale((l) => (l === "en" ? "zh" : "en"));
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
