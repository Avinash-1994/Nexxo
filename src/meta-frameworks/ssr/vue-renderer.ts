/**
 * Vue SSR Renderer
 * Server-side rendering for Vue 3 / Nuxt
 */

import { renderToString } from '@vue/server-renderer';
import { createSSRApp, h } from 'vue';
import { RenderContext } from './server.js';

export class VueSSRRenderer {
    /**
     * Render Vue component to HTML string
     */
    async render(Component: any, context: RenderContext): Promise<string> {
        try {
            // Create the app instance
            // Component.default is used if it's an ES module
            const app = createSSRApp({
                render: () => h(Component.default || Component, {
                    ...context.data,
                    params: context.params,
                    query: context.query
                })
            });

            // Set up error handling
            app.config.errorHandler = (err) => {
                console.error('Vue SSR App Error:', err);
            };

            // Render to string
            const html = await renderToString(app);

            return html;
        } catch (error: any) {
            console.error('Vue SSR Render Error:', error);
            throw new Error(`Failed to render Vue component: ${error.message}`);
        }
    }
}
