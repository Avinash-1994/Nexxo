# @lunx/plugin-svelte

> Official Lunx plugin for Svelte — .svelte file transform, Runes, HMR.

## Install

```bash
npm install --save-dev @lunx/plugin-svelte svelte
```

## Usage

```js
const svelte = require('@lunx/plugin-svelte');
module.exports = {
  entry: ['./src/main.ts'],
  plugins: [svelte()],
};
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `hmr` | `boolean` | `true` | Enable Svelte HMR (state resets on save) |
| `runes` | `boolean` | `false` | Enable Svelte 5 Runes mode |
| `compilerOptions` | `object` | `{}` | Options for the Svelte compiler |

## Svelte 5 Runes

Enable the `runes` option to use Svelte 5 reactive state primitives:

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>
```

## HMR Behavior

Svelte's HMR model **resets component state** on save. To preserve state across saves, use Svelte stores:
```ts
import { writable } from 'svelte/store';
export const count = writable(0); // persists across HMR
```

## Testing

```bash
cd packages/plugin-svelte
node --test src/__tests__/index.test.js
```

## License

MIT © Avinash-1994
