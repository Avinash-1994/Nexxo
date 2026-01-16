# Contributing to Nexxo

We welcome contributions! Please follow these guidelines to ensure a smooth process.

## Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Build Core**:
   ```bash
   npm run build
   ```

## Workflow

1. **Create a Branch**: Use descriptive names (e.g., `feature/async-optimizations`).
2. **Implement Changes**.
3. **Verify locally**: Run the Regression Suite.
   ```bash
   npx tsx src/test/runner.ts
   npx tsx src/test/determinism.ts
   ```
4. **Submit PR**: Ensure CI passes.

## Code Style

- Use TypeScript for all source code.
- Follow ESLint configuration (`npm run lint`).
- Architecture: 
  - `src/core`: Engine, Pipeline, Optimizer.
  - `src/dev`: Dev Server, HMR.
  - `src/security`: Anomaly Detection.

## Security

If you discover a security vulnerability, please report it privately or verify it using the Anomaly Detection suite (`src/e2e/security.test.ts`).

## License

MIT
