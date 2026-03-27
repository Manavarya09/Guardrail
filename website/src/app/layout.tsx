import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guardrail — The safety layer for AI-generated code",
  description:
    "Scan and fix security vulnerabilities, performance issues, and AI-specific anti-patterns. 30 rules. 7 commands. VS Code extension. Zero config.",
  openGraph: {
    title: "Guardrail — The safety layer for AI-generated code",
    description: "30 detection rules. 7 CLI commands. VS Code extension. Zero config. Open source.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased grain">{children}</body>
    </html>
  );
}
