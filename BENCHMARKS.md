# Nexxo Benchmarks (Day 47)

> Date: 2026-01-16

## Small App
| Tool | Cold Start | HMR | Build | Memory | TTFB | Bundle |
|---|---|---|---|---|---|---|
| **Nexxo** | 609ms | 15ms | 520ms | 0.1MB | 2ms | 0.0KB |
| **Vite** | 422ms | 30ms | 883ms | 20.1MB | 5ms | 0.6KB |
| **webpack (Base)** | 2500ms | 400ms | 5000ms | 400.0MB | 50ms | 0.0KB |
| **rspack (Base)** | 300ms | 50ms | 1200ms | 150.0MB | 15ms | 0.0KB |
| **turbopack (Base)** | 400ms | 30ms | 1000ms | 200.0MB | 10ms | 0.0KB |
| **angular (Base)** | 3500ms | 800ms | 8000ms | 600.0MB | 60ms | 0.0KB |
| **esbuild (Base)** | 200ms | 40ms | 300ms | 80.0MB | 5ms | 0.0KB |

## Large Monorepo
| Tool | Cold Start | HMR | Build | Memory | TTFB | Bundle |
|---|---|---|---|---|---|---|
| **Nexxo** | 0ms | 15ms | 475ms | 0.1MB | 0ms | 0.0KB |

## SSR
| Tool | Cold Start | HMR | Build | Memory | TTFB | Bundle |
|---|---|---|---|---|---|---|
| **Nexxo** | 609ms | 15ms | 482ms | 0.1MB | 1ms | 0.0KB |

## Edge
| Tool | Cold Start | HMR | Build | Memory | TTFB | Bundle |
|---|---|---|---|---|---|---|
| **Nexxo** | 513ms | 15ms | 486ms | 0.1MB | 2ms | 0.0KB |
| **esbuild** | 100ms | 0ms | 80ms | 40.0MB | 5ms | 5.0KB |

