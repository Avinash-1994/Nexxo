# Nexxo Module 5 User Guide: Audit & Auto-Fix

Welcome to the advanced audit and auto-fix capabilities of Nexxo. This guide covers how to use the built-in tools to optimize your codebase.

## 🚀 Features at a Glance

| Feature | Description | Command |
| :--- | :--- | :--- |
| **Terminal Warnings** | Live diagnostic UI with actionable fixes | `nexxo build` |
| **Root Cause Graph** | Visualize dependency bloat and cycles | `nexxo audit --visualize` |
| **Auto-Fix Engine** | Automatically repair code issues | `nexxo audit --fix` |
| **Repro Dashboard** | 1-Click bug reproduction sharing | `nexxo repro` |

---

## 🛠️ Auto-Fix Engine

Nexxo's `AutoFixEngine` uses AST analysis to safely refactor your code.

### Supported Fixes
1.  **Tree-Shaking**: Removes unused imports and exports across modules.
2.  **Semantic HTML**: Converts `<div>` soup to semantic tags (`<header>`, `<nav>`, etc).
3.  **Accessibility**: Adds missing `aria-labels` and `alt` attributes.
4.  **Dynamic Imports**: Converts large static imports (>100KB) to dynamic `import()`.

### Usage
```bash
# Run audit and apply safe fixes automatically
nexxo audit --fix

# Dry run to see what would change
nexxo audit --fix --dry-run
```

---

## 🔍 Root Cause Analysis

Visualize your deep dependency graph to find bloat.

### Features
- **Cycle Detection**: Finds `A -> B -> A` circular dependencies.
- **Bloat Detection**: Highlights large dependencies (>500KB).
- **Graph Slicing**: Focus on a specific sub-tree.

### Usage
```bash
# Generate WebGPU visualization
nexxo audit --graph

# Export analysis to JSON
nexxo audit --graph --json=analysis.json
```

---

## 🐛 Repro Dashboard

Share bug reproductions instantly with your team.

### How to use
1. Run `nexxo repro` to open the dashboard.
2. Select your framework (React, Vue, Svelte, Solid, etc.).
3. Paste your code snippet.
4. Click **"Submit to GitHub"** to create an issue automatically.

---

## ⚙️ Configuration (`nexxo.config.js`)

Customize the audit behavior in your config file:

```javascript
module.exports = {
  audit: {
    // Fail CI if critical issues found
    ciThresholds: {
      failOnCritical: true,
      warningMax: 10
    },
    // Enable/disable auto-fix categories
    autoFix: {
      imports: true,
      a11y: true,
      performance: false
    }
  }
}
```

---

## 🏎️ Performance Benchmarks

Nexxo is designed for speed:
- **Audit Overhead**: < 0.1% overhead on builds.
- **Analysis Speed**: < 10ms for 10,000 module graphs.
- **Scalability**: Tested on monorepos with 100k+ files.
