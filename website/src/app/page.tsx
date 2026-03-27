"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

// ─── Animations ──────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

function F({
  children,
  className = "",
  i = 0,
}: {
  children: React.ReactNode;
  className?: string;
  i?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      custom={i}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    title: "SECURITY SCANNING",
    desc: "8 rules detecting hardcoded secrets, SQL injection, eval(), unsafe regex, insecure CORS, env leaks, and more.",
  },
  {
    title: "AI-CODE DETECTION",
    desc: "10 rules purpose-built for AI-generated patterns: hallucinated imports, placeholder code, missing error handling.",
  },
  {
    title: "AST AUTO-FIX",
    desc: "Real Abstract Syntax Tree transformations. Precise fixes with clean unified diffs. Not regex replacements.",
  },
];

const RULES = [
  { id: "security/hardcoded-api-key", sev: "CRIT", cat: "SECURITY" },
  { id: "security/sql-injection", sev: "CRIT", cat: "SECURITY" },
  { id: "security/no-eval", sev: "CRIT", cat: "SECURITY" },
  { id: "security/insecure-cors", sev: "HIGH", cat: "SECURITY" },
  { id: "security/env-var-leak", sev: "HIGH", cat: "SECURITY" },
  { id: "security/unsafe-regex", sev: "HIGH", cat: "SECURITY" },
  { id: "security/no-secrets-in-logs", sev: "HIGH", cat: "SECURITY" },
  { id: "security/no-rate-limiting", sev: "INFO", cat: "SECURITY" },
  { id: "ai-codegen/hallucinated-import", sev: "HIGH", cat: "AI-CODEGEN" },
  { id: "ai-codegen/placeholder-code", sev: "WARN", cat: "AI-CODEGEN" },
  { id: "ai-codegen/hardcoded-localhost", sev: "WARN", cat: "AI-CODEGEN" },
  { id: "ai-codegen/overly-broad-catch", sev: "WARN", cat: "AI-CODEGEN" },
  { id: "ai-codegen/unused-imports", sev: "WARN", cat: "AI-CODEGEN" },
  { id: "ai-codegen/any-type-abuse", sev: "WARN", cat: "AI-CODEGEN" },
  { id: "ai-codegen/fetch-without-error-handling", sev: "WARN", cat: "AI-CODEGEN" },
  { id: "ai-codegen/promise-without-catch", sev: "WARN", cat: "AI-CODEGEN" },
  { id: "ai-codegen/console-log-spam", sev: "INFO", cat: "AI-CODEGEN" },
  { id: "ai-codegen/magic-numbers", sev: "INFO", cat: "AI-CODEGEN" },
  { id: "quality/dead-code", sev: "WARN", cat: "QUALITY" },
  { id: "quality/duplicate-logic", sev: "WARN", cat: "QUALITY" },
  { id: "performance/inefficient-loop", sev: "WARN", cat: "PERFORMANCE" },
  { id: "performance/n-plus-one-query", sev: "HIGH", cat: "PERFORMANCE" },
];

const SEV_COLOR: Record<string, string> = {
  CRIT: "text-red-400",
  HIGH: "text-orange-400",
  WARN: "text-[#d4a012]",
  INFO: "text-[#d4a012]/50",
};

const TRUST_WORDS = [
  "SECURITY", "PERFORMANCE", "QUALITY", "AI-SAFETY",
  "OPEN-SOURCE", "AST-POWERED", "ZERO-CONFIG", "EXTENSIBLE",
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <main className="bg-[#0a0a0a] text-[#d4a012] min-h-screen">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#d4a01220] bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-sm font-bold tracking-[0.3em] uppercase">Guardrail</span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-xs tracking-widest uppercase text-[#d4a012]/60 hover:text-[#d4a012] transition-colors">About</a>
            <a href="#rules" className="text-xs tracking-widest uppercase text-[#d4a012]/60 hover:text-[#d4a012] transition-colors">Rules</a>
            <a href="#integrate" className="text-xs tracking-widest uppercase text-[#d4a012]/60 hover:text-[#d4a012] transition-colors">Integrate</a>
            <a
              href="https://github.com/Manavarya09/Guardrail"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-widest uppercase border border-[#d4a012]/40 px-4 py-1.5 hover:bg-[#d4a012] hover:text-[#0a0a0a] transition-all"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-14">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(to right, #d4a012 1px, transparent 1px), linear-gradient(to bottom, #d4a012 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-8 items-center">
            {/* Left */}
            <div className="lg:pr-8">
              <F>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.95] tracking-tight text-[#fafafa]">
                  No Bad Code,
                  <br />
                  <span className="text-[#d4a012]">Only Safe Moves</span>
                </h1>
              </F>
              <F i={1}>
                <p className="mt-8 text-sm md:text-base text-[#d4a012]/60 max-w-lg leading-relaxed tracking-wide">
                  We scan your AI-generated code for security vulnerabilities,
                  performance issues, and anti-patterns — then auto-fix them.
                </p>
              </F>
              <F i={2}>
                <div className="mt-10 flex flex-wrap gap-4">
                  <a
                    href="https://github.com/Manavarya09/Guardrail"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-[#d4a012] px-6 py-3 text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#d4a012] hover:text-[#0a0a0a] transition-all"
                  >
                    Get Started
                  </a>
                  <a
                    href="https://www.npmjs.com/package/@guardrail-ai/cli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-[#d4a012]/30 px-6 py-3 text-xs tracking-[0.2em] uppercase font-bold text-[#d4a012]/60 hover:border-[#d4a012] hover:text-[#d4a012] transition-all"
                  >
                    npm Install
                  </a>
                </div>
              </F>
            </div>

            {/* Right — Globe */}
            <F i={3} className="h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center">
              <Globe />
            </F>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="border-t border-[#d4a01220]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 divide-x divide-[#d4a01215]">
          {FEATURES.map((f, i) => (
            <F key={f.title} i={i}>
              <div className="p-8 md:p-10 lg:p-12 h-full">
                <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold mb-4 text-[#fafafa]">
                  {f.title}
                </h3>
                <p className="text-[13px] leading-[1.7] text-[#d4a012]/50">
                  {f.desc}
                </p>
              </div>
            </F>
          ))}
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────── */}
      <section id="about" className="border-t border-[#d4a01220] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <F>
            <p className="text-xs tracking-[0.3em] uppercase text-[#d4a012]/40 mb-8">/ About Guardrail</p>
          </F>
          <F i={1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase leading-[1.1] text-[#fafafa] max-w-5xl">
              We provide the default
              <br />
              safety layer for
              <br />
              <span className="text-[#d4a012]">AI-generated code.</span>
            </h2>
          </F>

          <div className="grid md:grid-cols-2 gap-px mt-20 border border-[#d4a01220]">
            <F>
              <div className="p-10 border-b md:border-b-0 md:border-r border-[#d4a01220]">
                <p className="text-xs tracking-[0.3em] uppercase text-[#d4a012]/40 mb-4">/ Mission</p>
                <p className="text-sm text-[#d4a012]/60 tracking-wide leading-relaxed">
                  To become the default guardian that prevents developers from shipping
                  insecure or unscalable AI-generated applications. 22 rules. 4 categories.
                  Zero configuration.
                </p>
              </div>
            </F>
            <F i={1}>
              <div className="p-10">
                <p className="text-xs tracking-[0.3em] uppercase text-[#d4a012]/40 mb-4">/ Vision</p>
                <p className="text-sm text-[#d4a012]/60 tracking-wide leading-relaxed">
                  A world where every AI-generated line of code passes through a safety
                  layer before it reaches production. Open source. Community driven. Built
                  for the era of Copilot, ChatGPT, and Claude.
                </p>
              </div>
            </F>
          </div>
        </div>
      </section>

      {/* ── Terminal ─────────────────────────────────────────── */}
      <section className="border-t border-[#d4a01220] py-24">
        <div className="max-w-4xl mx-auto px-6">
          <F>
            <div className="border border-[#d4a01230] bg-[#0a0a0a]">
              <div className="border-b border-[#d4a01220] px-5 py-3 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#d4a012]/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#d4a012]/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#d4a012]/30" />
                <span className="ml-2 text-[10px] tracking-widest uppercase text-[#d4a012]/30">terminal</span>
              </div>
              <pre className="p-6 text-[12px] md:text-[13px] leading-6 text-[#d4a012]/70 overflow-x-auto">
{`$ npx @guardrail-ai/cli scan ./src

   ____                     _           _ _
  / ___|_   _  __ _ _ __ __| |_ __ __ _(_) |
 | |  _| | | |/ _\` | '__/ _\` | '__/ _\` | | |
 | |_| | |_| | (_| | | | (_| | | | (_| | | |
  \\____|\\__,_|\\__,_|_|  \\__,_|_|  \\__,_|_|_|

  Target: ./src

src/api/auth.ts
  `}<span className="text-red-400">CRIT</span>{`  12:6   Hardcoded secret in "API_KEY"              [security/hardcoded-api-key]
  `}<span className="text-red-400">CRIT</span>{`  18:18  Potential SQL injection                     [security/sql-injection]
  `}<span className="text-orange-400">HIGH</span>{`  28:2   cors() with no arguments                    [security/insecure-cors]
  `}<span className="text-orange-400">HIGH</span>{`  35:0   Hallucinated import "auth-utils"            [ai-codegen/hallucinated-import]
  `}<span className="text-[#d4a012]">WARN</span>{`  45:4   Sequential await inside loop                [performance/inefficient-loop]
  `}<span className="text-[#d4a012]">WARN</span>{`  52:0   console.log() call                         [ai-codegen/console-log-spam]  `}<span className="text-green-400">(fixable)</span>{`

Found 6 issues in 1 file (0.03s)
  2 critical, 2 high, 2 warnings
  1 issue is auto-fixable (run guardrail fix)`}
              </pre>
            </div>
          </F>
        </div>
      </section>

      {/* ── Rules ───────────────────────────────────────────── */}
      <section id="rules" className="border-t border-[#d4a01220] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <F>
            <p className="text-xs tracking-[0.3em] uppercase text-[#d4a012]/40 mb-4">/ Detection Engine</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-[#fafafa] mb-12">
              22 Rules, 4 Categories
            </h2>
          </F>
          <F i={1}>
            <div className="border border-[#d4a01220] overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#d4a01220]">
                    <th className="px-5 py-3.5 tracking-[0.2em] uppercase text-[#d4a012]/40 font-normal">Rule</th>
                    <th className="px-5 py-3.5 tracking-[0.2em] uppercase text-[#d4a012]/40 font-normal">Category</th>
                    <th className="px-5 py-3.5 tracking-[0.2em] uppercase text-[#d4a012]/40 font-normal">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {RULES.map((r) => (
                    <tr key={r.id} className="border-b border-[#d4a01210] hover:bg-[#d4a01208] transition-colors">
                      <td className="px-5 py-2.5 text-[#fafafa]/80 font-mono">{r.id}</td>
                      <td className="px-5 py-2.5 text-[#d4a012]/40 tracking-widest uppercase text-[11px]">{r.cat}</td>
                      <td className={`px-5 py-2.5 font-bold tracking-widest ${SEV_COLOR[r.sev]}`}>{r.sev}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </F>
        </div>
      </section>

      {/* ── Integrate ───────────────────────────────────────── */}
      <section id="integrate" className="border-t border-[#d4a01220] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <F>
            <p className="text-xs tracking-[0.3em] uppercase text-[#d4a012]/40 mb-4">/ Integrate</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-[#fafafa] mb-16">
              Works Everywhere
            </h2>
          </F>

          <div className="grid md:grid-cols-2 gap-px border border-[#d4a01220]">
            {/* GitHub Action */}
            <F>
              <div className="p-8 border-b md:border-b-0 md:border-r border-[#d4a01220]">
                <p className="text-xs tracking-[0.3em] uppercase text-[#d4a012]/40 mb-4">/ GitHub Action</p>
                <pre className="text-[12px] leading-6 text-[#d4a012]/60 overflow-x-auto">
{`- uses: Manavarya09/Guardrail@v0.1.0
  with:
    target: './src'
    severity: 'warning'`}
                </pre>
              </div>
            </F>

            {/* Claude Code */}
            <F i={1}>
              <div className="p-8 border-b md:border-b-0 border-[#d4a01220]">
                <p className="text-xs tracking-[0.3em] uppercase text-[#d4a012]/40 mb-4">/ Claude Code (MCP)</p>
                <pre className="text-[12px] leading-6 text-[#d4a012]/60 overflow-x-auto">
{`{
  "mcpServers": {
    "guardrail": {
      "command": "npx",
      "args": ["@guardrail-ai/mcp"]
    }
  }
}`}
                </pre>
              </div>
            </F>

            {/* npm */}
            <F>
              <div className="p-8 border-r border-[#d4a01220]">
                <p className="text-xs tracking-[0.3em] uppercase text-[#d4a012]/40 mb-4">/ npm</p>
                <pre className="text-[12px] leading-6 text-[#d4a012]/60">
{`npm install -g @guardrail-ai/cli
guardrail scan ./src
guardrail fix ./src --dry-run`}
                </pre>
              </div>
            </F>

            {/* Config */}
            <F i={1}>
              <div className="p-8">
                <p className="text-xs tracking-[0.3em] uppercase text-[#d4a012]/40 mb-4">/ Config</p>
                <pre className="text-[12px] leading-6 text-[#d4a012]/60 overflow-x-auto">
{`{
  "include": ["src/**/*.{ts,tsx}"],
  "severityThreshold": "warning",
  "rules": {
    "ai-codegen/magic-numbers": false
  }
}`}
                </pre>
              </div>
            </F>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="border-t border-[#d4a01220] py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <F>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-[#fafafa] mb-6">
              Start Scanning<br /><span className="text-[#d4a012]">In Seconds</span>
            </h2>
          </F>
          <F i={1}>
            <p className="text-sm text-[#d4a012]/50 uppercase tracking-widest mb-10">
              Open source. Zero config. 22 rules. AST auto-fix.
            </p>
          </F>
          <F i={2}>
            <div className="inline-block border border-[#d4a01230] px-8 py-4 mb-10">
              <code className="text-sm text-[#d4a012]/80">$ npx @guardrail-ai/cli scan .</code>
            </div>
          </F>
          <F i={3}>
            <div className="flex justify-center gap-4">
              <a
                href="https://github.com/Manavarya09/Guardrail"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#d4a012] px-8 py-3 text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#d4a012] hover:text-[#0a0a0a] transition-all"
              >
                View on GitHub
              </a>
              <a
                href="https://github.com/Manavarya09/Guardrail/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#d4a012]/30 px-8 py-3 text-xs tracking-[0.2em] uppercase font-bold text-[#d4a012]/60 hover:border-[#d4a012] hover:text-[#d4a012] transition-all"
              >
                Contribute
              </a>
            </div>
          </F>
        </div>
      </section>

      {/* ── Trust Bar ───────────────────────────────────────── */}
      <section className="border-t border-[#d4a01220] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-x-10 gap-y-2">
          {TRUST_WORDS.map((w) => (
            <span key={w} className="text-[10px] tracking-[0.4em] uppercase text-[#d4a012]/25">
              {w}
            </span>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-[#d4a01220] px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#d4a012]/30">
            Guardrail. Open source under MIT.
          </span>
          <div className="flex items-center gap-8">
            <a href="https://github.com/Manavarya09/Guardrail" target="_blank" rel="noopener noreferrer" className="text-[10px] tracking-[0.3em] uppercase text-[#d4a012]/30 hover:text-[#d4a012] transition-colors">GitHub</a>
            <a href="https://www.npmjs.com/package/@guardrail-ai/cli" target="_blank" rel="noopener noreferrer" className="text-[10px] tracking-[0.3em] uppercase text-[#d4a012]/30 hover:text-[#d4a012] transition-colors">npm</a>
            <a href="https://github.com/Manavarya09/Guardrail/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="text-[10px] tracking-[0.3em] uppercase text-[#d4a012]/30 hover:text-[#d4a012] transition-colors">Contributing</a>
            <a href="https://github.com/Manavarya09/Guardrail/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-[10px] tracking-[0.3em] uppercase text-[#d4a012]/30 hover:text-[#d4a012] transition-colors">License</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
