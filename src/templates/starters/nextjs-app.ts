// Next.js-style template
export const nextjsTemplate = {
    name: 'nextjs-app',
    description: 'Next.js-style application with App Router',
    files: {
        'src/app/page.tsx': `export default function Home() {
  return (
    <main className="min-h-screen p-24">
      <h1 className="text-4xl font-bold">Welcome to Lunx + Next.js</h1>
      <p className="mt-4">Start building your app with App Router</p>
    </main>
  );
}`,
        'src/app/layout.tsx': `import './globals.css';

export const metadata = {
  title: 'Lunx Next.js App',
  description: 'Built with Lunx',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
        'src/app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}`,
        'lunx.config.js': `module.exports = {
  entry: ['./src/app/page.tsx'],
  outDir: './dist',
  framework: 'react',
  
  build: {
    minify: true,
    sourcemap: 'external',
    cssModules: false,
  },
  
  dev: {
    port: 3000,
    hmr: true,
  },
  
  ssr: {
    enabled: true,
    entry: './src/app/layout.tsx',
  },
};`,
        'package.json': `{
  "name": "lunx-nextjs-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "lunx dev",
    "build": "lunx build",
    "start": "lunx ssr"
  },
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.8",
    "@types/react-dom": "^19.2.3",
    "typescript": "^5.4.2",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}`,
        'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}`,
        'tailwind.config.js': `module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};`,
    },
};
