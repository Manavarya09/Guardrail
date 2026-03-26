"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// ─── Terminal ────────────────────────────────────────────────────────────────

function Terminal({ code }: { code: string }) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx < code.length) {
      const t = setTimeout(() => {
        setDisplayed((p) => p + code[idx]);
        setIdx((p) => p + 1);
      }, 18);
      return () => clearTimeout(t);
    }
  }, [idx, code]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
          <div className="w-3 h-3 rounded-full bg-neutral-700" />
          <div className="w-3 h-3 rounded-full bg-neutral-700" />
          <div className="w-3 h-3 rounded-full bg-neutral-700" />
          <span className="ml-2 text-xs text-neutral-500 font-mono">terminal</span>
        </div>
        <div className="p-6 font-mono text-[13px] leading-6 min-h-[280px]">
          <pre className="text-neutral-300 whitespace-pre-wrap">
            {displayed}
            <span className="inline-block w-2 h-5 bg-neutral-400 ml-0.5 animate-pulse align-text-bottom" />
          </pre>
        </div>
      </div>
    </div>
  );
}

// ─── Fade In ─────────────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-6 py-24 md:py-32 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const TERMINAL_CODE = `$ guardrail scan ./src

  Guardrail — scanning for issues...

src/api/auth.ts
   CRIT  12:6  Hardcoded secret in variable "API_KEY"          [security/hardcoded-api-key]
   HIGH  28:2  cors() called with no arguments                  [security/insecure-cors]
   HIGH  35:0  Potentially hallucinated import "auth-utils"     [ai-codegen/hallucinated-import]
   WARN  45:4  Sequential await inside loop                     [performance/inefficient-loop]
   WARN  52:0  console.log() call                               [ai-codegen/console-log-spam]  (fixable)
   WARN  61:2  fetch() without error handling                   [ai-codegen/fetch-without-error-handling]

Found 6 issues in 1 file (0.04s)
  1 critical, 2 high, 3 warnings
  1 issue is auto-fixable (run guardrail fix)`;

const FEATURES = [
  {
    title: "19 Built-in Rules",
    description:
      "Covers security, performance, code quality, and AI-codegen anti-patterns out of the box. Zero configuration needed.",
  },
  {
    title: "AI-Codegen Detection",
    description:
      "Purpose-built rules for patterns AI code generators produce: hallucinated imports, placeholder code, missing error handling.",
  },
  {
    title: "AST-Based Auto-Fix",
    description:
      "Not regex — real Abstract Syntax Tree transformations. Fixes are precise, safe, and produce clean diffs.",
  },
  {
    title: "Sub-Second Scans",
    description:
      "Parallel file processing with content-hash caching. Repeat scans on large codebases complete in milliseconds.",
  },
  {
    title: "Plugin Ecosystem",
    description:
      "Write custom rules as npm packages. The Rule interface is simple — one detect function that returns violations.",
  },
  {
    title: "CI-Ready",
    description:
      "GitHub Action with PR annotations. JSON output for pipelines. HTML reports for team review. Non-zero exit on failures.",
  },
];

const COMPARISON = [
  { feature: "Hardcoded secrets", eslint: "Plugin", sonar: true, snyk: false, guardrail: true },
  { feature: "SQL injection", eslint: false, sonar: true, snyk: false, guardrail: true },
  { feature: "AI-hallucinated imports", eslint: false, sonar: false, snyk: false, guardrail: true },
  { feature: "Placeholder/TODO detection", eslint: false, sonar: "Partial", snyk: false, guardrail: true },
  { feature: "console.log auto-removal", eslint: "Plugin", sonar: false, snyk: false, guardrail: true },
  { feature: "any type abuse", eslint: "Plugin", sonar: true, snyk: false, guardrail: true },
  { feature: "Fetch without error handling", eslint: false, sonar: false, snyk: false, guardrail: true },
  { feature: "N+1 query detection", eslint: false, sonar: false, snyk: false, guardrail: true },
  { feature: "AST-based auto-fix", eslint: false, sonar: false, snyk: false, guardrail: true },
  { feature: "Zero config", eslint: false, sonar: false, snyk: true, guardrail: true },
];

const RULES = [
  { id: "security/hardcoded-api-key", severity: "critical", category: "Security" },
  { id: "security/sql-injection", severity: "critical", category: "Security" },
  { id: "security/insecure-cors", severity: "high", category: "Security" },
  { id: "security/env-var-leak", severity: "high", category: "Security" },
  { id: "security/no-rate-limiting", severity: "info", category: "Security" },
  { id: "ai-codegen/hallucinated-import", severity: "high", category: "AI-Codegen" },
  { id: "ai-codegen/placeholder-code", severity: "warning", category: "AI-Codegen" },
  { id: "ai-codegen/hardcoded-localhost", severity: "warning", category: "AI-Codegen" },
  { id: "ai-codegen/console-log-spam", severity: "info", category: "AI-Codegen" },
  { id: "ai-codegen/overly-broad-catch", severity: "warning", category: "AI-Codegen" },
  { id: "ai-codegen/unused-imports", severity: "warning", category: "AI-Codegen" },
  { id: "ai-codegen/any-type-abuse", severity: "warning", category: "AI-Codegen" },
  { id: "ai-codegen/fetch-without-error-handling", severity: "warning", category: "AI-Codegen" },
  { id: "ai-codegen/promise-without-catch", severity: "warning", category: "AI-Codegen" },
  { id: "ai-codegen/magic-numbers", severity: "info", category: "AI-Codegen" },
  { id: "quality/dead-code", severity: "warning", category: "Quality" },
  { id: "quality/duplicate-logic", severity: "warning", category: "Quality" },
  { id: "performance/inefficient-loop", severity: "warning", category: "Performance" },
  { id: "performance/n-plus-one-query", severity: "high", category: "Performance" },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-950/50",
  high: "text-orange-400 bg-orange-950/50",
  warning: "text-yellow-400 bg-yellow-950/50",
  info: "text-blue-400 bg-blue-950/50",
};

// ─── Comparison Cell ─────────────────────────────────────────────────────────

function Cell({ value }: { value: boolean | string }) {
  if (value === true)
    return <span className="text-emerald-400">Yes</span>;
  if (value === false)
    return <span className="text-neutral-600">&mdash;</span>;
  return <span className="text-neutral-400">{value}</span>;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="bg-black min-h-screen">
      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 border-b border-neutral-800/50 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">Guardrail</span>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-neutral-400 hover:text-white transition-colors">Features</a>
            <a href="#rules" className="text-sm text-neutral-400 hover:text-white transition-colors">Rules</a>
            <a href="#compare" className="text-sm text-neutral-400 hover:text-white transition-colors">Compare</a>
            <a
              href="https://github.com/Manavarya09/Guardrail"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-lg border border-neutral-800 text-white hover:bg-neutral-900 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/20 via-black to-black" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(to right, #262626 1px, transparent 1px), linear-gradient(to bottom, #262626 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24">
          <div className="w-full max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-800 bg-neutral-950/50 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-neutral-400">19 rules across 4 categories</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-center mb-6 tracking-tight leading-[1.05]"
            >
              <span className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                The safety layer for
                <br />
                AI-generated code
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-neutral-400 text-center mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Scan for security issues, performance problems, and AI-specific
              anti-patterns. Auto-fix with AST transformations. Ship with confidence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <a
                href="https://github.com/Manavarya09/Guardrail"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition-colors duration-200"
              >
                Get Started
              </a>
              <a
                href="https://github.com/Manavarya09/Guardrail#quick-start"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 rounded-lg border border-neutral-800 text-white font-medium hover:bg-neutral-900 transition-colors duration-200"
              >
                Documentation
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Terminal code={TERMINAL_CODE} />
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </div>

      {/* ── Install Banner ─────────────────────────────────────── */}
      <Section>
        <FadeIn className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-neutral-800 bg-neutral-950 font-mono text-sm">
            <span className="text-neutral-500">$</span>
            <span className="text-neutral-200">npx @guardrail-ai/cli scan .</span>
            <button
              onClick={() => navigator.clipboard?.writeText("npx @guardrail-ai/cli scan .")}
              className="text-neutral-500 hover:text-white transition-colors ml-4"
              title="Copy"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
        </FadeIn>
      </Section>

      {/* ── Features ───────────────────────────────────────────── */}
      <Section className="border-t border-neutral-900">
        <div id="features" className="scroll-mt-24" />
        <FadeIn>
          <p className="text-sm text-neutral-500 uppercase tracking-widest mb-4">Capabilities</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16">
            <span className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
              Built for the AI era
            </span>
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-800/50 rounded-xl overflow-hidden border border-neutral-800/50">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.05}>
              <div className="bg-neutral-950 p-8 h-full">
                <h3 className="text-lg font-semibold mb-3">{f.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ── Rules ──────────────────────────────────────────────── */}
      <Section className="border-t border-neutral-900">
        <div id="rules" className="scroll-mt-24" />
        <FadeIn>
          <p className="text-sm text-neutral-500 uppercase tracking-widest mb-4">Detection</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
              19 rules, 4 categories
            </span>
          </h2>
          <p className="text-neutral-400 mb-12 max-w-2xl">
            Security. Performance. Quality. And AI-Codegen — a category built specifically
            for the patterns that Copilot, ChatGPT, and Claude produce.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950">
                  <th className="px-6 py-4 font-medium text-neutral-400">Rule ID</th>
                  <th className="px-6 py-4 font-medium text-neutral-400">Category</th>
                  <th className="px-6 py-4 font-medium text-neutral-400">Severity</th>
                </tr>
              </thead>
              <tbody>
                {RULES.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/30 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-neutral-200">{r.id}</td>
                    <td className="px-6 py-3.5 text-neutral-400">{r.category}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium ${SEVERITY_COLORS[r.severity]}`}>
                        {r.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </Section>

      {/* ── Comparison ─────────────────────────────────────────── */}
      <Section className="border-t border-neutral-900">
        <div id="compare" className="scroll-mt-24" />
        <FadeIn>
          <p className="text-sm text-neutral-500 uppercase tracking-widest mb-4">Comparison</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-12">
            <span className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
              Why Guardrail
            </span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950">
                  <th className="px-6 py-4 font-medium text-neutral-400">Feature</th>
                  <th className="px-6 py-4 font-medium text-neutral-400">ESLint</th>
                  <th className="px-6 py-4 font-medium text-neutral-400">SonarQube</th>
                  <th className="px-6 py-4 font-medium text-neutral-400">Snyk</th>
                  <th className="px-6 py-4 font-semibold text-white">Guardrail</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-b border-neutral-800/50 hover:bg-neutral-900/30 transition-colors">
                    <td className="px-6 py-3.5 text-neutral-200">{row.feature}</td>
                    <td className="px-6 py-3.5"><Cell value={row.eslint} /></td>
                    <td className="px-6 py-3.5"><Cell value={row.sonar} /></td>
                    <td className="px-6 py-3.5"><Cell value={row.snyk} /></td>
                    <td className="px-6 py-3.5 font-medium"><Cell value={row.guardrail} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </Section>

      {/* ── GitHub Action ──────────────────────────────────────── */}
      <Section className="border-t border-neutral-900">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <p className="text-sm text-neutral-500 uppercase tracking-widest mb-4">CI Integration</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                Three lines of YAML
              </span>
            </h2>
            <p className="text-neutral-400 leading-relaxed mb-6">
              Add Guardrail to your GitHub Actions workflow. Issues appear as
              PR annotations with file and line context. Configurable severity thresholds.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
                <span className="text-xs text-neutral-500 font-mono">.github/workflows/guardrail.yml</span>
              </div>
              <pre className="p-6 text-sm font-mono text-neutral-300 overflow-x-auto leading-6">
{`name: Guardrail
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Manavarya09/Guardrail@main
        with:
          target: './src'
          severity: 'warning'`}
              </pre>
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <Section className="border-t border-neutral-900">
        <FadeIn className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
              Start scanning in seconds
            </span>
          </h2>
          <p className="text-neutral-400 mb-10 max-w-xl mx-auto">
            Open source. Zero config. Works with any JavaScript or TypeScript codebase.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/Manavarya09/Guardrail"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition-colors duration-200"
            >
              View on GitHub
            </a>
            <a
              href="https://github.com/Manavarya09/Guardrail/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-lg border border-neutral-800 text-white font-medium hover:bg-neutral-900 transition-colors duration-200"
            >
              Contribute
            </a>
          </div>
        </FadeIn>
      </Section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-900 px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-neutral-500">
            Guardrail. Open source under MIT.
          </span>
          <div className="flex items-center gap-6">
            <a href="https://github.com/Manavarya09/Guardrail" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-500 hover:text-white transition-colors">
              GitHub
            </a>
            <a href="https://github.com/Manavarya09/Guardrail/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-500 hover:text-white transition-colors">
              Contributing
            </a>
            <a href="https://github.com/Manavarya09/Guardrail/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-500 hover:text-white transition-colors">
              License
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
