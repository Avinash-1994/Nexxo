import { spawn, ChildProcess } from 'child_process'
import http from 'http'

const NEXT_INTERNAL_PORT = 3001

export class NextAppRouterProxy {
  private nextProcess: ChildProcess | null = null
  private root: string
  private lunxPort: number

  constructor(root: string, lunxPort: number) {
    this.root = root
    this.lunxPort = lunxPort
  }

  async start(): Promise<void> {
    console.log(
      '[lunx] App Router detected — starting ' +
      'Next.js proxy on internal port ' +
      NEXT_INTERNAL_PORT
    )
    await this.spawnNext()
    await this.waitForNext()
    console.log(
      `[lunx] Next.js App Router ready\n` +
      `  ➜  http://localhost:${this.lunxPort}\n` +
      `       (proxied from :${NEXT_INTERNAL_PORT})`
    )
  }

  async stop(): Promise<void> {
    if (this.nextProcess) {
      this.nextProcess.kill('SIGTERM')
      this.nextProcess = null
      console.log('[lunx] Next.js process stopped')
    }
  }

  private spawnNext(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(
          '[lunx] Next.js did not start within 30s.\n' +
          'Check for errors above labelled [next].'
        ))
      }, 30000)

      this.nextProcess = spawn(
        'node',
        [
          'node_modules/.bin/next',
          'dev',
          '--port',
          String(NEXT_INTERNAL_PORT)
        ],
        {
          cwd: this.root,
          env: {
            ...process.env,
            PORT: String(NEXT_INTERNAL_PORT),
            NODE_ENV: 'development'
          },
          stdio: ['inherit', 'pipe', 'pipe']
        }
      )

      this.nextProcess.stdout?.on('data', (data) => {
        const line = data.toString()
        process.stdout.write(`  [next] ${line}`)
        if (
          line.includes('Ready') ||
          line.includes('ready') ||
          line.includes('started server')
        ) {
          clearTimeout(timeout)
          resolve()
        }
      })

      this.nextProcess.stderr?.on('data', (data) => {
        process.stderr.write(`  [next:err] ${data}`)
      })

      this.nextProcess.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          reject(new Error(
            `[lunx] Next.js exited with code ${code}`
          ))
        }
      })
    })
  }

  private waitForNext(maxMs = 10000): Promise<void> {
    const start = Date.now()
    return new Promise((resolve, reject) => {
      const check = () => {
        if (Date.now() - start > maxMs) {
          resolve() // already resolved by stdout above
          return
        }
        http.get(
          `http://localhost:${NEXT_INTERNAL_PORT}/`,
          () => resolve()
        ).on('error', () => setTimeout(check, 200))
      }
      check()
    })
  }

  public handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = req.url || '/'
    const method = req.method
    const headers = req.headers

    const proxyReq = http.request(
      {
        hostname: 'localhost',
        port: NEXT_INTERNAL_PORT,
        path: url,
        method,
        headers
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers)
        proxyRes.pipe(res)
      }
    )

    proxyReq.on('error', (err: any) => {
      res.writeHead(502)
      res.end(`[lunx] Proxy error: ${err.message}`)
    })

    req.pipe(proxyReq)
  }
}
