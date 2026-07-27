# Framework Support Tiers

**Last Updated**: 2026-01-05  
**Status**: Official Policy for v1.0

---

## Philosophy: Honest Constraints

Lunx supports **ALL frameworks via adapters**, but we believe in **honest maturity levels** rather than false promises.

> **Core Guarantee**: Every framework gets deterministic builds, CSS correctness, and graph-based rebuilds.  
> **Honest Non-Guarantee**: Not every framework gets advanced HMR or framework-specific optimizations at v1.0.

---

## 🥇 Tier 1: Production-Grade (v1.0)

### Frameworks
- **React** (v18/v19)
- **Vue** (v3)

### Guarantees
✅ **Advanced HMR** - 95%+ success rate, graph-derived updates  
✅ **Framework-Specific Optimizations** - Fast Refresh (React), SFC compilation (Vue)  
✅ **Production Battle-Tested** - Tested on 3+ real-world applications  
✅ **Full Documentation** - Complete guides, examples, troubleshooting  
✅ **Deterministic Builds** - Same input → same output, always  
✅ **CSS Correctness** - CSS as first-class graph node  
✅ **Graph-Based Rebuilds** - Only rebuild affected modules  
✅ **lunx verify Support** - Full validation and health checks  

### Use Cases
- Production applications
- Enterprise projects
- Mission-critical builds
- Teams requiring stability guarantees

---

## 🥈 Tier 2: Stable Adapters (v1.0)

### Frameworks
- **Svelte** (v4/v5) - Component compilation, basic HMR
- **Solid** (v1) - JSX pipeline, basic HMR
- **Lit** (v3) - Web components, basic HMR
- **Alpine** (v3) - Runtime-driven, basic HMR
- **Mithril** (v2) - Virtual DOM, basic HMR
- **Preact** (v10) - React-compatible, basic HMR

### Guarantees
✅ **Deterministic Builds** - Same input → same output  
✅ **CSS Correctness** - CSS as first-class graph node  
✅ **Graph-Based Rebuilds** - Only rebuild affected modules  
✅ **lunx verify Support** - Full validation and health checks  
✅ **Production Builds Work** - Optimized, minified, ready to deploy  

### Non-Guarantees
⚠️ **Advanced HMR Edge Cases** - Complex state updates may trigger full reload  
⚠️ **Framework-Specific Optimizations** - Generic optimizations only  
⚠️ **Full Documentation** - Community-driven, may have gaps  

### Use Cases
- Side projects
- Prototypes
- Non-critical applications
- Teams willing to contribute improvements

---

## 🥉 Tier 3: Experimental (v1.0)

### Frameworks
- **Angular** - Basic adapter
- **Qwik** - Community adapter
- **Astro** - Community adapter
- **Others** - Via community contributions

### Guarantees
✅ **Deterministic Builds** - Same input → same output  
✅ **CSS Correctness** - CSS as first-class graph node  
✅ **Graph-Based Rebuilds** - Only rebuild affected modules  
✅ **lunx verify Support** - Basic validation  

### Non-Guarantees
⚠️ **HMR** - May be limited, disabled, or unreliable  
⚠️ **Framework-Specific Features** - Generic pipeline only  
⚠️ **Production Readiness** - Use at your own risk  
⚠️ **Documentation** - Minimal or community-provided  
⚠️ **Support** - Community-driven only  

### Use Cases
- Experimentation
- Community contributions
- Early adopters
- Non-production environments

---

## Migration Path

### Tier 2 → Tier 1
A framework can graduate from Tier 2 to Tier 1 when:
1. **HMR Success Rate** ≥95% on 1000+ update cycles
2. **Battle Testing** - Verified on 3+ real-world applications
3. **Framework-Specific Optimizations** - Implemented and tested
4. **Full Documentation** - Complete guides and examples
5. **Community Demand** - Significant user base requesting Tier 1 status

### Tier 3 → Tier 2
A framework can graduate from Tier 3 to Tier 2 when:
1. **Adapter Stability** - No breaking changes for 3+ months
2. **Basic HMR** - Working for simple cases
3. **Production Builds** - Successfully deployed to production
4. **Community Contributions** - Active maintainer(s)
5. **Documentation** - Basic setup guide exists

---

## Community Adapter Guidelines

Want to add a new framework? Follow these steps:

### 1. Create Adapter Package
```typescript
// packages/@lunx/framework-yourframework/src/index.ts
import { FrameworkAdapter } from 'lunx';

export default function yourFramework(): FrameworkAdapter {
  return {
    name: 'yourframework',
    transform: async (code, id) => {
      // Your transformation logic
    },
    hmr: {
      accept: (id) => {
        // HMR logic (optional for Tier 3)
      }
    }
  };
}
```

### 2. Add Tests
- Deterministic build test
- CSS correctness test
- Graph rebuild test
- `lunx verify` test

### 3. Document Limitations
Be honest about what works and what doesn't.

### 4. Submit PR
Include:
- Adapter code
- Tests
- Documentation
- Example project

### 5. Start at Tier 3
All new adapters start at Tier 3 (Experimental).

---

## FAQ

### Q: Why not make all frameworks Tier 1?
**A**: We believe in **honest constraints** over false promises. Tier 1 requires significant engineering effort, battle testing, and ongoing maintenance. We'd rather have 2 excellent frameworks than 10 mediocre ones.

### Q: Can I use Tier 2/3 frameworks in production?
**A**: Yes, but understand the limitations. Deterministic builds and CSS correctness are guaranteed, but advanced HMR and framework-specific optimizations are not.

### Q: How do I request Tier 1 status for my framework?
**A**: Open an issue with:
1. Evidence of community demand
2. Willingness to contribute to development
3. Real-world use cases
4. Proposed timeline

### Q: What if my framework isn't listed?
**A**: Create a community adapter! Start at Tier 3 and work your way up.

### Q: Will Tier 2/3 frameworks ever be removed?
**A**: No. Once an adapter is stable, it stays. We may mark it as "community-maintained" if the core team can't support it.

---

## Roadmap

### v1.0 (Current)
- Tier 1: React, Vue
- Tier 2: Svelte, Solid, Lit, Alpine, Mithril, Preact
- Tier 3: Angular, Qwik, Astro

### v1.1 (Planned)
- Promote 1-2 Tier 2 frameworks to Tier 1 based on demand
- Stabilize Tier 3 frameworks to Tier 2

### v2.0 (Future)
- Expand Tier 1 to 4-5 frameworks
- Improve HMR for all Tier 2 frameworks
- Better tooling for community adapters

---

**Remember**: Lunx is about **correctness first, speed second**. Every tier gets deterministic builds and CSS correctness. The difference is in the DX polish.
