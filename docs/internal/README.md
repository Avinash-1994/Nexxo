# Urja Internal Documentation — Index

**Purpose**: Governance, contracts, and internal guides  
**Audience**: Core team, advanced contributors  
**Last Updated**: 2025-12-30

---

## 🎯 Purpose

This directory contains **internal documentation** for Urja governance and core engineering.

**These are NOT user-facing docs** — they are operational contracts and mental models for the core team.

---

## 📚 Document Index

### 🔒 Contracts & Policies (Binding)

1. **[EXTENSION_SURFACE.md](./EXTENSION_SURFACE.md)**
   - **Phase**: H2.1
   - **Purpose**: Locks down allowed extension points
   - **Status**: 🔒 Binding
   - **Key Rule**: "If it's not listed here, it's internal"

2. **[PLUGIN_CONTRACT.md](./PLUGIN_CONTRACT.md)**
   - **Phase**: H2.2 (CRITICAL)
   - **Purpose**: Binding specification for all plugins
   - **Status**: 🔒 Binding
   - **Key Rule**: "You can reject a plugin by pointing to one paragraph"

3. **[GOVERNANCE_MODEL.md](./GOVERNANCE_MODEL.md)**
   - **Phase**: H2.3
   - **Purpose**: Maintenance liability control
   - **Status**: 🔒 Active
   - **Key Rule**: "Core team workload must be predictable"

4. **[COMPATIBILITY_POLICY.md](./COMPATIBILITY_POLICY.md)**
   - **Phase**: H2.4
   - **Purpose**: Rules for adding framework support
   - **Status**: 🔒 Locked
   - **Key Rule**: "Compatibility grows because it was needed, not possible"

---

### 📖 Internal Guides (Educational)

5. **[HOW_PLUGINS_WORK.md](./HOW_PLUGINS_WORK.md)**
   - **Phase**: H2.5
   - **Purpose**: Mental model for plugin system
   - **Audience**: Core engineers, advanced plugin authors
   - **Key Insight**: "Plugins are pure functions in a pipeline"

6. **[HOW_COMPATIBILITY_WORKS.md](./HOW_COMPATIBILITY_WORKS.md)**
   - **Phase**: H2.5
   - **Purpose**: Framework integration internals
   - **Audience**: Core engineers
   - **Key Insight**: "Adapters wrap framework compilers"

7. **[WHAT_NOT_TO_TOUCH.md](./WHAT_NOT_TO_TOUCH.md)**
   - **Phase**: H2.5
   - **Purpose**: Prevent accidental core breakage
   - **Audience**: New contributors, core engineers
   - **Key Rule**: "`src/core/*` is sacred — don't touch without approval"

---

### 🧪 Operational Processes

8. **[STABILITY_AUDIT.md](./STABILITY_AUDIT.md)**
   - **Phase**: H2.6
   - **Purpose**: Release gate checklist
   - **Frequency**: Every minor release
   - **Key Rule**: "If any item fails, release is blocked"

---

## 🗂️ Document Categories

### By Phase
- **H2.1**: Extension Surface
- **H2.2**: Plugin Contract (CRITICAL)
- **H2.3**: Governance Model
- **H2.4**: Compatibility Policy
- **H2.5**: Internal Guides (3 docs)
- **H2.6**: Stability Audit

### By Type
- **Contracts**: Extension Surface, Plugin Contract, Governance, Compatibility
- **Guides**: How Plugins Work, How Compatibility Works, What Not to Touch
- **Processes**: Stability Audit

### By Audience
- **Core Team**: All documents
- **Advanced Contributors**: Plugin guides, What Not to Touch
- **Plugin Authors**: Plugin Contract, How Plugins Work

---

## 🎯 How to Use This Documentation

### For New Core Engineers
**Read in this order**:
1. [WHAT_NOT_TO_TOUCH.md](./WHAT_NOT_TO_TOUCH.md) — Learn what's protected
2. [HOW_PLUGINS_WORK.md](./HOW_PLUGINS_WORK.md) — Understand plugin system
3. [HOW_COMPATIBILITY_WORKS.md](./HOW_COMPATIBILITY_WORKS.md) — Framework integration
4. [PLUGIN_CONTRACT.md](./PLUGIN_CONTRACT.md) — Binding rules
5. [GOVERNANCE_MODEL.md](./GOVERNANCE_MODEL.md) — Maintenance model

### For Plugin Authors (Advanced)
**Read in this order**:
1. [PLUGIN_CONTRACT.md](./PLUGIN_CONTRACT.md) — Binding rules
2. [HOW_PLUGINS_WORK.md](./HOW_PLUGINS_WORK.md) — Mental model
3. [EXTENSION_SURFACE.md](./EXTENSION_SURFACE.md) — Allowed APIs

### For Release Managers
**Read in this order**:
1. [STABILITY_AUDIT.md](./STABILITY_AUDIT.md) — Release checklist
2. [GOVERNANCE_MODEL.md](./GOVERNANCE_MODEL.md) — Plugin categories
3. [COMPATIBILITY_POLICY.md](./COMPATIBILITY_POLICY.md) — Framework rules

---

## 🚫 What This Is NOT

- ❌ **NOT user-facing documentation** (see `/docs/*.md` instead)
- ❌ **NOT marketing material** (honest, technical content only)
- ❌ **NOT aspirational** (current reality only)
- ❌ **NOT negotiable** (these are binding contracts)

---

## ✅ What This IS

- ✅ **Operational truth** (how Urja actually works)
- ✅ **Binding contracts** (enforceable rules)
- ✅ **Mental models** (for core engineers)
- ✅ **Governance framework** (predictable maintenance)

---

## 🔄 Maintenance

### When to Update
- **Contracts**: Only with major version bump
- **Guides**: When implementation changes
- **Processes**: When process improves

### Who Can Update
- **Contracts**: Core team consensus required
- **Guides**: Any core engineer (with review)
- **Processes**: Release manager

### Review Process
1. Open PR with changes
2. Tag `@urja/core-team`
3. Require 2+ approvals
4. Update "Last Updated" date
5. Announce in changelog

---

## 🧠 Governance Principle

**"If extending Urja is easier than understanding it, the extension surface is wrong."**

These documents exist to make **correctness the easiest path**.

---

## 📋 Phase H2 Completion Status

| Phase | Document | Status |
|-------|----------|--------|
| H2.1 | Extension Surface | ✅ Complete |
| H2.2 | Plugin Contract | ✅ Complete |
| H2.3 | Governance Model | ✅ Complete |
| H2.4 | Compatibility Policy | ✅ Complete |
| H2.5 | How Plugins Work | ✅ Complete |
| H2.5 | How Compatibility Works | ✅ Complete |
| H2.5 | What Not to Touch | ✅ Complete |
| H2.6 | Stability Audit | ✅ Complete |

**Phase H2 Status**: ✅ **COMPLETE**

---

**Welcome to Urja governance mode.**

**These documents are the foundation of safe ecosystem growth.**
