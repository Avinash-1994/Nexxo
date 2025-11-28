import { Plugin } from './index.js';

/**
 * CSS-in-JS Plugin
 * Supports styled-components, emotion, and other CSS-in-JS libraries
 * Ensures proper module resolution and transformation
 */
export class CssInJsPlugin implements Plugin {
    name = 'css-in-js-plugin';

    setup(build: any) {
        // Ensure CSS-in-JS libraries are properly resolved
        // Most CSS-in-JS libraries work out of the box with esbuild,
        // but we can add special handling if needed

        // For styled-components, we might want to add the babel plugin
        // in development mode for better debugging (displayName)
        // This is a placeholder for future enhancements

        // Handle @emotion/react and similar packages
        build.onResolve({ filter: /^@emotion\/(react|styled|css)$/ }, (args: any) => {
            return {
                path: args.path,
                external: false // Ensure it's bundled
            };
        });

        // Handle styled-components
        build.onResolve({ filter: /^styled-components$/ }, (args: any) => {
            return {
                path: args.path,
                external: false
            };
        });

        // In the future, we could add:
        // - Server-side rendering support (extracting critical CSS)
        // - Development mode enhancements (better component names)
        // - Production optimizations (dead code elimination for unused styles)
    }
}
