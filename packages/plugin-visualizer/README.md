# @lunx/plugin-visualizer

> Official Lunx plugin for bundle visualization — interactive HTML treemap report.

## Install

```bash
npm install --save-dev @lunx/plugin-visualizer
```

## Usage

```js
const visualizer = require('@lunx/plugin-visualizer');
module.exports = {
  entry: ['./src/main.ts'],
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: true, // Opens report in browser after build
    }),
  ],
};
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `filename` | `string` | `'dist/stats.html'` | Output path for HTML report |
| `title` | `string` | `'Lunx Bundle Visualizer'` | Report page title |
| `open` | `boolean` | `false` | Auto-open in browser after build |
| `template` | `'treemap' \| 'sunburst' \| 'network'` | `'treemap'` | Visualization type |
| `gzipSize` | `boolean` | `true` | Include gzip size estimates |

## Report

After `lunx build`, open `dist/stats.html` to see:
- **Treemap**: Visual proportional grid of all modules by size
- **Module Table**: Sortable list of every module with size and chunk assignment
- **Summary**: Total modules and bundle size at a glance

Similar to `rollup-plugin-visualizer` and `webpack-bundle-analyzer`.

## Testing

```bash
cd packages/plugin-visualizer
node --test src/__tests__/index.test.js
```

## License

MIT © Avinash-1994
