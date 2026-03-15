"use client";
import { useI18n } from "@demo/lib/i18n";

export default function LangSwitcher() {
  const { t, toggleLocale } = useI18n();
  return (
    <button
      onClick={toggleLocale}
      className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors"
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
      }}
    >
      {t("lang.switch")}
    </button>
  );
}
