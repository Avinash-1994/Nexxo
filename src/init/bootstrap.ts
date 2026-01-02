
import fs from 'fs/promises';
import path from 'path';
import { log } from '../utils/logger.js';

export async function bootstrapProject(cwd: string, template: string = 'react') {
  log.info(`Bootstrapping new ${template} project in ${cwd}`);

  // 1. Create directory structure
  await fs.mkdir(path.join(cwd, 'src'), { recursive: true });
  await fs.mkdir(path.join(cwd, 'public'), { recursive: true });

  // 2. Create package.json
  const pkg = {
    name: path.basename(cwd),
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      "dev": "urja dev",
      "build": "urja build",
      "preview": "urja dev --port 4173"
    },
    dependencies: template === 'react' ? {
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    } : {},
    devDependencies: {
      "urja": "latest",
      "typescript": "^5.0.0"
    }
  };
  await fs.writeFile(path.join(cwd, 'package.json'), JSON.stringify(pkg, null, 2));

  // 3. Create initial source files
  if (template === 'react') {
    await fs.writeFile(path.join(cwd, 'src/main.tsx'), `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
        `.trim());

    await fs.writeFile(path.join(cwd, 'src/App.tsx'), `
import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <h1>Urja + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  );
}

export default App;
        `.trim());

    await fs.writeFile(path.join(cwd, 'src/index.css'), `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #242424;
  color: white;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}
        `.trim());
  }

  // 4. Create index.html
  await fs.writeFile(path.join(cwd, 'index.html'), `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Urja App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
    `.trim());

  // 5. Create urja.config.json
  const config = {
    entry: ["src/main.tsx"],
    mode: "development",
    preset: "spa",
    platform: "browser"
  };
  await fs.writeFile(path.join(cwd, 'urja.config.json'), JSON.stringify(config, null, 2));

  log.success(`Successfully bootstrapped ${template} project!`);
  log.info(`To get started:\n  cd ${path.basename(cwd)}\n  npm install\n  npm run dev`);
}
