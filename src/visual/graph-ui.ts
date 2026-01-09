
import { DependencyGraph } from '../resolve/graph.js';
import { canonicalHash } from '../core/engine/hash.js';

export function getGraphUIHtml(graph: DependencyGraph): string {
    const nodes = Array.from(graph.nodes.values()).map(n => ({
        id: n.id,
        label: n.path.split('/').pop(),
        type: n.type,
        color: n.type === 'css' || n.type === 'css-module' ? '#264de4' : '#f7df1e'
    }));

    const links: any[] = [];
    graph.nodes.forEach(node => {
        node.edges.forEach(edge => {
            links.push({
                source: edge.from,
                target: edge.to,
                kind: edge.kind
            });
        });
    });

    const data = JSON.stringify({ nodes, links });

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Nexxo Graph Visualizer</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        body { margin: 0; background: #1a1a1a; color: white; font-family: sans-serif; overflow: hidden; }
        #graph { width: 100vw; height: 100vh; }
        .node { stroke: #fff; stroke-width: 1.5px; }
        .link { stroke: #999; stroke-opacity: 0.6; }
        .label { font-size: 10px; fill: #eee; pointer-events: none; }
        #info { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 4px; pointer-events: none; }
    </style>
</head>
<body>
    <div id="info">Nexxo Dependency Graph</div>
    <div id="graph"></div>
    <script>
        const data = ${data};
        const width = window.innerWidth;
        const height = window.innerHeight;

        const svg = d3.select("#graph").append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(d3.zoom().on("zoom", (event) => {
                container.attr("transform", event.transform);
            }));

        const container = svg.append("g");

        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = container.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(data.links)
            .enter().append("line")
            .attr("class", "link");

        const node = container.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(data.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 8)
            .attr("fill", d => d.color)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        const label = container.append("g")
            .selectAll("text")
            .data(data.nodes)
            .enter().append("text")
            .attr("class", "label")
            .text(d => d.label);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            label
                .attr("x", d => d.x + 10)
                .attr("y", d => d.y + 3);
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    </script>
</body>
</html>
    `;
}
