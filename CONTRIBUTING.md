# Contributing to Urja Build Tool

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Plugin Development](#plugin-development)

---

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community

---

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm, yarn, or pnpm
- Rust (for native worker development)
- Git

### Fork and Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/next-gen-build-tool.git
cd next-gen-build-tool

# Add upstream remote
git remote add upstream https://github.com/Avinash-1994/next-gen-build-tool.git
```

---

## Development Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
node tests/resolver_repro.mjs
node tests/dev_server_test.mjs
node tests/parallel_plugin_test.mjs
# ... run all tests

# Start dev server (for testing)
node dist/cli.js dev
```

### Building Rust Native Worker

```bash
cd native
cargo build --release
cp target/release/liburja_native.so ../urja_native.node
```

---

## Project Structure

```
build/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── config/             # Configuration management
│   ├── dev/                # Development server & HMR
│   ├── resolve/            # Module resolution & dependency graph
│   ├── plugins/            # Plugin system & sandbox
│   ├── native/             # Rust native worker bindings
│   ├── builder/            # Visual builder backend (Phase 4)
│   └── ai/                 # AI analyzer & suggestions (Phase 4)
├── native/                 # Rust native worker source
├── builder-ui/             # Svelte Visual Builder UI (Phase 4)
├── tests/                  # Test files
├── scripts/                # Utility scripts
├── config/                 # Plugin keys & trust config
└── public/                 # Static files for dev server
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Provide type annotations for public APIs
- Use `interface` for object shapes, `type` for unions/intersections

**Example:**

```typescript
interface BuildConfig {
  entry: string[];
  outDir?: string;
  mode?: 'development' | 'production';
}

export async function build(config: BuildConfig): Promise<void> {
  // ...
}
```

### Style Guide

- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings
- **Semicolons:** Use them
- **Line Length:** Max 100 characters
- **Naming:**
  - `camelCase` for variables and functions
  - `PascalCase` for classes and interfaces
  - `UPPER_SNAKE_CASE` for constants

### Formatting

We don't currently use automated formatting, but please follow the existing style in the codebase.

---

## Testing Guidelines

### Writing Tests

All new features should include tests:

```javascript
// tests/my_feature_test.mjs
import assert from 'assert';

async function test() {
  // Setup
  const result = await myFeature();
  
  // Assert
  assert.strictEqual(result.status, 'success');
  
  console.log('✅ PASS: My feature works');
  process.exit(0);
}

test().catch(err => {
  console.error('❌ FAIL:', err);
  process.exit(1);
});
```

### Test Categories

1. **Unit Tests** - Test individual functions
2. **Integration Tests** - Test component interactions
3. **End-to-End Tests** - Test full workflows

### Running Tests

```bash
# Run specific test
node tests/resolver_repro.mjs

# Run all tests (manual for now)
for test in tests/*.mjs tests/*.cjs; do
  node "$test" || exit 1
done
```

### Test Best Practices

- ✅ Test both success and failure cases
- ✅ Clean up after tests (delete temp files)
- ✅ Use descriptive test names
- ✅ Make tests deterministic (no random data)
- ✅ Keep tests fast (<5 seconds each)

---

## Submitting Changes

### Branching Strategy

- `main` - Stable, production-ready code
- `develop` - Integration branch for features
- `feature/your-feature` - Feature branches
- `fix/bug-description` - Bug fix branches

### Creating a Pull Request

1. **Create a branch**
   ```bash
   git checkout -b feature/my-awesome-feature
   ```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add awesome feature

   - Implement feature X
   - Add tests for feature X
   - Update README with feature X usage"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/my-awesome-feature
   ```

5. **Open a Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Choose `base: main` and `compare: your-branch`
   - Fill out the PR template
   - Submit!

### Commit Message Guidelines

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Adding tests
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `chore:` Maintenance tasks

**Examples:**

```bash
feat(plugins): add plugin timeout configuration

fix(hmr): resolve WebSocket connection issues on Windows

docs(readme): add troubleshooting section

test(resolver): add tests for multiline imports
```

### Pull Request Checklist

Before submitting, ensure:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No merge conflicts with `main`

---

## Plugin Development

### Creating a Plugin

1. **Create plugin file:**

```javascript
// plugins/my-plugin.mjs
export const name = 'my-plugin';

export async function transform(code, id) {
  // Your transformation logic
  return code.replace(/old/g, 'new');
}
```

2. **Sign the plugin:**

```bash
node scripts/sign_plugin.mjs plugins/my-plugin.mjs \
  --publisher yourname \
  --version 1.0.0 \
  --key path/to/private-key.pem
```

3. **Add to configuration:**

```json
{
  "plugins": [
    {
      "name": "my-plugin",
      "enabled": true
    }
  ]
}
```

4. **Test your plugin:**

```javascript
// tests/my_plugin_test.mjs
import { PluginManager } from '../dist/plugins/index.js';

const pm = new PluginManager();
await pm.registerPlugin({ name: 'my-plugin', transform: yourTransform });

const result = await pm.transform('old code', 'test.js');
assert(result === 'new code');
```

### Plugin Best Practices

- ✅ Handle errors gracefully
- ✅ Return original code if no changes needed
- ✅ Be mindful of performance
- ✅ Document configuration options
- ✅ Add tests for edge cases

---

## Documentation

### Updating Docs

When adding features, update:

- `README.md` - Main documentation
- `docs/` - Detailed guides
- JSDoc comments in code
- CHANGELOG.md

### Writing Style

- Use clear, concise language
- Include code examples
- Provide context and rationale
- Test all code snippets

---

## Questions?

- Open an [Issue](https://github.com/Avinash-1994/next-gen-build-tool/issues)
- Start a [Discussion](https://github.com/Avinash-1994/next-gen-build-tool/discussions)

---

## Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort! 🙏
