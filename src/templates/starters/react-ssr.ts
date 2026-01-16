/**
 * React SSR Starter Template
 * Production-ready React SSR setup with Express
 */

import { TemplateConfig } from '../manager.js';

export const reactSsrTemplate: TemplateConfig = {
    id: 'react-ssr',
    name: 'React SSR (Node.js)',
    description: 'Server Side Rendering with React, Express and TypeScript',
    framework: 'react',
    type: 'ssr',
    dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "express": "^4.18.2",
        "compression": "^1.7.4",
        "sirv": "^2.0.3"
    },
    devDependencies: {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@types/express": "^4.17.17",
        "@types/compression": "^1.7.3",
        "@nexxo/plugin-react": "^1.0.0",
        "cross-env": "^7.0.3"
    },
    files: {
        'nexxo.config.ts': `
import { defineConfig } from 'nexxo';
import react from '@nexxo/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        minify: false // For ease of debugging SSR locally
    }
});
`,
        'server.js': `
import fs from 'node:fs/promises'
import express from 'express'

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''

// Create http server
const app = express()

// Add Nexxo or sirv
let nexxo
if (!isProduction) {
  const { createServer } = await import('nexxo')
  nexxo = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base
  })
  app.use(nexxo.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}

// Serve HTML
app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')

    let template
    let render
    if (!isProduction) {
      // Always read fresh template in dev
      template = await fs.readFile('./index.html', 'utf-8')
      template = await nexxo.transformIndexHtml(url, template)
      render = (await nexxo.ssrLoadModule('/src/entry-server.tsx')).render
    } else {
      template = templateHtml
      render = (await import('./dist/server/entry-server.js')).render
    }

    const appHtml = await render(url)

    const html = template.replace('<!--app-html-->', appHtml)

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    !isProduction && nexxo.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

// Start http server
app.listen(port, () => {
  console.log(\`Server started at http://localhost:\${port}\`)
})
`,
        'src/entry-client.tsx': `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`,
        'src/entry-server.tsx': `
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import App from './App'

export function render() {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  return html
}
`,
        'src/App.tsx': `
import React, { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Nexxo SSR + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Nexxo logo to learn more
      </p>
    </>
  )
}

export default App
`,
        'src/index.css': `
/* Similar to SPA */
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
}
body { margin: 0; display: flex; place-items: center; min-width: 320px; min-height: 100vh; }
h1 { font-size: 3.2em; line-height: 1.1; }
button { padding: 0.6em 1.2em; font-size: 1em; cursor: pointer; }
`,
        'index.html': `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{PROJECT_NAME}}</title>
    <!--app-head-->
  </head>
  <body>
    <div id="root"><!--app-html--></div>
    <script type="module" src="/src/entry-client.tsx"></script>
  </body>
</html>
`
    }
};
