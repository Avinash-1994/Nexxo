/**
 * Framework Presets
 * Production-ready configurations for all supported frameworks
 */

import type { Framework } from './framework-detector.js';

export interface FrameworkPreset {
    name: Framework;
    compiler?: string; // Package name of compiler
    extensions: string[]; // File extensions to handle
    jsx?: {
        runtime?: 'automatic' | 'classic';
        importSource?: string;
        pragma?: string;
        pragmaFrag?: string;
    };
    hmr?: {
        enabled: boolean;
        runtime?: string; // HMR runtime package
    };
    transform?: {
        babel?: any; // Babel config
        esbuild?: any; // esbuild config
        custom?: string; // Custom transformer
    };
    build?: {
        splitting?: boolean;
        minify?: boolean;
        sourcemap?: boolean;
    };
}

export const frameworkPresets: Record<Framework, FrameworkPreset> = {
    react: {
        name: 'react',
        extensions: ['.jsx', '.tsx', '.js', '.ts'],
        jsx: {
            runtime: 'automatic',
            importSource: 'react'
        },
        hmr: {
            enabled: true,
            runtime: 'react-refresh'
        },
        transform: {
            babel: {
                presets: [
                    ['@babel/preset-react', { runtime: 'automatic', development: true }],
                    '@babel/preset-typescript'
                ]
            }
        },
        build: {
            splitting: true,
            minify: true,
            sourcemap: true
        }
    },

    vue: {
        name: 'vue',
        compiler: '@vue/compiler-sfc',
        extensions: ['.vue', '.js', '.ts'],
        hmr: {
            enabled: true
        },
        transform: {
            custom: 'vue-sfc'
        },
        build: {
            splitting: true,
            minify: true,
            sourcemap: true
        }
    },

    svelte: {
        name: 'svelte',
        compiler: 'svelte/compiler',
        extensions: ['.svelte', '.js', '.ts'],
        hmr: {
            enabled: true
        },
        transform: {
            custom: 'svelte'
        },
        build: {
            splitting: true,
            minify: true,
            sourcemap: true
        }
    },

    angular: {
        name: 'angular',
        compiler: '@angular/compiler-cli',
        extensions: ['.ts', '.html', '.css', '.scss'],
        hmr: {
            enabled: true
        },
        transform: {
            custom: 'angular'
        },
        build: {
            splitting: true,
            minify: true,
            sourcemap: true
        }
    },

    solid: {
        name: 'solid',
        compiler: 'babel-preset-solid',
        extensions: ['.jsx', '.tsx', '.js', '.ts'],
        jsx: {
            runtime: 'automatic',
            importSource: 'solid-js'
        },
        hmr: {
            enabled: true
        },
        transform: {
            babel: {
                presets: ['solid', '@babel/preset-typescript']
            }
        },
        build: {
            splitting: true,
            minify: true,
            sourcemap: true
        }
    },

    preact: {
        name: 'preact',
        extensions: ['.jsx', '.tsx', '.js', '.ts'],
        jsx: {
            runtime: 'automatic',
            importSource: 'preact'
        },
        hmr: {
            enabled: true,
            runtime: '@prefresh/core'
        },
        transform: {
            babel: {
                presets: [
                    ['@babel/preset-react', { runtime: 'automatic', importSource: 'preact' }],
                    '@babel/preset-typescript'
                ]
            }
        },
        build: {
            splitting: true,
            minify: true,
            sourcemap: true
        }
    },

    qwik: {
        name: 'qwik',
        compiler: '@builder.io/qwik/optimizer',
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
        jsx: {
            runtime: 'automatic',
            importSource: '@builder.io/qwik'
        },
        hmr: {
            enabled: true
        },
        transform: {
            custom: 'qwik'
        },
        build: {
            splitting: true,
            minify: true,
            sourcemap: true
        }
    },

    lit: {
        name: 'lit',
        extensions: ['.ts', '.js'],
        hmr: {
            enabled: true
        },
        transform: {
            esbuild: {
                target: 'es2020',
                tsconfigRaw: {
                    compilerOptions: {
                        experimentalDecorators: true,
                        useDefineForClassFields: false
                    }
                }
            }
        },
        build: {
            splitting: true,
            minify: true,
            sourcemap: true
        }
    },

    astro: {
        name: 'astro',
        compiler: 'astro',
        extensions: ['.astro', '.md', '.mdx'],
        hmr: {
            enabled: true
        },
        transform: {
            custom: 'astro'
        },
        build: {
            splitting: true,
            minify: true,
            sourcemap: true
        }
    },

    next: {
        name: 'next',
        compiler: 'next',
        extensions: ['.jsx', '.tsx', '.js', '.ts'],
        jsx: {
            runtime: 'automatic',
            importSource: 'react'
        },
        hmr: {
            enabled: true,
            runtime: 'react-refresh'
        },
        transform: {
            custom: 'next'
        },
        build: {
            splitting: true,
            minify: true,
            sourcemap: true
        }
    },

    nuxt: {
        name: 'nuxt',
        compiler: 'nuxt',
        extensions: ['.vue', '.js', '.ts'],
        hmr: {
            enabled: true
        },
        transform: {
            custom: 'nuxt'
        },
        build: {
            splitting: true,
            minify: true,
            sourcemap: true
        }
    },

    remix: {
        name: 'remix',
        compiler: '@remix-run/dev',
        extensions: ['.jsx', '.tsx', '.js', '.ts'],
        jsx: {
            runtime: 'automatic',
            importSource: 'react'
        },
        hmr: {
            enabled: true,
            runtime: 'react-refresh'
        },
        transform: {
            custom: 'remix'
        },
        build: {
            splitting: true,
            minify: true,
            sourcemap: true
        }
    },

    vanilla: {
        name: 'vanilla',
        extensions: ['.js', '.ts', '.mjs'],
        hmr: {
            enabled: true
        },
        transform: {
            esbuild: {
                target: 'es2020'
            }
        },
        build: {
            splitting: true,
            minify: true,
            sourcemap: true
        }
    }
};

export function getFrameworkPreset(framework: Framework): FrameworkPreset {
    return frameworkPresets[framework] || frameworkPresets.vanilla;
}

export function getFrameworkExtensions(framework: Framework): string[] {
    return getFrameworkPreset(framework).extensions;
}

export function isFrameworkFile(filePath: string, framework: Framework): boolean {
    const extensions = getFrameworkExtensions(framework);
    return extensions.some(ext => filePath.endsWith(ext));
}
