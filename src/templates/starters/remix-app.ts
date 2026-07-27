// Remix-style template
export const remixTemplate = {
    name: 'remix-app',
    description: 'Remix-style application with file-based routing',
    files: {
        'src/root.tsx': `import { Links, LiveReload, Meta, Outlet, Scripts } from '@remix-run/react';

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}`,
        'src/routes/index.tsx': `import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: 'Lunx Remix App' },
    { name: 'description', content: 'Welcome to Remix with Lunx!' },
  ];
};

export default function Index() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold">Welcome to Remix + Lunx</h1>
      <p className="mt-4">
        This is a Remix-style application built with Lunx.
      </p>
    </div>
  );
}`,
        'src/routes/about.tsx': `export default function About() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold">About</h1>
      <p className="mt-4">This is the about page.</p>
    </div>
  );
}`,
        'lunx.config.js': `module.exports = {
  entry: ['./src/root.tsx'],
  outDir: './dist',
  framework: 'react',
  
  build: {
    minify: true,
    sourcemap: 'external',
  },
  
  dev: {
    port: 3000,
    hmr: true,
  },
  
  ssr: {
    enabled: true,
    entry: './src/root.tsx',
    prerender: ['/', '/about'],
  },
};`,
        'package.json': `{
  "name": "lunx-remix-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "lunx dev",
    "build": "lunx build",
    "start": "lunx ssr"
  },
  "dependencies": {
    "@remix-run/react": "^2.0.0",
    "@remix-run/node": "^2.0.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.8",
    "@types/react-dom": "^19.2.3",
    "typescript": "^5.4.2"
  }
}`,
        'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}`,
    },
};
