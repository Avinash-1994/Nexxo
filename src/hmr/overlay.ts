/**
 * HMR Overlay
 * 
 * Visual overlay that explains HMR decisions to developers.
 * Shows why a reload happened, what changed in the graph, and optimization suggestions.
 */

import { HMRDecision, HMRLevel } from './classifier.js';

export interface OverlayOptions {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    autoHide?: boolean;
    autoHideDelay?: number;
    showOptimizations?: boolean;
}

export class HMROverlay {
    private overlay: HTMLElement | null = null;
    private options: Required<OverlayOptions>;

    constructor(options: OverlayOptions = {}) {
        this.options = {
            position: options.position || 'bottom-right',
            autoHide: options.autoHide ?? true,
            autoHideDelay: options.autoHideDelay || 3000,
            showOptimizations: options.showOptimizations ?? true
        };
    }

    /**
     * Show HMR decision overlay
     */
    show(decision: HMRDecision): void {
        this.hide(); // Remove existing overlay

        this.overlay = this.createOverlay(decision);
        document.body.appendChild(this.overlay);

        // Auto-hide for safe updates
        if (this.options.autoHide && decision.level === HMRLevel.HMR_SAFE) {
            setTimeout(() => this.hide(), this.options.autoHideDelay);
        }
    }

    /**
     * Hide overlay
     */
    hide(): void {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }

    private createOverlay(decision: HMRDecision): HTMLElement {
        const container = document.createElement('div');
        container.className = 'urja-hmr-overlay';
        container.style.cssText = this.getContainerStyles();

        // Header
        const header = this.createHeader(decision);
        container.appendChild(header);

        // Content
        const content = this.createContent(decision);
        container.appendChild(content);

        // Close button
        const closeBtn = this.createCloseButton();
        container.appendChild(closeBtn);

        return container;
    }

    private createHeader(decision: HMRDecision): HTMLElement {
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            background: ${this.getHeaderColor(decision.level)};
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-weight: 600;
            font-size: 14px;
        `;

        const icon = this.getIcon(decision.level);
        const title = this.getTitle(decision.level);

        header.innerHTML = `
            <span style="font-size: 18px;">${icon}</span>
            <span>${title}</span>
        `;

        return header;
    }

    private createContent(decision: HMRDecision): HTMLElement {
        const content = document.createElement('div');
        content.style.cssText = `
            padding: 16px;
            font-size: 13px;
            line-height: 1.6;
        `;

        // Reason
        const reason = document.createElement('div');
        reason.style.cssText = 'margin-bottom: 12px; color: #e0e0e0;';
        reason.textContent = decision.reason;
        content.appendChild(reason);

        // Affected modules
        if (decision.affectedModules.length > 0 && decision.affectedModules[0] !== '*') {
            const modules = this.createModulesList(decision.affectedModules);
            content.appendChild(modules);
        }

        // Graph changes
        if (decision.graphChanges.length > 0) {
            const changes = this.createGraphChanges(decision.graphChanges);
            content.appendChild(changes);
        }

        // Optimizations
        if (this.options.showOptimizations && decision.suggestedOptimizations && decision.suggestedOptimizations.length > 0) {
            const optimizations = this.createOptimizations(decision.suggestedOptimizations);
            content.appendChild(optimizations);
        }

        return content;
    }

    private createModulesList(modules: string[]): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = 'margin-bottom: 12px;';

        const title = document.createElement('div');
        title.style.cssText = 'font-weight: 600; margin-bottom: 6px; color: #fff;';
        title.textContent = `Affected Modules (${modules.length}):`;
        container.appendChild(title);

        const list = document.createElement('div');
        list.style.cssText = `
            max-height: 120px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
            padding: 8px;
        `;

        modules.slice(0, 10).forEach(mod => {
            const item = document.createElement('div');
            item.style.cssText = 'padding: 2px 0; font-family: monospace; font-size: 12px; color: #a0a0a0;';
            item.textContent = `• ${this.shortenPath(mod)}`;
            list.appendChild(item);
        });

        if (modules.length > 10) {
            const more = document.createElement('div');
            more.style.cssText = 'padding: 4px 0; color: #888; font-style: italic;';
            more.textContent = `... and ${modules.length - 10} more`;
            list.appendChild(more);
        }

        container.appendChild(list);
        return container;
    }

    private createGraphChanges(changes: any[]): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = 'margin-bottom: 12px;';

        const title = document.createElement('div');
        title.style.cssText = 'font-weight: 600; margin-bottom: 6px; color: #fff;';
        title.textContent = 'Graph Changes:';
        container.appendChild(title);

        const list = document.createElement('div');
        list.style.cssText = 'font-family: monospace; font-size: 12px;';

        changes.forEach((change: any) => {
            const item = document.createElement('div');
            item.style.cssText = 'padding: 2px 0;';

            const typeColors: Record<string, string> = {
                'added': '#4caf50',
                'removed': '#f44336',
                'modified': '#ff9800'
            };
            const typeColor = typeColors[change.type] || '#888';

            item.innerHTML = `
                <span style="color: ${typeColor}; font-weight: 600;">${change.type.toUpperCase()}</span>
                <span style="color: #a0a0a0;"> ${this.shortenPath(change.module)}</span>
            `;
            list.appendChild(item);
        });

        container.appendChild(list);
        return container;
    }

    private createOptimizations(optimizations: string[]): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = `
            margin-top: 12px;
            padding: 12px;
            background: rgba(255, 193, 7, 0.1);
            border-left: 3px solid #ffc107;
            border-radius: 4px;
        `;

        const title = document.createElement('div');
        title.style.cssText = 'font-weight: 600; margin-bottom: 6px; color: #ffc107;';
        title.textContent = '💡 Optimization Suggestions:';
        container.appendChild(title);

        optimizations.forEach(opt => {
            const item = document.createElement('div');
            item.style.cssText = 'padding: 4px 0; color: #e0e0e0; font-size: 12px;';
            item.textContent = `• ${opt}`;
            container.appendChild(item);
        });

        return container;
    }

    private createCloseButton(): HTMLElement {
        const btn = document.createElement('button');
        btn.textContent = '×';
        btn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            opacity: 0.6;
            transition: opacity 0.2s;
        `;

        btn.onmouseover = () => btn.style.opacity = '1';
        btn.onmouseout = () => btn.style.opacity = '0.6';
        btn.onclick = () => this.hide();

        return btn;
    }

    private getContainerStyles(): string {
        const positions = {
            'top-right': 'top: 20px; right: 20px;',
            'top-left': 'top: 20px; left: 20px;',
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;'
        };

        return `
            position: fixed;
            ${positions[this.options.position]}
            width: 400px;
            max-width: calc(100vw - 40px);
            background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            z-index: 999999;
            animation: slideIn 0.3s ease-out;
        `;
    }

    private getHeaderColor(level: HMRLevel): string {
        switch (level) {
            case HMRLevel.HMR_SAFE:
                return 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
            case HMRLevel.HMR_PARTIAL:
                return 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
            case HMRLevel.HMR_FULL_RELOAD:
                return 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
        }
    }

    private getIcon(level: HMRLevel): string {
        switch (level) {
            case HMRLevel.HMR_SAFE:
                return '✓';
            case HMRLevel.HMR_PARTIAL:
                return '⟳';
            case HMRLevel.HMR_FULL_RELOAD:
                return '⟲';
        }
    }

    private getTitle(level: HMRLevel): string {
        switch (level) {
            case HMRLevel.HMR_SAFE:
                return 'Safe Hot Update';
            case HMRLevel.HMR_PARTIAL:
                return 'Partial Hot Update';
            case HMRLevel.HMR_FULL_RELOAD:
                return 'Full Page Reload';
        }
    }

    private shortenPath(path: string): string {
        if (path.length <= 50) return path;
        const parts = path.split('/');
        if (parts.length <= 2) return path;
        return `.../${parts.slice(-2).join('/')}`;
    }
}

// Inject CSS animation
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Export singleton instance
export const hmrOverlay = new HMROverlay();
