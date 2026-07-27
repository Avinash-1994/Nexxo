# @lunx/plugin-legacy

> Official Lunx plugin for legacy browser support — ES5 transpilation and core-js polyfills.

## Install

```bash
npm install --save-dev @lunx/plugin-legacy
npm install core-js regenerator-runtime
```

## Usage

```js
const legacy = require('@lunx/plugin-legacy');
module.exports = {
  entry: ['./src/main.ts'],
  plugins: [
    legacy({
      targets: ['IE 11', 'Chrome 49'],
    }),
  ],
};
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `targets` | `string \| string[]` | `'> 0.5%, last 2 versions, IE 11'` | Browserslist targets |
| `polyfills` | `boolean` | `true` | Inject core-js polyfills |
| `corejs` | `2 \| 3` | `3` | core-js version |
| `regenerator` | `boolean` | `true` | Include regenerator-runtime |

## How It Works

The plugin emits two separate bundles:
- **Modern bundle** (unchanged): served via `<script type="module">`
- **Legacy bundle** (ES5 + polyfills): served via `<script nomodule>`

Modern browsers load only the modern bundle. Legacy browsers (IE 11, old Chrome/Safari) load the legacy bundle with polyfills.

## Testing

```bash
cd packages/plugin-legacy
node --test src/__tests__/index.test.js
```

## License

MIT © Avinash-1994
