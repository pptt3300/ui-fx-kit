import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ui-fx-kit — 64 React UI Effects",
  description: "Composable, physics-driven UI effects for React. Hooks, CSS, and complete components.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0f] text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
