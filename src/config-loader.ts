/**
 * src/config-loader.ts
 *
 * Loads and merges lunx.config.js / lunx.config.ts,
 * with support for `extends` (base config inheritance).
 *
 * Replace / augment your existing config loader with this.
 */

import path from 'path'
import fs from 'fs'
import { pathToFileURL } from 'url'
import type { BuildConfig } from './config/index.js'

// Use the existing BuildConfig type from config/index.ts as LunxConfig alias
export type LunxConfig = BuildConfig

// ─── Deep merge ───────────────────────────────────────────────────────────────

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
}

/**
 * Deep merge two config objects.
 * Arrays are replaced (not concatenated) — plugins, entry, etc. are intentional overrides.
 * Nested objects are merged recursively.
 */
export function mergeConfig(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...base }

  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = mergeConfig(
        result[key] as Record<string, unknown>,
        value as Record<string, unknown>
      )
    } else {
      result[key] = value
    }
  }

  return result
}

// ─── Config file resolution ───────────────────────────────────────────────────

const CONFIG_FILE_NAMES = [
  'lunx.config.ts',
  'lunx.config.js',
  'lunx.config.mjs',
  'lunx.config.cjs',
]

export async function findConfigFile(root: string): Promise<string | null> {
  for (const name of CONFIG_FILE_NAMES) {
    const filePath = path.join(root, name)
    if (fs.existsSync(filePath)) return filePath
  }
  return null
}

async function loadRawConfig(filePath: string): Promise<LunxConfig & { extends?: string }> {
  const ext = path.extname(filePath)
  const fileUrl = pathToFileURL(filePath).href

  try {
    if (ext === '.ts') {
      // TypeScript config — use tsx/esm if available
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore — tsx/esm has no type declarations; this is an optional dev dependency
        const { register } = await import('tsx/esm').catch(() => ({ register: null }))
        if (register) (register as () => void)()
      } catch {
        // tsx not available — fall through to dynamic import (may fail for .ts)
      }
    }

    const mod = await import(fileUrl)
    const config = mod.default ?? mod

    if (typeof config === 'function') {
      // Support: export default defineConfig({...}) where defineConfig returns the config
      return config()
    }

    return config
  } catch (err) {
    throw new Error(
      `[lunx] Failed to load config from "${filePath}":\n  ${(err as Error).message}\n` +
      `  Make sure the file is valid JS/TS and exports a default config object.`
    )
  }
}

// ─── Main loader ──────────────────────────────────────────────────────────────

export interface LoadConfigResult {
  config: LunxConfig
  configFile: string | null
}

/**
 * Load lunx config from the given root directory.
 * Supports:
 * - lunx.config.ts / .js / .mjs / .cjs
 * - `extends` field for base config inheritance
 * - Deep merge of extended + local config
 *
 * @example
 * // lunx.config.js in a monorepo package
 * module.exports = {
 *   extends: '../../lunx.base.config.js',
 *   dev: { port: 3001 }  // override only what changes
 * }
 */
export async function loadConfigExtended(root = process.cwd()): Promise<LoadConfigResult> {
  const configFile = await findConfigFile(root)

  if (!configFile) {
    // Return sensible defaults if no config file found
    const defaults = getDefaults()
    return { config: defaults, configFile: null }
  }

  const rawConfig = await loadRawConfig(configFile)

  // Handle `extends` field
  if (rawConfig.extends) {
    const baseConfigPath = path.resolve(path.dirname(configFile), rawConfig.extends)

    if (!fs.existsSync(baseConfigPath)) {
      throw new Error(
        `[lunx] Config "extends" path not found: "${baseConfigPath}"\n` +
        `  Resolved from: "${configFile}"`
      )
    }

    const baseRaw = await loadRawConfig(baseConfigPath)

    // Recursively handle extends chain (base can also extend something)
    let baseConfig: LunxConfig = baseRaw
    if (baseRaw.extends) {
      const { config: resolvedBase } = await loadConfigExtended(path.dirname(baseConfigPath))
      baseConfig = resolvedBase
    }

    // Merge: base first, then local overrides
    const { extends: _, ...localWithoutExtends } = rawConfig
    const merged = mergeConfig(
      baseConfig as unknown as Record<string, unknown>,
      localWithoutExtends as unknown as Record<string, unknown>
    )

    return {
      config: applyDefaults(merged as LunxConfig),
      configFile,
    }
  }

  return {
    config: applyDefaults(rawConfig),
    configFile,
  }
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

function getDefaults(): LunxConfig {
  return {
    root: process.cwd(),
    entry: ['./src/main.ts'],
    outDir: 'build_output',
    port: 5173,
    mode: 'development',
    platform: 'browser',
    preset: 'spa',
  }
}

function applyDefaults(config: LunxConfig): LunxConfig {
  const defaults = getDefaults()
  return mergeConfig(
    defaults as unknown as Record<string, unknown>,
    config as unknown as Record<string, unknown>
  ) as unknown as LunxConfig
}

// ─── Config validator ─────────────────────────────────────────────────────────

export interface ConfigValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validateConfig(config: LunxConfig): ConfigValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // entry must be defined
  if (!config.entry || (Array.isArray(config.entry) && config.entry.length === 0)) {
    errors.push('`entry` is required and must have at least one file')
  }

  // lib + federation cannot be used together (different output modes)
  if (config.federation) {
    // federation name must be a valid JS identifier
    if (config.federation.name && !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(config.federation.name)) {
      errors.push(
        `federation.name "${config.federation.name}" must be a valid JS identifier (no hyphens, spaces, or special chars)`
      )
    }
  }

  // outDir should not be inside src
  if (config.outDir && config.outDir.startsWith('./src')) {
    errors.push('`outDir` should not be inside `./src` — this would overwrite your source files')
  }

  // server.proxy target must be a valid URL
  if (config.server?.proxy) {
    for (const [key, val] of Object.entries(config.server.proxy)) {
      const target = typeof val === 'string' ? val : (val as any).target
      if (target) {
        try {
          new URL(target)
        } catch {
          errors.push(`server.proxy["${key}"].target "${target}" is not a valid URL`)
        }
      }
    }
  }

  // Warn if using tailwind but no tailwind config
  if (config.css?.framework === 'tailwind') {
    const hasTailwindConfig = ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.cjs']
      .some(f => fs.existsSync(path.join(process.cwd(), f)))
    if (!hasTailwindConfig) {
      warnings.push(
        'css.framework is "tailwind" but no tailwind.config.js found. ' +
        'Run: npx tailwindcss init'
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
