/**
 * src/dev-middleware.ts
 *
 * Dev server middleware API + proxy support.
 * Framework-agnostic — works with Node.js http.IncomingMessage / http.ServerResponse.
 *
 * MIGRATION NOTE: Express-specific applyMiddleware / applyProxies / applyCORS signatures
 * are deprecated. The framework-agnostic Request/Response types are now used.
 * See https://lunx.dev/migrate#dev-middleware
 */

import type { BuildConfig } from './config/index.js'
import http from 'http'
import https from 'https'
import { URL } from 'url'

// ─── Framework-agnostic types ─────────────────────────────────────────────────

export type Request  = http.IncomingMessage & { url: string; method: string; body?: any }
export type Response = http.ServerResponse & {
  status: (code: number) => Response
  json:   (data: any)    => void
  send:   (data: any)    => void
}
export type NextFunction = (err?: any) => void
export type MiddlewareFn = (req: Request, res: Response, next: NextFunction) => void | Promise<void>

// ─── User middleware ──────────────────────────────────────────────────────────

/**
 * Apply user-defined middleware from config.server.middleware.
 * These run BEFORE static file serving and HMR.
 *
 * @example
 * // lunx.config.js
 * module.exports = {
 *   server: {
 *     middleware: [
 *       (req, res, next) => {
 *         res.setHeader('X-Custom-Header', 'lunx')
 *         next()
 *       }
 *     ]
 *   }
 * }
 */
export function applyMiddleware(app: any, config: BuildConfig): void {
  const middlewares = (config.server as Record<string, unknown> | undefined)
    ?.['middleware'] as MiddlewareFn[] | undefined

  if (!middlewares || middlewares.length === 0) return

  // app.use is the connect/express API — when using with uWebSockets, pipe through a connect shim
  for (const fn of middlewares) {
    if (typeof fn === 'function') {
      if (typeof app.use === 'function') {
        app.use((req: any, res: any, next: any) => {
          try {
            const result = fn(req, res, next)
            if (result instanceof Promise) result.catch(next)
          } catch (err) {
            next(err)
          }
        })
      }
    }
  }
}

// ─── Proxy ────────────────────────────────────────────────────────────────────

interface ProxyTarget {
  target: string
  changeOrigin?: boolean
  rewrite?: (path: string) => string
  secure?: boolean
}

/**
 * Apply proxy rules from config.server.proxy.
 *
 * @example
 * // lunx.config.js
 * module.exports = {
 *   server: {
 *     proxy: {
 *       '/api': { target: 'http://localhost:8080', changeOrigin: true }
 *     }
 *   }
 * }
 */
export function applyProxies(app: any, config: BuildConfig): void {
  const proxy = config.server?.proxy
  if (!proxy || Object.keys(proxy).length === 0) return

  for (const [prefix, proxyConfig] of Object.entries(proxy)) {
    const target = proxyConfig as unknown as ProxyTarget

    if (typeof app.use === 'function') {
      app.use(prefix, (req: any, res: any) => {
        const targetPath = target.rewrite
          ? target.rewrite(prefix + (req.url ?? '/'))
          : (req.url ?? '/')
        proxyRequest(req, res, target.target, targetPath, target.changeOrigin ?? false)
      })
    }

    console.log(`  [lunx] Proxy: ${prefix} → ${target.target}`)
  }
}

function proxyRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  targetBase: string,
  targetPath: string,
  changeOrigin: boolean
): void {
  let parsedTarget: URL
  try {
    parsedTarget = new URL(targetBase)
  } catch {
    res.writeHead(502)
    res.end(`[lunx proxy] Invalid target URL: ${targetBase}`)
    return
  }

  const isHttps = parsedTarget.protocol === 'https:'
  const transport = isHttps ? https : http

  const options: http.RequestOptions = {
    hostname: parsedTarget.hostname,
    port:     parsedTarget.port || (isHttps ? 443 : 80),
    path:     targetPath,
    method:   req.method,
    headers: {
      ...req.headers,
      host: changeOrigin ? parsedTarget.host : req.headers.host,
    },
  }

  const proxyReq = transport.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers as any)
    proxyRes.pipe(res)
  })

  proxyReq.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        error:   '[lunx proxy] Connection failed',
        target:  targetBase,
        message: err.message,
      }))
    }
  })

  req.pipe(proxyReq)
}

// ─── CORS middleware (opt-in) ─────────────────────────────────────────────────

export function applyCORS(app: any, config: BuildConfig): void {
  const hasExposes =
    config.federation?.exposes && Object.keys(config.federation.exposes).length > 0

  if (hasExposes || config.server?.cors) {
    if (typeof app.use === 'function') {
      app.use((req: any, res: any, next: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }
        next()
      })
    }
    console.log('  [lunx] CORS enabled (federation remote mode)')
  }
}

// ─── Request logger (dev only) ────────────────────────────────────────────────

export function applyRequestLogger(app: any): void {
  if (typeof app.use !== 'function') return
  app.use((req: any, _res: any, next: any) => {
    const skip = ['/__lunx_hmr', '/favicon.ico', '/@lunx']
    if (!skip.some(s => req.url?.startsWith(s))) {
      const method = (req.method ?? 'GET').padEnd(4)
      console.log(`  \x1b[2m${method} ${req.url}\x1b[0m`)
    }
    next()
  })
}
