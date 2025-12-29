# Zero-Config Multi-Framework Support

## Overview
The build tool now supports automatic framework detection and configuration, eliminating the need for manual setup in most cases.

## Auto-Detection
The build tool automatically detects your framework by:
1. Scanning `package.json` for framework dependencies (React, Vue, Svelte, Angular, Solid, Preact)
2. Falling back to file extension scanning (`.vue`, `.svelte`, `.tsx`)
3. Applying appropriate default configurations

### Supported Frameworks
- **React**: Detected via `react` dependency or `.tsx` files
- **Vue**: Detected via `vue` dependency or `.vue` files
- **Svelte**: Detected via `svelte` dependency or `.svelte` files
- **Angular**: Detected via `@angular/core` dependency
- **Solid**: Detected via `solid-js` dependency
- **Preact**: Detected via `preact` dependency

## Presets
Choose a preset to optimize for your application architecture:

### SPA (Single Page Application) - Default
```json
{
  "preset": "spa"
}
```
Optimized for client-side routing and browser-based applications.

### SSR (Server-Side Rendering)
```json
{
  "preset": "ssr"
}
```
Configured for server-side rendering with Node.js target.

### SSG (Static Site Generation)
```json
{
  "preset": "ssg"
}
```
Optimized for pre-rendering static HTML at build time.

## Extensibility
Add custom framework detectors via the plugin API:

```typescript
import { registerFrameworkDetector } from 'urja-build-tool';

registerFrameworkDetector(async (root) => {
  // Custom detection logic
  const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf-8'));
  if (pkg.dependencies?.['my-framework']) {
    return { name: 'my-framework', version: pkg.dependencies['my-framework'] };
  }
  return null;
});
```

## Configuration
While zero-config works for most cases, you can still customize:

```json
{
  "preset": "spa",
  "entry": ["src/index.tsx"],
  "outDir": "dist",
  "platform": "browser"
}
```

## Examples

### React SPA (Zero Config)
No configuration needed! Just run:
```bash
npx urja-build dev
```

### Vue SSR
```json
{
  "preset": "ssr",
  "entry": ["src/entry-server.ts", "src/entry-client.ts"]
}
```

### Svelte SSG
```json
{
  "preset": "ssg"
}
```
