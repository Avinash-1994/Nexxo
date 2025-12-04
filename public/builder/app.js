// NextGen Visual Builder - Main Application
// ES6 Module with WebSocket for real-time config sync

// ===== State Management =====
const state = {
    config: null,
    theme: localStorage.getItem('theme') || 'light',
    ws: null,
    plugins: [],
    suggestions: []
};

// ===== WebSocket Connection =====
function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
        state.ws = new WebSocket(wsUrl);

        state.ws.onopen = () => {
            updateConnectionStatus(true);
            showToast('Connected to builder server', 'success');
        };

        state.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };

        state.ws.onclose = () => {
            updateConnectionStatus(false);
            showToast('Connection lost. Reconnecting...', 'error');
            setTimeout(connectWebSocket, 3000);
        };

        state.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        updateConnectionStatus(false);
    }
}

function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'config_update':
            state.config = data.config;
            renderConfig();
            showToast('Configuration updated', 'info');
            break;
        case 'build_complete':
            updateMetrics(data.metrics);
            showToast('Build completed successfully!', 'success');
            break;
        case 'hmr_update':
            incrementHMRCounter();
            break;
    }
}

function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connection-status');
    const dotEl = document.querySelector('.status-dot');

    if (connected) {
        statusEl.textContent = 'Connected';
        dotEl.style.background = 'var(--success)';
    } else {
        statusEl.textContent = 'Disconnected';
        dotEl.style.background = 'var(--error)';
    }
}

// ===== Configuration Management =====
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            state.config = await response.json();
            renderConfig();
        } else {
            // Use default config if API not available
            state.config = {
                root: '.',
                entry: ['src/main.tsx'],
                outDir: 'dist',
                mode: 'production',
                port: 3000,
                plugins: [],
                hmr: { enabled: true, host: 'localhost', port: 24678 },
                parallelPlugins: { enabled: true, workers: 4 }
            };
            renderConfig();
        }
    } catch (error) {
        console.error('Failed to load config:', error);
        // Use default config
        state.config = {
            root: '.',
            entry: ['src/main.tsx'],
            outDir: 'dist',
            mode: 'production',
            port: 3000
        };
        renderConfig();
    }
}

function renderConfig() {
    if (!state.config) return;

    // Update form fields
    document.getElementById('config-root').value = state.config.root || '.';
    document.getElementById('config-outDir').value = state.config.outDir || 'dist';
    document.getElementById('config-mode').value = state.config.mode || 'production';
    document.getElementById('config-port').value = state.config.port || 3000;

    // Update toggles
    document.getElementById('config-hmr-enabled').checked = state.config.hmr?.enabled ?? true;
    document.getElementById('config-parallel-enabled').checked = state.config.parallelPlugins?.enabled ?? true;
    document.getElementById('config-sourcemap').checked = state.config.sourcemap ?? false;

    // Update entry points
    renderEntryPoints();

    // Update JSON preview
    updateJSONPreview();

    // Update metrics
    document.getElementById('metric-plugins').textContent = state.config.plugins?.length || 0;
}

function renderEntryPoints() {
    const container = document.getElementById('entry-points-list');
    const entries = state.config.entry || ['src/main.tsx'];

    container.innerHTML = entries.map((entry, index) => `
    <div class="entry-point-item">
      <input type="text" value="${entry}" data-index="${index}" class="entry-input" placeholder="Entry file path">
      <button class="btn-icon btn-remove" data-index="${index}" onclick="removeEntry(${index})">
        <svg width="16" height="16" fill="currentColor">
          <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
        </svg>
      </button>
    </div>
  `).join('');

    // Add event listeners
    container.querySelectorAll('.entry-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            state.config.entry[index] = e.target.value;
            updateJSONPreview();
        });
    });
}

function updateJSONPreview() {
    const jsonOutput = document.getElementById('json-output');
    jsonOutput.textContent = JSON.stringify(state.config, null, 2);
}

async function saveConfig() {
    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state.config)
        });

        if (response.ok) {
            showToast('Configuration saved successfully!', 'success');
        } else {
            showToast('Failed to save configuration', 'error');
        }
    } catch (error) {
        console.error('Failed to save config:', error);
        showToast('Error saving configuration', 'error');
    }
}

// ===== Plugins =====
async function loadPlugins() {
    try {
        const response = await fetch('/api/plugins');
        if (response.ok) {
            state.plugins = await response.json();
        } else {
            // Mock plugins for demo
            state.plugins = [
                {
                    name: 'sample-plugin-esm',
                    version: '1.0.0',
                    description: 'Example plugin that transforms console.log to console.debug',
                    installed: true
                },
                {
                    name: 'react-refresh',
                    version: '2.0.0',
                    description: 'React Fast Refresh for instant component updates',
                    installed: true
                },
                {
                    name: 'vue-sfc',
                    version: '1.5.0',
                    description: 'Vue Single File Component compiler',
                    installed: false
                },
                {
                    name: 'svelte-preprocess',
                    version: '1.2.0',
                    description: 'Svelte preprocessing and compilation',
                    installed: false
                }
            ];
        }
        renderPlugins();
    } catch (error) {
        console.error('Failed to load plugins:', error);
    }
}

function renderPlugins() {
    const container = document.getElementById('plugin-list');

    container.innerHTML = state.plugins.map(plugin => `
    <div class="plugin-card">
      <div class="plugin-header">
        <div class="plugin-icon">${plugin.name[0].toUpperCase()}</div>
        <div class="plugin-info">
          <h4>${plugin.name}</h4>
          <div class="plugin-version">v${plugin.version}</div>
        </div>
      </div>
      <p class="plugin-description">${plugin.description}</p>
      <div class="plugin-footer">
        <span class="plugin-status ${plugin.installed ? 'installed' : 'available'}">
          ${plugin.installed ? 'Installed' : 'Available'}
        </span>
        <button class="btn-secondary" style="padding: 6px 16px; font-size: 13px;">
          ${plugin.installed ? 'Configure' : 'Install'}
        </button>
      </div>
    </div>
  `).join('');
}

// ===== AI Suggestions =====
async function loadSuggestions() {
    try {
        const response = await fetch('/api/suggestions');
        if (response.ok) {
            state.suggestions = await response.json();
        } else {
            // Mock suggestions for demo
            state.suggestions = [
                {
                    type: 'performance',
                    icon: '⚡',
                    title: 'Enable Code Splitting',
                    description: 'Split your bundle into multiple chunks for faster initial load. Can reduce bundle size by up to 40%.',
                    action: 'Enable'
                },
                {
                    type: 'performance',
                    icon: '🚀',
                    title: 'Use Native Worker',
                    description: 'Switch to Rust native worker for ~20x faster plugin execution. Recommended for large projects.',
                    action: 'Enable'
                },
                {
                    type: 'security',
                    icon: '🔒',
                    title: 'Plugin Verification',
                    description: '2 unsigned plugins detected. Sign all plugins for production builds.',
                    action: 'Review'
                },
                {
                    type: 'dx',
                    icon: '🎨',
                    title: 'TypeScript Config',
                    description: 'Use nextgen.build.ts instead of JSON for type-safe configuration with IntelliSense.',
                    action: 'Convert'
                },
                {
                    type: 'best-practice',
                    icon: '✨',
                    title: 'Source Maps',
                    description: 'Enable source maps in development for better debugging experience.',
                    action: 'Enable'
                }
            ];
        }
        renderSuggestions();
    } catch (error) {
        console.error('Failed to load suggestions:', error);
    }
}

function renderSuggestions() {
    const container = document.getElementById('suggestions-list');

    if (state.suggestions.length === 0) {
        container.innerHTML = '<div class="chart-placeholder"><div class="placeholder-icon">🎉</div><p>No suggestions - your config is optimized!</p></div>';
        return;
    }

    container.innerHTML = state.suggestions.map(suggestion => `
    <div class="suggestion-card ${suggestion.type}">
      <div class="suggestion-header">
        <span class="suggestion-icon">${suggestion.icon}</span>
        <div class="suggestion-title">${suggestion.title}</div>
      </div>
      <p class="suggestion-description">${suggestion.description}</p>
      <div class="suggestion-actions">
        <button class="btn-primary" style="padding: 8px 20px; font-size: 13px;">${suggestion.action}</button>
        <button class="btn-secondary" style="padding: 8px 20px; font-size: 13px;">Dismiss</button>
      </div>
    </div>
  `).join('');
}

// ===== Metrics =====
function updateMetrics(metrics) {
    if (metrics.buildTime) {
        document.getElementById('metric-build-time').textContent = `${metrics.buildTime}s`;
    }
    if (metrics.bundleSize) {
        document.getElementById('metric-bundle-size').textContent = formatBytes(metrics.bundleSize);
    }
}

function incrementHMRCounter() {
    const el = document.getElementById('metric-hmr-updates');
    const current = parseInt(el.textContent) || 0;
    el.textContent = current + 1;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ===== UI Interactions =====
function setupEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Save config
    document.getElementById('save-config').addEventListener('click', saveConfig);

    // Add entry point
    document.getElementById('add-entry').addEventListener('click', addEntry);

    // Copy JSON
    document.getElementById('copy-json').addEventListener('click', copyJSON);

    // Tab switching
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Form inputs
    ['config-root', 'config-outDir', 'config-mode', 'config-port'].forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
            const key = id.replace('config-', '');
            state.config[key] = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
            updateJSONPreview();
        });
    });

    // Toggles
    document.getElementById('config-hmr-enabled').addEventListener('change', (e) => {
        if (!state.config.hmr) state.config.hmr = {};
        state.config.hmr.enabled = e.target.checked;
        updateJSONPreview();
    });

    document.getElementById('config-parallel-enabled').addEventListener('change', (e) => {
        if (!state.config.parallelPlugins) state.config.parallelPlugins = {};
        state.config.parallelPlugins.enabled = e.target.checked;
        updateJSONPreview();
    });

    document.getElementById('config-sourcemap').addEventListener('change', (e) => {
        state.config.sourcemap = e.target.checked;
        updateJSONPreview();
    });

    // Search plugins
    document.getElementById('plugin-search').addEventListener('input', filterPlugins);
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);

    // Update icon
    const sunIcon = document.querySelector('.icon-sun');
    const moonIcon = document.querySelector('.icon-moon');
    if (state.theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

function switchTab(tabName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

function addEntry() {
    if (!state.config.entry) state.config.entry = [];
    state.config.entry.push('');
    renderEntryPoints();
    updateJSONPreview();
}

window.removeEntry = function (index) {
    state.config.entry.splice(index, 1);
    renderEntryPoints();
    updateJSONPreview();
};

function copyJSON() {
    const json = JSON.stringify(state.config, null, 2);
    navigator.clipboard.writeText(json).then(() => {
        showToast('Configuration copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

function filterPlugins(e) {
    const query = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.plugin-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
    });
}

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== Initialization =====
async function init() {
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', state.theme);
    if (state.theme === 'dark') {
        document.querySelector('.icon-sun').style.display = 'none';
        document.querySelector('.icon-moon').style.display = 'block';
    }

    // Setup event listeners
    setupEventListeners();

    // Load data
    await loadConfig();
    await loadPlugins();
    await loadSuggestions();

    // Connect WebSocket
    connectWebSocket();

    console.log('NextGen Visual Builder initialized');
}

// Start the application
init();
