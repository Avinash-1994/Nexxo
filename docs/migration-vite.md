# Migrating from Vite to Lunx

Lunx is designed to be a fast replacement for Vite.

## 1. Quick Switch
Run the auto-migration command:
```bash
npx lunx migrate
```

## 2. Manual Migration

### Update scripts
Change your content in `package.json`:
```json
"scripts": {
  "dev": "lunx dev",
  "build": "lunx build"
}
```

### Reuse Vite Plugins
Lunx can reuse many Vite-compatible plugins through compatibility adapters.

```ts
// lunx.config.ts
import { defineConfig } from 'lunx';
import { rollupAdapter } from '@lunx/plugin-compat';
import someVitePlugin from 'vite-plugin-cool';

export default defineConfig({
  plugins: [
    rollupAdapter(someVitePlugin())
  ]
});
```

## 3. Environment Variables
Lunx respects `.env` files exactly like Vite. Use `import.meta.env` as usual.

## 4. Key Differences
| Feature | Vite | Lunx |
|---------|------|-------|
| Startup | ~400ms | < 50ms |
| Build | esbuild/Rollup | Native Rust |
| HMR | Fast | Instant (Delta Cache) |
