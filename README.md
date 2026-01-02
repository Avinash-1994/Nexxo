# Urja - The Honest Build System

> **Build with Integrity.** No hidden configs, no magic, just pure performance.

Urja is a production-grade build engine designed for technical architects who demand stability, transparency, and performance. It enforces architectural discipline through a frozen core and strictly isolated framework adapters.

![Versions](https://img.shields.io/badge/Urja-v1.0.0--Freeze-blue)
![Stability](https://img.shields.io/badge/Stability-Stable-success)
![License](https://img.shields.io/badge/License-MIT-green)

## 📚 Documentation

The official documentation website is available at [http://localhost:5174](http://localhost:5174) (when running locally).

To run the documentation website:

```bash
cd website
npx urja dev
```

## 🚀 Key Features

- **Frozen Core Architecture**: Stability by design. The core logic is locked, ensuring no breaking changes.
- **Micro-Frontend First**: Built-in Federation v2 with strict "One Framework per MFE" policy.
- **HMR Engine**: Custom Rust-backed HMR with sub-50ms latency.
- **Universal Framework Support**:
  - **Tier 1 (Core)**: React, Vue, Solid
  - **Tier 2 (Verified)**: Angular, Svelte, Lit
  - **Tier 3 (Experimental)**: Qwik, Astro
- **AI Self-Healing**: Automated error detection and fix suggestions.
- **Quality Auditing**: Built-in SEO, Accessibility, and Performance audits.

## 📦 Quick Start

### Installation

```bash
npm install -g urja
```

### Create a New Project

```bash
urja init
```

### Run Development Server

```bash
npx urja dev
```

## 🛠️ Developer Guide

### Prerequisites

- Node.js v18+
- Rust & Cargo (for native extensions)

### Building from Source

```bash
# Install dependencies
npm install

# Build the project (includes native worker)
npm run build
```

### Running Tests

```bash
npm test
```

## 🤝 Governance & Stability

Urja follows a **Frozen Core** philosophy.
- The Core Orchestrator is immutable.
- New features are added via **Plugins** and **Transformers**.
- API stability is guaranteed for all LTS releases.

See the [Governance Hub](/website/src/pages/GovernanceHub.tsx) in the documentation for more details.

## 📄 License

MIT © 2026 Urja Build Systems
