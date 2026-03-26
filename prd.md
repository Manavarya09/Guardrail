# Guardrail – Product Requirements Document (PRD)

## 🧠 Overview

**Guardrail** is an open-source, developer-first platform that audits, simulates, and fixes code — especially AI-generated code — to ensure it is secure, scalable, and production-ready.

> Ship fast. Stay safe.

---

## 🎯 Vision

To become the **default safety layer for AI-generated code**, acting as a real-time guardian that prevents developers from shipping insecure or unscalable applications.

---

## ❗ Problem Statement

With the rise of AI coding tools, developers are:
- Shipping unreviewed code
- Introducing security vulnerabilities
- Writing inefficient or unscalable logic
- Skipping proper code review processes

### Existing Tools

- ESLint → syntax/style focused
- SonarQube → enterprise-heavy
- Snyk → dependency-focused

### Gaps

- Not built for AI-generated code
- Limited auto-fix capabilities
- No runtime awareness
- Poor developer experience for fast iteration

---

## 💡 Solution

Guardrail provides:
- Static + semantic code analysis
- AI-specific pattern detection
- Auto-fix engine (AST-based)
- Runtime simulation (future)
- Chaos testing (future)
- GitHub PR integration

---

## 🧱 Core Features

### 1. CLI Tool

```bash
npx guardrail scan
npx guardrail fix
npx guardrail simulate
npx guardrail chaos