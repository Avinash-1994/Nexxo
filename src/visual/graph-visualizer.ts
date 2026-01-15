/* global HTMLCanvasElement, CanvasRenderingContext2D, MouseEvent */
/**
 * WebGPU Graph Visualizer
 * Interactive dependency graph visualization with drill-down
 */

import type { RootCauseNode, RootCauseIssue, GraphSlice } from './root-cause.js';

export interface VisualizationConfig {
    width: number;
    height: number;
    nodeRadius: number;
    maxNodes: number;
}

export interface GraphLayout {
    nodes: Array<{ id: string; x: number; y: number; radius: number }>;
    edges: Array<{ from: string; to: string; points: Array<{ x: number; y: number }> }>;
}

export class GraphVisualizer {
    private config: VisualizationConfig;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private selectedNode: string | null = null;
    private hoveredNode: string | null = null;

    constructor(config: Partial<VisualizationConfig> = {}) {
        this.config = {
            width: 1200,
            height: 800,
            nodeRadius: 20,
            maxNodes: 10000,
            ...config
        };
    }

    /**
     * Initialize canvas for rendering
     */
    initialize(canvasId: string): void {
        if (typeof document === 'undefined') {
            // Server-side or test environment
            return;
        }

        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error(`Canvas element with id "${canvasId}" not found`);
        }

        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
        this.ctx = this.canvas.getContext('2d');

        // Add event listeners for interactivity
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    /**
     * Calculate force-directed layout for nodes
     */
    calculateLayout(nodes: RootCauseNode[], edges: Array<{ from: string; to: string }>): GraphLayout {
        const layout: GraphLayout = {
            nodes: [],
            edges: []
        };

        // Initialize node positions randomly
        const nodePositions = new Map<string, { x: number; y: number }>();
        nodes.forEach(node => {
            nodePositions.set(node.id, {
                x: Math.random() * this.config.width,
                y: Math.random() * this.config.height
            });
        });

        // Force-directed layout simulation (simplified)
        const iterations = 50;
        const repulsionForce = 5000;
        const attractionForce = 0.01;
        const damping = 0.9;

        for (let iter = 0; iter < iterations; iter++) {
            const forces = new Map<string, { x: number; y: number }>();

            // Initialize forces
            nodes.forEach(node => {
                forces.set(node.id, { x: 0, y: 0 });
            });

            // Repulsion between all nodes
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const node1 = nodes[i];
                    const node2 = nodes[j];
                    const pos1 = nodePositions.get(node1.id)!;
                    const pos2 = nodePositions.get(node2.id)!;

                    const dx = pos2.x - pos1.x;
                    const dy = pos2.y - pos1.y;
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                    const force = repulsionForce / (distance * distance);
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;

                    const f1 = forces.get(node1.id)!;
                    const f2 = forces.get(node2.id)!;
                    f1.x -= fx;
                    f1.y -= fy;
                    f2.x += fx;
                    f2.y += fy;
                }
            }

            // Attraction along edges
            edges.forEach(edge => {
                const pos1 = nodePositions.get(edge.from);
                const pos2 = nodePositions.get(edge.to);
                if (!pos1 || !pos2) return;

                const dx = pos2.x - pos1.x;
                const dy = pos2.y - pos1.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                const force = distance * attractionForce;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                const f1 = forces.get(edge.from)!;
                const f2 = forces.get(edge.to)!;
                f1.x += fx;
                f1.y += fy;
                f2.x -= fx;
                f2.y -= fy;
            });

            // Apply forces with damping
            nodes.forEach(node => {
                const pos = nodePositions.get(node.id)!;
                const force = forces.get(node.id)!;
                pos.x += force.x * damping;
                pos.y += force.y * damping;

                // Keep within bounds
                pos.x = Math.max(this.config.nodeRadius, Math.min(this.config.width - this.config.nodeRadius, pos.x));
                pos.y = Math.max(this.config.nodeRadius, Math.min(this.config.height - this.config.nodeRadius, pos.y));
            });
        }

        // Build final layout
        nodes.forEach(node => {
            const pos = nodePositions.get(node.id)!;
            layout.nodes.push({
                id: node.id,
                x: pos.x,
                y: pos.y,
                radius: this.config.nodeRadius
            });
        });

        edges.forEach(edge => {
            const from = nodePositions.get(edge.from);
            const to = nodePositions.get(edge.to);
            if (from && to) {
                layout.edges.push({
                    from: edge.from,
                    to: edge.to,
                    points: [from, to]
                });
            }
        });

        return layout;
    }

    /**
     * Render the graph
     */
    render(nodes: RootCauseNode[], edges: Array<{ from: string; to: string }>, issues: RootCauseIssue[]): void {
        if (!this.ctx) return;

        const layout = this.calculateLayout(nodes, edges);

        // Clear canvas
        this.ctx.clearRect(0, 0, this.config.width, this.config.height);

        // Draw edges
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 1;
        layout.edges.forEach(edge => {
            this.ctx!.beginPath();
            this.ctx!.moveTo(edge.points[0].x, edge.points[0].y);
            this.ctx!.lineTo(edge.points[1].x, edge.points[1].y);
            this.ctx!.stroke();
        });

        // Draw nodes
        const issueNodeIds = new Set(issues.flatMap(i => i.affectedNodes));
        layout.nodes.forEach(node => {
            const hasIssue = issueNodeIds.has(node.id);
            const isSelected = node.id === this.selectedNode;
            const isHovered = node.id === this.hoveredNode;

            this.ctx!.beginPath();
            this.ctx!.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

            // Color based on state
            if (hasIssue) {
                this.ctx!.fillStyle = '#ff4444';
            } else if (isSelected) {
                this.ctx!.fillStyle = '#4444ff';
            } else if (isHovered) {
                this.ctx!.fillStyle = '#44ff44';
            } else {
                this.ctx!.fillStyle = '#888';
            }

            this.ctx!.fill();

            // Draw border
            this.ctx!.strokeStyle = isSelected || isHovered ? '#fff' : '#333';
            this.ctx!.lineWidth = isSelected || isHovered ? 3 : 1;
            this.ctx!.stroke();
        });

        // Draw labels for selected/hovered nodes
        if (this.selectedNode || this.hoveredNode) {
            const nodeId = this.selectedNode || this.hoveredNode;
            const layoutNode = layout.nodes.find(n => n.id === nodeId);
            const dataNode = nodes.find(n => n.id === nodeId);

            if (layoutNode && dataNode) {
                this.drawTooltip(layoutNode.x, layoutNode.y, dataNode, issues);
            }
        }
    }

    /**
     * Draw tooltip for a node
     */
    private drawTooltip(x: number, y: number, node: RootCauseNode, issues: RootCauseIssue[]): void {
        if (!this.ctx) return;

        const nodeIssues = issues.filter(i => i.affectedNodes.includes(node.id));
        const lines = [
            `Path: ${node.path}`,
            `Size: ${(node.size / 1024).toFixed(2)}KB`,
            `Imports: ${node.imports.length}`,
            `Imported by: ${node.importedBy.length}`
        ];

        if (nodeIssues.length > 0) {
            lines.push('', 'Issues:');
            nodeIssues.forEach(issue => {
                lines.push(`- ${issue.message}`);
                if (issue.fix) {
                    lines.push(`  Fix: ${issue.fix}`);
                }
            });
        }

        const padding = 10;
        const lineHeight = 16;
        const maxWidth = Math.max(...lines.map(l => this.ctx!.measureText(l).width));
        const boxWidth = maxWidth + padding * 2;
        const boxHeight = lines.length * lineHeight + padding * 2;

        // Position tooltip
        let tooltipX = x + 30;
        let tooltipY = y - boxHeight / 2;

        // Keep within bounds
        if (tooltipX + boxWidth > this.config.width) {
            tooltipX = x - boxWidth - 30;
        }
        if (tooltipY < 0) tooltipY = 0;
        if (tooltipY + boxHeight > this.config.height) {
            tooltipY = this.config.height - boxHeight;
        }

        // Draw background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(tooltipX, tooltipY, boxWidth, boxHeight);

        // Draw border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(tooltipX, tooltipY, boxWidth, boxHeight);

        // Draw text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px monospace';
        lines.forEach((line, i) => {
            this.ctx!.fillText(line, tooltipX + padding, tooltipY + padding + (i + 1) * lineHeight);
        });
    }

    /**
     * Handle click events
     */
    private handleClick(event: MouseEvent): void {
        if (!this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Find clicked node
        // This would need the current layout - simplified for now
        this.selectedNode = this.hoveredNode;
    }

    /**
     * Handle mouse move events
     */
    private handleMouseMove(event: MouseEvent): void {
        if (!this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Find hovered node
        // This would need the current layout - simplified for now
        this.hoveredNode = null;
    }

    /**
     * Export graph as image
     */
    exportAsImage(): string | null {
        if (!this.canvas) return null;
        return this.canvas.toDataURL('image/png');
    }
}
