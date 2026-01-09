/**
 * Plugin Authoring Guide for Nexxo v1
 * 
 * follow strict strict rules to ensure stability and compatibility.
 */

/*
# Nexxo Plugin API Reference

Nexxo plugins are compatible with Rollup plugins, with additional governance for stability.

## Required Properties

- `name` (string): Unique ID (e.g. `nexxo-plugin-my-feature`)
- `stability` (string): 'experimental' | 'stable' | 'deprecated'

## Hooks

All standard Rollup hooks are supported:
- `buildStart()`
- `resolveId(source, importer)`
- `load(id)`
- `transform(code, id)`
- `buildEnd()`

## Example

```typescript
import { Plugin } from 'nexxo';

export function myPlugin(): Plugin {
  return {
    name: 'nexxo-plugin-example',
    stability: 'stable',
    async transform(code, id) {
      if (id.endsWith('.foo')) {
        return code.replace('foo', 'bar');
      }
    }
  };
}
```
*/
