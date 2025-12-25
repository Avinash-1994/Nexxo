/**
 * React SSR Renderer
 * Server-side rendering for React/Next.js/Remix
 */

import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { RenderContext } from './server.js';

export interface ReactSSROptions {
    /** Enable streaming */
    streaming?: boolean;

    /** Custom wrapper component */
    wrapper?: React.ComponentType<any>;
}

export class ReactSSRRenderer {
    private options: ReactSSROptions;

    constructor(options: ReactSSROptions = {}) {
        this.options = options;
    }

    /**
     * Render React component to HTML string
     */
    async render(Component: any, context: RenderContext): Promise<string> {
        try {
            console.log('DEBUG: ReactSSRRenderer.render', {
                ReactType: typeof React,
                ReactIsUndef: React === undefined,
                ComponentType: typeof Component,
                ComponentDefault: typeof Component?.default
            });
            // Create element with props
            const element = React.createElement(Component.default || Component, {
                ...context.data,
                params: context.params,
                searchParams: context.query,
            });

            // Wrap in custom wrapper if provided
            const wrappedElement = this.options.wrapper
                ? React.createElement(this.options.wrapper, {}, element)
                : element;

            // Render to string
            const html = renderToString(wrappedElement);

            return html;
        } catch (error: any) {
            console.error('React SSR Error Detailed:', {
                message: error.message,
                stack: error.stack,
                component: Component?.displayName || Component?.name
            });
            throw new Error(`Failed to render React component: ${error.message}\nStack: ${error.stack}`);
        }
    }

    /**
     * Render with streaming (React 18+)
     */
    async renderToStream(Component: any, context: RenderContext): Promise<ReadableStream> {
        // This would use renderToPipeableStream for Node.js
        // or renderToReadableStream for edge runtimes
        throw new Error('Streaming SSR not yet implemented');
    }
}
