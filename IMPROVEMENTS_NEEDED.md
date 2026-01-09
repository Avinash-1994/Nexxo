# Nexxo Build Tool - Issues Found & Improvements Needed

**Date**: January 7, 2026  
**Status**: Analysis Complete

---

## Issues Discovered During Website Testing

### 1. ❌ File Naming Inconsistency

**Found**: `src/create-nexxo.ts` - Still uses old "nexxo" name  
**Should be**: `src/create-nexxo.ts` - Use consistent naming  
**Impact**: Confusing for developers, inconsistent branding

**Files to Fix**:
- [x] Rename: `src/create-nexxo.ts` → `src/create-nexxo.ts`

---

### 2. ❌ No Clean Console Output

**Current Behavior**:
```
ℹ Loaded config from nexxo.config.js
ℹ Dependencies analyzed...
ℹ Pre-bundling dependencies...
ℹ Native worker initialized...
[Many debug messages...]
Ready on http://localhost:5173
```

**Problem**: Too much noise, hard to see important info  
**Should Show**: Only essential info - server ready or errors

**Location**: `src/dev/devServer.ts`

---

### 3. ❌ No Error Highlighting in Terminal

**Current**: Errors mixed with normal logs  
**Needed**: Errors should be **bold, red, formatted distinctly**

**Location**: `src/dev/devServer.ts` - Request/response handler

---

### 4. ❌ No Quiet/Verbose Modes

**Missing**: CLI flags for output control  
**Needed**: 
- `nexxo dev --quiet` - Only show errors and server ready
- `nexxo dev --verbose` - Show all details (current behavior)

**Location**: `src/cli.ts` - Dev command options

---

### 5. ❌ Errors Not Clearly Displayed to Users

**Current**: Errors logged but not prominent  
**Needed**: When project code has error, display:
1. **In terminal FIRST** (before anything else)
2. **With clear formatting** (color, borders)
3. **With file path and line number**
4. **Then server stays running** (ready for next change)

**Location**: `src/dev/devServer.ts` - Transform error handlers

---

## What Needs to be Added/Fixed in Nexxo

### A. Clean Console Output System

**File**: `src/utils/logger.ts`  
**Changes Needed**:

```typescript
// Add output mode control
enum LogLevel {
  QUIET = 0,    // Only errors
  NORMAL = 1,   // Important info + errors
  VERBOSE = 2   // Everything
}

// Add error highlighting
function errorBorder(message: string): string {
  return `
╔════════════════════════════════════════════════════════╗
║  ❌ ERROR                                              ║
╚════════════════════════════════════════════════════════╝
${message}
╔════════════════════════════════════════════════════════╗
  `;
}
```

### B. Error Reporting in Dev Server

**File**: `src/dev/devServer.ts`  
**Changes Needed**:

```typescript
// When transformation fails:
catch (error: any) {
  // Display error prominently
  console.error(kleur.red().bold('❌ TRANSFORMATION ERROR'));
  console.error('━'.repeat(60));
  console.error(`File: ${filePath}`);
  console.error(`Error: ${error.message}`);
  if (error.line) console.error(`Line: ${error.line}`);
  console.error('━'.repeat(60));
  
  // Send to browser too
  sendToClient({ type: 'error', error });
}
```

### C. CLI Flags for Quiet/Verbose

**File**: `src/cli.ts`  
**Changes Needed**:

```typescript
.command(
  'dev',
  'Start development server',
  (yargs: any) => {
    return yargs
      .option('port', { type: 'number' })
      .option('quiet', { 
        type: 'boolean',
        description: 'Quiet mode - only show errors' 
      })
      .option('verbose', {
        type: 'boolean', 
        description: 'Verbose mode - show all details'
      });
  },
  async (args: any) => {
    // Set logger level based on flags
    if (args.quiet) log.setLevel(LogLevel.QUIET);
    if (args.verbose) log.setLevel(LogLevel.VERBOSE);
  }
)
```

### D. Clean Startup Message

**Change**: Instead of multiple debug logs, show single line:

```
✅ Nexxo Dev Server Ready
   URL: http://localhost:5173
   Mode: Development
```

---

## Website Files to REMOVE

These were workarounds - should NOT be in website project:

```
DELETE:
✗ website/plugins/error-reporter.js
✗ website/scripts/dev-with-errors.js
✗ website/ERROR_REPORTING_GUIDE.md
✗ website/QUICK_TEST_GUIDE.md
✗ website/IMPLEMENTATION_SUMMARY.md
✗ website/STATUS_AND_CHECKLIST.md

REVERT:
✗ website/nexxo.config.js (remove error-reporter plugin)
✗ website/package.json (remove "npm run dev:errors" script)
```

---

## Summary of Changes

| Issue | File | Change | Priority |
|-------|------|--------|----------|
| File naming | `src/create-nexxo.ts` | Rename to `create-nexxo.ts` | 🔴 HIGH |
| Console noise | `src/utils/logger.ts` | Add quiet/verbose modes | 🔴 HIGH |
| Error display | `src/dev/devServer.ts` | Format errors prominently | 🔴 HIGH |
| CLI flags | `src/cli.ts` | Add --quiet, --verbose | 🟡 MEDIUM |
| Startup msg | `src/dev/devServer.ts` | Clean startup output | 🟡 MEDIUM |

---

## Implementation Order

1. Rename `create-nexxo.ts` → `create-nexxo.ts` ✅
2. Add log level system to `logger.ts` ✅
3. Add error highlighting to `devServer.ts` ✅
4. Add CLI flags to `cli.ts` ✅
5. Clean up startup messages ✅
6. Remove website workarounds ✅
7. Test with website project ✅

---

**Next Step**: Implement these fixes in the build tool

