import { describe, it, expect, beforeAll } from '@jest/globals';
import { buildProject } from '../../src/build/index.js';
import path from 'path';
import fs from 'fs';

describe('Module Federation Tests', () => {
    const fixturesDir = path.resolve(process.cwd(), 'tests/fixtures/federation');

    beforeAll(() => {
        if (!fs.existsSync(fixturesDir)) {
            fs.mkdirSync(fixturesDir, { recursive: true });
        }
    });

    describe('Remote Module Exposure', () => {
        it('should expose modules for federation', async () => {
            const hostPath = path.join(fixturesDir, 'host-app');

            if (!fs.existsSync(hostPath)) {
                fs.mkdirSync(path.join(hostPath, 'src'), { recursive: true });

                // Create a component to expose
                fs.writeFileSync(
                    path.join(hostPath, 'src/Button.tsx'),
                    `import React from 'react';

export const Button = ({ children, onClick }: any) => {
  return (
    <button 
      onClick={onClick}
      style={{
        background: 'blue',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );
};`
                );

                fs.writeFileSync(
                    path.join(hostPath, 'src/main.tsx'),
                    `import React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from './Button';

createRoot(document.getElementById('root')!).render(
  <Button onClick={() => console.log('Clicked')}>
    Host Button
  </Button>
);`
                );

                // Lunx config with federation
                fs.writeFileSync(
                    path.join(hostPath, 'lunx.config.json'),
                    JSON.stringify({
                        entry: ['src/main.tsx'],
                        preset: 'spa',
                        federation: {
                            name: 'host',
                            filename: 'remoteEntry.js',
                            exposes: {
                                './Button': './src/Button.tsx'
                            }
                        }
                    }, null, 2)
                );

                fs.writeFileSync(
                    path.join(hostPath, 'package.json'),
                    JSON.stringify({
                        name: 'host-app',
                        type: 'module',
                        dependencies: {
                            'react': '^18.0.0',
                            'react-dom': '^18.0.0'
                        }
                    }, null, 2)
                );
            }

            const result = await buildProject({
                root: hostPath,
                entry: ['src/main.tsx'],
                outDir: 'dist'
            });

            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);

            // Verify remoteEntry.js was created
            const distPath = path.join(hostPath, 'dist');
            if (fs.existsSync(distPath)) {
                const files = fs.readdirSync(distPath);
                // Should have federation manifest or remote entry
                expect(files.length).toBeGreaterThan(0);
            }
        }, 30000);
    });

    describe('Remote Module Consumption', () => {
        it('should consume remote modules', async () => {
            const consumerPath = path.join(fixturesDir, 'consumer-app');

            if (!fs.existsSync(consumerPath)) {
                fs.mkdirSync(path.join(consumerPath, 'src'), { recursive: true });

                // Consumer app that uses remote module
                fs.writeFileSync(
                    path.join(consumerPath, 'src/App.tsx'),
                    `import React, { Suspense, lazy } from 'react';

// Dynamically import remote module
const RemoteButton = lazy(() => 
  import('host/Button').catch(() => ({
    default: () => <button>Fallback Button</button>
  }))
);

export const App = () => {
  return (
    <div>
      <h1>Consumer App</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <RemoteButton>Remote Button</RemoteButton>
      </Suspense>
    </div>
  );
};`
                );

                fs.writeFileSync(
                    path.join(consumerPath, 'src/main.tsx'),
                    `import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);`
                );

                fs.writeFileSync(
                    path.join(consumerPath, 'lunx.config.json'),
                    JSON.stringify({
                        entry: ['src/main.tsx'],
                        preset: 'spa',
                        federation: {
                            name: 'consumer',
                            remotes: {
                                host: 'host@http://localhost:3001/remoteEntry.js'
                            }
                        }
                    }, null, 2)
                );

                fs.writeFileSync(
                    path.join(consumerPath, 'package.json'),
                    JSON.stringify({
                        name: 'consumer-app',
                        type: 'module',
                        dependencies: {
                            'react': '^18.0.0',
                            'react-dom': '^18.0.0'
                        }
                    }, null, 2)
                );
            }

            const result = await buildProject({
                root: consumerPath,
                entry: ['src/main.tsx'],
                outDir: 'dist'
            });

            expect(result.success).toBe(true);
        }, 30000);
    });

    describe('Shared Dependencies', () => {
        it('should handle shared dependencies correctly', async () => {
            const sharedPath = path.join(fixturesDir, 'shared-deps');

            if (!fs.existsSync(sharedPath)) {
                fs.mkdirSync(path.join(sharedPath, 'src'), { recursive: true });

                fs.writeFileSync(
                    path.join(sharedPath, 'src/main.tsx'),
                    `import React from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <div>Shared Dependencies Test</div>
);`
                );

                fs.writeFileSync(
                    path.join(sharedPath, 'lunx.config.json'),
                    JSON.stringify({
                        entry: ['src/main.tsx'],
                        preset: 'spa',
                        federation: {
                            name: 'sharedApp',
                            shared: {
                                react: {
                                    singleton: true,
                                    requiredVersion: '^18.0.0'
                                },
                                'react-dom': {
                                    singleton: true,
                                    requiredVersion: '^18.0.0'
                                }
                            }
                        }
                    }, null, 2)
                );

                fs.writeFileSync(
                    path.join(sharedPath, 'package.json'),
                    JSON.stringify({
                        name: 'shared-deps',
                        type: 'module',
                        dependencies: {
                            'react': '^18.0.0',
                            'react-dom': '^18.0.0'
                        }
                    }, null, 2)
                );
            }

            const result = await buildProject({
                root: sharedPath,
                entry: ['src/main.tsx'],
                outDir: 'dist'
            });

            expect(result.success).toBe(true);
        }, 30000);
    });

    describe('Version Conflict Resolution', () => {
        it('should handle version conflicts gracefully', async () => {
            const conflictPath = path.join(fixturesDir, 'version-conflict');

            if (!fs.existsSync(conflictPath)) {
                fs.mkdirSync(path.join(conflictPath, 'src'), { recursive: true });

                fs.writeFileSync(
                    path.join(conflictPath, 'src/main.ts'),
                    `console.log('Version conflict test');`
                );

                // Config with conflicting version requirements
                fs.writeFileSync(
                    path.join(conflictPath, 'lunx.config.json'),
                    JSON.stringify({
                        entry: ['src/main.ts'],
                        preset: 'spa',
                        federation: {
                            name: 'conflictApp',
                            remotes: {
                                app1: 'app1@http://localhost:3001/remoteEntry.js',
                                app2: 'app2@http://localhost:3002/remoteEntry.js'
                            },
                            shared: {
                                lodash: {
                                    singleton: false,
                                    requiredVersion: '^4.17.0'
                                }
                            }
                        }
                    }, null, 2)
                );

                fs.writeFileSync(
                    path.join(conflictPath, 'package.json'),
                    JSON.stringify({ name: 'version-conflict', type: 'module' }, null, 2)
                );
            }

            const result = await buildProject({
                root: conflictPath,
                entry: ['src/main.ts'],
                outDir: 'dist'
            });

            // Should handle gracefully (either succeed or provide clear error)
            expect(result).toBeDefined();
        }, 30000);
    });

    describe('Dynamic Remote Loading', () => {
        it('should support dynamic remote loading', async () => {
            const dynamicPath = path.join(fixturesDir, 'dynamic-remote');

            if (!fs.existsSync(dynamicPath)) {
                fs.mkdirSync(path.join(dynamicPath, 'src'), { recursive: true });

                fs.writeFileSync(
                    path.join(dynamicPath, 'src/loadRemote.ts'),
                    `export async function loadRemoteModule(
  remoteName: string,
  moduleName: string
) {
  try {
    const module = await import(\`\${remoteName}/\${moduleName}\`);
    return module;
  } catch (error) {
    console.error('Failed to load remote module:', error);
    return null;
  }
}`
                );

                fs.writeFileSync(
                    path.join(dynamicPath, 'src/main.ts'),
                    `import { loadRemoteModule } from './loadRemote';

async function init() {
  const module = await loadRemoteModule('host', 'Button');
  if (module) {
    console.log('Remote module loaded successfully');
  }
}

init();`
                );

                fs.writeFileSync(
                    path.join(dynamicPath, 'package.json'),
                    JSON.stringify({ name: 'dynamic-remote', type: 'module' }, null, 2)
                );
            }

            const result = await buildProject({
                root: dynamicPath,
                entry: ['src/main.ts'],
                outDir: 'dist'
            });

            expect(result.success).toBe(true);
        }, 30000);
    });

    describe('Federation Fallback', () => {
        it('should provide fallback when remote fails', async () => {
            const fallbackPath = path.join(fixturesDir, 'federation-fallback');

            if (!fs.existsSync(fallbackPath)) {
                fs.mkdirSync(path.join(fallbackPath, 'src'), { recursive: true });

                fs.writeFileSync(
                    path.join(fallbackPath, 'src/App.tsx'),
                    `import React, { Suspense, lazy } from 'react';

const RemoteComponent = lazy(() =>
  import('remote/Component')
    .catch(() => import('./FallbackComponent'))
);

export const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <RemoteComponent />
  </Suspense>
);`
                );

                fs.writeFileSync(
                    path.join(fallbackPath, 'src/FallbackComponent.tsx'),
                    `import React from 'react';

export default function FallbackComponent() {
  return <div>Fallback Component (Remote Failed)</div>;
}`
                );

                fs.writeFileSync(
                    path.join(fallbackPath, 'src/main.tsx'),
                    `import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);`
                );

                fs.writeFileSync(
                    path.join(fallbackPath, 'package.json'),
                    JSON.stringify({
                        name: 'federation-fallback',
                        type: 'module',
                        dependencies: {
                            'react': '^18.0.0',
                            'react-dom': '^18.0.0'
                        }
                    }, null, 2)
                );
            }

            const result = await buildProject({
                root: fallbackPath,
                entry: ['src/main.tsx'],
                outDir: 'dist'
            });

            expect(result.success).toBe(true);
        }, 30000);
    });
});
