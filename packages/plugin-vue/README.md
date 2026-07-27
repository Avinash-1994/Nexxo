# @lunx/plugin-vue

> Official Lunx plugin for Vue 3 — SFC parsing, HMR, DevTools, scoped styles.

## Install

```bash
npm install --save-dev @lunx/plugin-vue vue @vue/compiler-sfc
```

## Usage

```js
const vue = require('@lunx/plugin-vue');
module.exports = {
  entry: ['./src/main.ts'],
  plugins: [vue()],
};
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `hmr` | `boolean` | `true` | Enable Vue SFC hot-reload |
| `devtools` | `boolean` | `true` | Enable Vue DevTools integration |
| `compilerOptions` | `object` | `{}` | Options passed to `@vue/compiler-sfc` |

## Features

- **SFC HMR**: Template-only changes are hot-patched (state preserved). Script changes trigger a component remount.
- **Scoped Styles**: `<style scoped>` is handled by Vue's compiler — no config needed.
- **CSS Modules**: Use `<style module>` or access via `useCssModule()`.
- **`<script setup>`**: Fully supported with TypeScript.

## Testing

```bash
cd packages/plugin-vue
node --test src/__tests__/index.test.js
```

## License

MIT © Avinash-1994
