export function getEditorHtml(config: any) {
    const remotes = config.federation?.remotes || {};
    const exposes = config.federation?.exposes || {};
    const shared = config.federation?.shared || {};

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nexxo Federation Editor</title>
    <style>
        :root {
            --bg: #0f172a;
            --surface: #1e293b;
            --primary: #3b82f6;
            --text: #f8fafc;
            --text-dim: #94a3b8;
            --border: #334155;
        }
        body {
            font-family: 'Inter', system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            margin: 0;
            display: flex;
            height: 100vh;
        }
        .sidebar {
            width: 300px;
            background: var(--surface);
            border-right: 1px solid var(--border);
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .main {
            flex: 1;
            padding: 40px;
            overflow-y: auto;
        }
        h1, h2, h3 { margin: 0; }
        .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
        }
        .section-title {
            color: var(--text-dim);
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 10px;
        }
        .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            background: rgba(255,255,255,0.05);
            border-radius: 4px;
            margin-bottom: 8px;
            cursor: grab;
        }
        .item:active { cursor: grabbing; }
        .badge {
            background: var(--primary);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.75rem;
        }
        .drop-zone {
            border: 2px dashed var(--border);
            border-radius: 8px;
            padding: 40px;
            text-align: center;
            color: var(--text-dim);
            transition: all 0.2s;
        }
        .drop-zone.drag-over {
            border-color: var(--primary);
            background: rgba(59, 130, 246, 0.1);
            color: var(--primary);
        }
        input {
            background: var(--bg);
            border: 1px solid var(--border);
            color: var(--text);
            padding: 8px;
            border-radius: 4px;
            width: 100%;
            box-sizing: border-box;
        }
        button {
            background: var(--primary);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
        }
        button:hover { opacity: 0.9; }
    </style>
</head>
<body>
    <div class="sidebar">
        <div>
            <h1>Federation</h1>
            <p style="color: var(--text-dim); font-size: 0.875rem;">Visual Editor</p>
        </div>
        
        <div>
            <div class="section-title">Configured Remotes</div>
            <div id="remotes-list">
                ${Object.entries(remotes).map(([name, url]) => `
                    <div class="item" draggable="true" data-type="remote" data-name="${name}" data-url="${url}">
                        <span>${name}</span>
                        <span class="badge">Remote</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div>
            <div class="section-title">Exposed Modules</div>
            <div id="exposes-list">
                ${Object.entries(exposes).map(([key, path]) => `
                    <div class="item">
                        <span>${key}</span>
                        <span style="color: var(--text-dim); font-size: 0.75rem;">${path}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <div class="main">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <h2>Dependency Graph</h2>
            <button onclick="saveConfig()">Save Changes</button>
        </div>

        <div class="drop-zone" id="canvas">
            <h3>Drag Remotes Here to Link</h3>
            <p>Visualize relationships between Host and Remotes</p>
            <div id="graph-container" style="margin-top: 20px; display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;">
                <!-- Graph Nodes will appear here -->
            </div>
        </div>

        <div style="margin-top: 40px;">
            <h3>Shared Dependencies</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">
                ${Object.entries(shared).map(([pkg, opts]: [string, any]) => `
                    <div class="card">
                        <strong>${pkg}</strong>
                        <div style="margin-top: 8px; font-size: 0.875rem; color: var(--text-dim);">
                            <div>Singleton: ${opts.singleton ? 'Yes' : 'No'}</div>
                            <div>Version: ${opts.requiredVersion || '*'}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <script>
        // Simple Drag and Drop Logic
        const draggables = document.querySelectorAll('[draggable="true"]');
        const canvas = document.getElementById('canvas');
        const graphContainer = document.getElementById('graph-container');

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', () => {
                draggable.classList.add('dragging');
            });

            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
            });
        });

        canvas.addEventListener('dragover', e => {
            e.preventDefault();
            canvas.classList.add('drag-over');
        });

        canvas.addEventListener('dragleave', () => {
            canvas.classList.remove('drag-over');
        });

        canvas.addEventListener('drop', e => {
            e.preventDefault();
            canvas.classList.remove('drag-over');
            const dragging = document.querySelector('.dragging');
            if (dragging) {
                const name = dragging.dataset.name;
                const url = dragging.dataset.url;
                addNodeToGraph(name, url);
            }
        });

        function addNodeToGraph(name, url) {
            const node = document.createElement('div');
            node.className = 'card';
            node.style.minWidth = '200px';
            node.innerHTML = \`
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>\${name}</strong>
                    <button style="padding: 2px 6px; font-size: 12px; background: #ef4444;" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">\${url}</div>
                <div style="margin-top: 10px; font-size: 12px; color: #22c55e;">● Linked</div>
            \`;
            graphContainer.appendChild(node);
        }

        function saveConfig() {
            alert('Config saved! (Simulation)');
            // In real app, POST to /__nexxo/api/federation/save
        }
    </script>
</body>
</html>
    `;
}
