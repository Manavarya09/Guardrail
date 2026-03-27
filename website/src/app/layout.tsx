import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guardrail — The safety layer for AI-generated code",
  description:
    "Scan and fix security issues, performance problems, and AI-specific anti-patterns before they ship. 22 built-in rules. AST-based auto-fix. Zero config.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
