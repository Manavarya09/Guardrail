"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

// ─── Animation wrapper ──────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

function F({ children, className = "", i = 0 }: { children: React.ReactNode; className?: string; i?: number }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} custom={i} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Counter component ──────────────────────────────────────────────

function Counter({ target, suffix = "", duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, target, duration]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ─── Data ───────────────────────────────────────────────────────────

const STATS = [
  { value: 30, label: "Detection Rules", suffix: "" },
  { value: 7, label: "CLI Commands", suffix: "" },
  { value: 141, label: "Tests Passing", suffix: "" },
  { value: 1, label: "Second Scan", suffix: "s", prefix: "<" },
];

const RULES = [
  { id: "security/hardcoded-api-key", sev: "CRIT", cat: "SECURITY" },
  { id: "security/sql-injection", sev: "CRIT", cat: "SECURITY" },
  { id: "security/xss-vulnerability", sev: "CRIT", cat: "SECURITY" },
  { id: "security/path-traversal", sev: "CRIT", cat: "SECURITY" },
  { id: "security/jwt-misuse", sev: "CRIT", cat: "SECURITY" },
  { id: "security/no-eval", sev: "CRIT", cat: "SECURITY" },
  { id: "security/prototype-pollution", sev: "HIGH", cat: "SECURITY" },
  { id: "security/open-redirect", sev: "HIGH", cat: "SECURITY" },
  { id: "security/insecure-cookie", sev: "HIGH", cat: "SECURITY" },
  { id: "security/insecure-cors", sev: "HIGH", cat: "SECURITY" },
  { id: "ai-codegen/hallucinated-import", sev: "HIGH", cat: "AI-CODEGEN" },
  { id: "ai-codegen/unused-imports", sev: "WARN", cat: "AI-CODEGEN" },
  { id: "ai-codegen/no-async-without-await", sev: "WARN", cat: "AI-CODEGEN" },
  { id: "ai-codegen/fetch-without-error-handling", sev: "WARN", cat: "AI-CODEGEN" },
  { id: "ai-codegen/placeholder-code", sev: "WARN", cat: "AI-CODEGEN" },
  { id: "performance/n-plus-one-query", sev: "HIGH", cat: "PERF" },
  { id: "performance/inefficient-loop", sev: "WARN", cat: "PERF" },
  { id: "quality/dead-code", sev: "WARN", cat: "QUALITY" },
];

const COMPARE = [
  { feature: "Hardcoded secrets", guardrail: true, eslint: "Plugin", sonar: true, snyk: false },
  { feature: "SQL injection", guardrail: true, eslint: false, sonar: true, snyk: false },
  { feature: "XSS detection", guardrail: true, eslint: "Plugin", sonar: true, snyk: false },
  { feature: "JWT misuse", guardrail: true, eslint: false, sonar: false, snyk: false },
  { feature: "Path traversal", guardrail: true, eslint: false, sonar: true, snyk: false },
  { feature: "AI hallucinated imports", guardrail: true, eslint: false, sonar: false, snyk: false },
  { feature: "Async without await", guardrail: true, eslint: false, sonar: false, snyk: false },
  { feature: "Inline code frames", guardrail: true, eslint: false, sonar: false, snyk: false },
  { feature: "AI fix guide (MD)", guardrail: true, eslint: false, sonar: false, snyk: false },
  { feature: "Pre-commit hook", guardrail: true, eslint: "Plugin", sonar: false, snyk: false },
  { feature: "Baseline adoption", guardrail: true, eslint: false, sonar: false, snyk: false },
  { feature: "Git diff scanning", guardrail: true, eslint: false, sonar: false, snyk: false },
  { feature: "AST auto-fix", guardrail: true, eslint: false, sonar: false, snyk: false },
  { feature: "VS Code extension", guardrail: true, eslint: true, sonar: true, snyk: true },
  { feature: "Zero config", guardrail: true, eslint: false, sonar: false, snyk: true },
  { feature: "< 1s scan time", guardrail: true, eslint: false, sonar: false, snyk: false },
];

const SEV: Record<string, string> = {
  CRIT: "bg-red-500/20 text-red-400 border-red-500/30",
  HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  WARN: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  INFO: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

// ─── Page ───────────────────────────────────────────────────────────

export default function Page() {
  const [copied, setCopied] = useState(false);

  return (
    <main className="bg-[#050505] text-white min-h-screen relative">

      {/* ── Nav ─────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#d4a012] flex items-center justify-center">
              <span className="text-[10px] font-black text-[#050505]">G</span>
            </div>
            <span className="text-sm font-semibold tracking-wide">Guardrail</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Rules", "Compare", "Integrate"].map((s) => (
              <a key={s} href={`#${s.toLowerCase()}`} className="text-[13px] text-white/40 hover:text-white transition-colors">{s}</a>
            ))}
            <a href="https://github.com/Manavarya09/Guardrail" target="_blank" rel="noopener noreferrer"
              className="text-[13px] font-medium px-4 py-1.5 rounded-md bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.15] transition-all">
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-14">
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-[#d4a012]/[0.04] blur-[120px] pointer-events-none" />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `linear-gradient(to right, #d4a012 1px, transparent 1px), linear-gradient(to bottom, #d4a012 1px, transparent 1px)`, backgroundSize: "80px 80px" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <F>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#d4a012]/20 bg-[#d4a012]/[0.06] mb-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4a012] animate-pulse" />
                  <span className="text-[11px] font-medium text-[#d4a012] tracking-wide">v0.2.2 — 30 rules, VS Code extension</span>
                </div>
              </F>
              <F i={1}>
                <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[0.92] tracking-[-0.03em]">
                  The safety layer
                  <br />
                  for <span className="text-[#d4a012]">AI-generated</span>
                  <br />
                  code.
                </h1>
              </F>
              <F i={2}>
                <p className="mt-7 text-[15px] md:text-[17px] text-white/50 max-w-xl leading-relaxed">
                  Scan, detect, and auto-fix security vulnerabilities, performance issues, and anti-patterns in code from Copilot, ChatGPT, and Claude — before it ships.
                </p>
              </F>
              <F i={3}>
                <div className="mt-10 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { navigator.clipboard?.writeText("npx @guardrail-ai/cli scan ."); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="group flex items-center gap-3 bg-[#d4a012] text-[#050505] px-6 py-3.5 rounded-lg font-semibold text-sm hover:bg-[#e8b424] transition-all"
                  >
                    <span className="font-mono text-[13px]">npx @guardrail-ai/cli scan .</span>
                    <span className="text-[#050505]/60 group-hover:text-[#050505] transition-colors">
                      {copied ? "Copied!" : "Copy"}
                    </span>
                  </button>
                  <a href="https://github.com/Manavarya09/Guardrail" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-white/10 text-sm font-medium hover:bg-white/[0.04] hover:border-white/20 transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    Star on GitHub
                  </a>
                </div>
              </F>
            </div>

            <F i={3} className="h-[420px] md:h-[520px] lg:h-[600px] flex items-center justify-center">
              <Globe />
            </F>
          </div>
        </div>
      </section>

      {/* ── Stats Counter ─────────────────────── */}
      <section className="border-t border-white/[0.06] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <F key={s.label} i={i}>
                <div className="text-center">
                  <div className="text-4xl md:text-6xl font-black text-[#d4a012] tracking-tight font-mono">
                    {s.prefix ?? ""}<Counter target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-2 text-[13px] text-white/30 tracking-wide uppercase">{s.label}</div>
                </div>
              </F>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────── */}
      <section id="features" className="border-t border-white/[0.06] py-28">
        <div className="max-w-6xl mx-auto px-6">
          <F>
            <p className="text-[13px] text-[#d4a012] font-medium tracking-wide mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Three steps. Zero config.</h2>
          </F>

          <div className="mt-20 grid md:grid-cols-3 gap-0 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-[#d4a012]/40 via-[#d4a012]/20 to-[#d4a012]/40" />

            {[
              { step: "01", title: "Install", desc: "One command. No config files, no setup wizard, no dependency hell.", code: "npx @guardrail-ai/cli scan .", icon: "M4 17l6-6-6-6M12 19h8" },
              { step: "02", title: "Scan", desc: "30 rules analyze your AST in under a second. Inline code frames show exactly what's wrong.", code: "guardrail scan ./src", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
              { step: "03", title: "Fix", desc: "Auto-fix with real AST transforms. Generate an AI fix guide for everything else.", code: "guardrail fix .", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((s, i) => (
              <F key={s.step} i={i}>
                <div className="relative text-center px-8 py-6">
                  <div className="w-24 h-24 mx-auto rounded-2xl bg-[#d4a012]/[0.08] border border-[#d4a012]/20 flex items-center justify-center mb-6">
                    <svg width="32" height="32" fill="none" stroke="#d4a012" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={s.icon}/></svg>
                  </div>
                  <div className="text-[11px] font-mono text-[#d4a012]/60 mb-2">{s.step}</div>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-[14px] text-white/40 leading-relaxed mb-5">{s.desc}</p>
                  <code className="text-[12px] font-mono text-[#d4a012]/60 bg-[#d4a012]/[0.06] px-3 py-1.5 rounded-md border border-[#d4a012]/10">
                    $ {s.code}
                  </code>
                </div>
              </F>
            ))}
          </div>
        </div>
      </section>

      {/* ── Terminal Demo ─────────────────────── */}
      <section className="border-t border-white/[0.06] py-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#d4a012]/[0.03] blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative">
          <F>
            <p className="text-[13px] text-[#d4a012] font-medium tracking-wide mb-3">LIVE PREVIEW</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-12">See it in action.</h2>
          </F>
          <F i={1}>
            <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden glow-amber">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="ml-3 text-[11px] text-white/30 font-mono">guardrail scan ./src</span>
              </div>
              {/* Terminal content */}
              <pre className="p-6 text-[12px] md:text-[13px] leading-[1.8] font-mono overflow-x-auto text-white/60">
{`  `}<span className="text-[#d4a012]">{`   ____                     _           _ _
  / ___|_   _  __ _ _ __ __| |_ __ __ _(_) |
 | |  _| | | |/ _\` | '__/ _\` | '__/ _\` | | |
 | |_| | |_| | (_| | | | (_| | | | (_| | | |
  \\____|\\__,_|\\__,_|_|  \\__,_|_|  \\__,_|_|_|`}</span>{`

  `}<span className="text-white/30">Target     ./src</span>{`
  `}<span className="text-white/30">Rules      30 rules across 4 categories</span>{`
  `}<span className="text-white/30">Engine     AST-powered (Babel parser)</span>{`

  `}<span className="text-red-400">◉</span>{` `}<span className="text-white font-semibold">src/api/auth.ts</span><span className="text-white/30">{`  (4 issues)`}</span>{`
  ──────────────────────────────────────────
    `}<span className="text-red-400">✖</span>{` `}<span className="bg-red-500/20 text-red-400 px-1.5 rounded text-[11px]">CRIT</span>{` `}<span className="text-white">Potential SQL injection</span>{`
      `}<span className="text-white/30">at src/api/auth.ts:18:18</span>{`
        `}<span className="text-white/20">17</span>{` `}<span className="text-white/20">│</span>{` `}<span className="text-white/30">function getUser(db, userId) {'{'}</span>{`
      `}<span className="text-red-400">{'>'}</span>{` `}<span className="text-white/20">18</span>{` `}<span className="text-white/20">│</span>{` `}<span className="text-white">  return db.query("SELECT * FROM users WHERE id = " + userId);</span>{`
           `}<span className="text-white/20">│</span>{`                  `}<span className="text-red-400">^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^</span>{`
        `}<span className="text-white/20">19</span>{` `}<span className="text-white/20">│</span>{` `}<span className="text-white/30">{'}'}</span>{`
      `}<span className="text-[#22d3ee]">↳ Use parameterized queries: db.query("...WHERE id = $1", [id])</span>{`

  `}<span className="text-[#22d3ee]">╔══════════════════════════════════════════╗</span>{`
  `}<span className="text-[#22d3ee]">║</span>{` `}<span className="text-white font-semibold">SCAN RESULTS</span>{`                              `}<span className="text-[#22d3ee]">║</span>{`
  `}<span className="text-[#22d3ee]">╚══════════════════════════════════════════╝</span>{`

  `}<span className="text-white font-semibold">Health</span>{`  `}<span className="text-[#d4a012]">━━━━━━━━━━━━━━━</span><span className="text-white/20">╌╌╌╌╌╌╌╌╌</span>{`  62/100  `}<span className="text-[#d4a012]">[C]</span>{`

  `}<span className="text-white font-semibold">Issues</span>{`  `}<span className="bg-red-500/20 text-red-400 px-1.5 rounded text-[11px]">2 CRITICAL</span>{`  `}<span className="bg-orange-500/20 text-orange-400 px-1.5 rounded text-[11px]">3 HIGH</span>{`  `}<span className="bg-amber-500/20 text-amber-400 px-1.5 rounded text-[11px]">4 WARN</span>{`

  `}<span className="text-[#22d3ee]">┌──────────────────────────────────────────┐</span>{`
  `}<span className="text-[#22d3ee]">│</span>{` `}<span className="text-white font-semibold">WHAT WOULD YOU LIKE TO DO?</span>{`               `}<span className="text-[#22d3ee]">│</span>{`
  `}<span className="text-[#22d3ee]">└──────────────────────────────────────────┘</span>{`

  `}<span className="text-[#22d3ee]">[1]</span>{` Auto-fix 3 issues
  `}<span className="text-[#22d3ee]">[2]</span>{` Generate AI fix guide
  `}<span className="text-[#22d3ee]">[3]</span>{` Generate HTML report
  `}<span className="text-[#22d3ee]">[4]</span>{` Create baseline
  `}<span className="text-[#22d3ee]">[5]</span>{` Install pre-commit hook

  `}<span className="text-[#22d3ee]">→ Pick an option: _</span>
              </pre>
            </div>
          </F>
        </div>
      </section>

      {/* ── VS Code Extension ─────────────────── */}
      <section className="border-t border-white/[0.06] py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <F>
                <p className="text-[13px] text-[#d4a012] font-medium tracking-wide mb-3">VS CODE EXTENSION</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                  Real-time scanning<br />in your editor.
                </h2>
              </F>
              <F i={1}>
                <p className="mt-5 text-[15px] text-white/40 leading-relaxed">
                  Red squiggles on vulnerabilities. Yellow warnings on anti-patterns.
                  Click the lightbulb to auto-fix or suppress. Zero setup.
                </p>
              </F>
              <F i={2}>
                <div className="mt-8 space-y-4">
                  {[
                    "Scans on save — instant feedback",
                    "Quick fix lightbulb actions",
                    "Status bar with severity count",
                    "Scan entire workspace at once",
                    "Configurable rules and severity",
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-[14px] text-white/50">
                      <div className="w-5 h-5 rounded-md bg-[#d4a012]/10 border border-[#d4a012]/20 flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#d4a012" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                      {f}
                    </div>
                  ))}
                </div>
              </F>
            </div>

            {/* Mock VS Code editor */}
            <F i={2}>
              <div className="rounded-xl border border-white/[0.08] bg-[#1e1e1e] overflow-hidden glow-amber">
                {/* VS Code title bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#323233] border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="ml-3 text-[11px] text-white/50">auth.ts — src/api</span>
                  </div>
                  <span className="text-[10px] text-white/30 font-mono">Guardrail: 2 critical</span>
                </div>
                {/* Tab bar */}
                <div className="flex border-b border-white/[0.06]">
                  <div className="px-4 py-1.5 text-[11px] text-white/70 bg-[#1e1e1e] border-r border-white/[0.06] border-b-2 border-b-[#d4a012]">auth.ts</div>
                  <div className="px-4 py-1.5 text-[11px] text-white/30 bg-[#2d2d2d]">routes.ts</div>
                </div>
                {/* Editor content */}
                <div className="p-4 font-mono text-[12px] leading-[1.9]">
                  <div className="flex"><span className="text-white/20 w-8">12</span><span className="text-[#569cd6]">function</span> <span className="text-[#dcdcaa]">getUser</span><span className="text-white/70">(db, userId) {'{'}</span></div>
                  <div className="flex relative">
                    <span className="text-white/20 w-8">13</span>
                    <span className="text-white/70">  </span>
                    <span className="text-[#c586c0]">return</span>
                    <span className="text-white/70"> db.</span>
                    <span className="text-[#dcdcaa]">query</span>
                    <span className="text-white/70">(</span>
                    <span className="decoration-wavy decoration-red-500 underline text-[#ce9178]">{'"SELECT * FROM users WHERE id = "'}</span>
                    <span className="text-white/70"> + userId);</span>
                    {/* Diagnostic tooltip */}
                    <div className="absolute -top-12 left-32 bg-[#252526] border border-red-500/30 rounded-md px-3 py-2 text-[11px] shadow-lg z-10">
                      <span className="text-red-400 font-semibold">guardrail</span><span className="text-white/40"> — </span><span className="text-white/80">Potential SQL injection</span>
                    </div>
                  </div>
                  <div className="flex"><span className="text-white/20 w-8">14</span><span className="text-white/70">{'}'}</span></div>
                  <div className="flex"><span className="text-white/20 w-8">15</span></div>
                  <div className="flex"><span className="text-white/20 w-8">16</span><span className="text-[#569cd6]">const</span> <span className="decoration-wavy decoration-red-500 underline text-white/70">API_KEY</span> <span className="text-white/70">= </span><span className="text-[#ce9178]">{'"sk-abc123456789..."'}</span><span className="text-white/70">;</span></div>
                  <div className="flex"><span className="text-white/20 w-8">17</span></div>
                  <div className="flex"><span className="text-white/20 w-8">18</span><span className="text-[#569cd6]">const</span> <span className="text-white/70">token = </span><span className="decoration-wavy decoration-yellow-500 underline text-white/70">jwt.decode</span><span className="text-white/70">(req.headers.auth);</span></div>
                </div>
                {/* Problems panel */}
                <div className="border-t border-white/[0.06] bg-[#1e1e1e]">
                  <div className="px-4 py-1.5 text-[10px] text-white/40 border-b border-white/[0.06] uppercase tracking-wider">Problems (3)</div>
                  <div className="p-2 space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/[0.04] text-[11px]">
                      <span className="text-red-400">●</span>
                      <span className="text-white/60">Potential SQL injection — use parameterized queries</span>
                      <span className="ml-auto text-white/20">:13</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/[0.04] text-[11px]">
                      <span className="text-red-400">●</span>
                      <span className="text-white/60">Hardcoded secret in variable &quot;API_KEY&quot;</span>
                      <span className="ml-auto text-white/20">:16</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/[0.04] text-[11px]">
                      <span className="text-orange-400">●</span>
                      <span className="text-white/60">jwt.decode() does NOT verify the token</span>
                      <span className="ml-auto text-white/20">:18</span>
                    </div>
                  </div>
                </div>
              </div>
            </F>
          </div>
        </div>
      </section>

      {/* ── Rules ─────────────────────────────── */}
      <section id="rules" className="border-t border-white/[0.06] py-28">
        <div className="max-w-6xl mx-auto px-6">
          <F>
            <p className="text-[13px] text-[#d4a012] font-medium tracking-wide mb-3">DETECTION ENGINE</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">30 rules. 4 categories.</h2>
            <p className="mt-4 text-[15px] text-white/40 max-w-2xl">Every rule uses AST analysis — not regex. Catches patterns that ESLint, Snyk, and SonarQube miss.</p>
          </F>
          <F i={1}>
            <div className="mt-12 rounded-xl border border-white/[0.08] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-5 py-3 text-[11px] text-white/30 font-medium tracking-wider uppercase">Rule</th>
                    <th className="px-5 py-3 text-[11px] text-white/30 font-medium tracking-wider uppercase hidden md:table-cell">Category</th>
                    <th className="px-5 py-3 text-[11px] text-white/30 font-medium tracking-wider uppercase">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {RULES.map((r) => (
                    <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-2.5 text-[13px] text-white/70 font-mono">{r.id}</td>
                      <td className="px-5 py-2.5 text-[11px] text-white/25 tracking-wider uppercase hidden md:table-cell">{r.cat}</td>
                      <td className="px-5 py-2.5"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${SEV[r.sev]}`}>{r.sev}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 bg-white/[0.02] border-t border-white/[0.06] text-[12px] text-white/30">
                + 12 more rules across all categories. <a href="https://github.com/Manavarya09/Guardrail#30-built-in-rules" target="_blank" rel="noopener noreferrer" className="text-[#d4a012] hover:underline">View all 30 rules</a>
              </div>
            </div>
          </F>
        </div>
      </section>

      {/* ── Comparison ─────────────────────────── */}
      <section id="compare" className="border-t border-white/[0.06] py-28 relative">
        <div className="max-w-6xl mx-auto px-6">
          <F>
            <p className="text-[13px] text-[#d4a012] font-medium tracking-wide mb-3">COMPARISON</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Why not just ESLint?</h2>
            <p className="mt-4 text-[15px] text-white/40 max-w-2xl">Traditional tools weren&apos;t built for AI-generated code. Guardrail fills every gap.</p>
          </F>
          <F i={1}>
            <div className="mt-12 rounded-xl border border-white/[0.08] overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-5 py-3 text-[11px] text-white/30 font-medium tracking-wider uppercase">Feature</th>
                    <th className="px-5 py-3 text-[11px] text-[#d4a012] font-semibold tracking-wider uppercase">Guardrail</th>
                    <th className="px-5 py-3 text-[11px] text-white/30 font-medium tracking-wider uppercase">ESLint</th>
                    <th className="px-5 py-3 text-[11px] text-white/30 font-medium tracking-wider uppercase">SonarQube</th>
                    <th className="px-5 py-3 text-[11px] text-white/30 font-medium tracking-wider uppercase">Snyk</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((r) => (
                    <tr key={r.feature} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-2.5 text-[13px] text-white/60">{r.feature}</td>
                      {[r.guardrail, r.eslint, r.sonar, r.snyk].map((val, i) => (
                        <td key={i} className={`px-5 py-2.5 text-[13px] ${i === 0 ? 'font-semibold' : ''}`}>
                          {val === true ? <span className={i === 0 ? "text-[#d4a012]" : "text-green-400/60"}>Yes</span>
                            : val === false ? <span className="text-white/15">No</span>
                            : <span className="text-white/30">{val}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </F>
        </div>
      </section>

      {/* ── Integrations ─────────────────────── */}
      <section id="integrate" className="border-t border-white/[0.06] py-28">
        <div className="max-w-6xl mx-auto px-6">
          <F>
            <p className="text-[13px] text-[#d4a012] font-medium tracking-wide mb-3">INTEGRATIONS</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Works everywhere.</h2>
          </F>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "CLI", sub: "7 commands", code: "guardrail scan .\nguardrail fix .\nguardrail diff main\nguardrail hook install" },
              { name: "VS Code", sub: "Real-time scanning", code: "Install from .vsix:\ncode --install-extension\n  guardrail-0.2.2.vsix" },
              { name: "GitHub Action", sub: "PR annotations", code: "- uses: Manavarya09/Guardrail@v0.1.0\n  with:\n    target: './src'\n    fail-on: 'high'" },
              { name: "Claude Code", sub: "MCP integration", code: '{\n  "mcpServers": {\n    "guardrail": {\n      "command": "npx",\n      "args": ["@guardrail-ai/mcp"]\n    }\n  }\n}' },
              { name: "Reports", sub: "3 formats", code: "guardrail scan . --report md\nguardrail scan . --report html\nguardrail scan . --report sarif" },
              { name: "Pre-commit", sub: "Block bad code", code: "guardrail hook install\n# Blocks commits with\n# critical/high issues\n\nguardrail baseline create\n# Gradual adoption" },
            ].map((item, i) => (
              <F key={item.name} i={i}>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 hover:border-[#d4a012]/20 hover:bg-[#d4a012]/[0.02] transition-all h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#d4a012]/10 border border-[#d4a012]/20 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#d4a012]">{item.name[0]}</span>
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold">{item.name}</div>
                      <div className="text-[11px] text-white/30">{item.sub}</div>
                    </div>
                  </div>
                  <pre className="text-[11px] font-mono text-white/40 leading-relaxed">{item.code}</pre>
                </div>
              </F>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#d4a012]/[0.03] blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <F>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]">
              Stop shipping
              <br />
              <span className="text-[#d4a012]">vulnerable code.</span>
            </h2>
          </F>
          <F i={1}>
            <p className="mt-6 text-[16px] text-white/40 max-w-lg mx-auto leading-relaxed">
              One command. 30 rules. Under a second. Free and open source forever.
            </p>
          </F>
          <F i={2}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => { navigator.clipboard?.writeText("npx @guardrail-ai/cli scan ."); }}
                className="group flex items-center justify-center gap-2 bg-[#d4a012] text-[#050505] px-8 py-4 rounded-lg font-bold text-sm hover:bg-[#e8b424] transition-all"
              >
                <span className="font-mono">npx @guardrail-ai/cli scan .</span>
              </button>
              <a href="https://github.com/Manavarya09/Guardrail" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-white/10 text-sm font-semibold hover:bg-white/[0.04] transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                Star on GitHub
              </a>
            </div>
          </F>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-[#d4a012] flex items-center justify-center">
              <span className="text-[8px] font-black text-[#050505]">G</span>
            </div>
            <span className="text-[12px] text-white/30">Guardrail. Open source under MIT.</span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "GitHub", href: "https://github.com/Manavarya09/Guardrail" },
              { label: "npm", href: "https://www.npmjs.com/package/@guardrail-ai/cli" },
              { label: "Contributing", href: "https://github.com/Manavarya09/Guardrail/blob/main/CONTRIBUTING.md" },
              { label: "Issues", href: "https://github.com/Manavarya09/Guardrail/issues" },
            ].map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="text-[12px] text-white/25 hover:text-white/60 transition-colors">{l.label}</a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
