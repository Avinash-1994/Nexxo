// HMR test fixture — main.js
// Uses import.meta.hot shim (injected by lunx-hmr-client)
// to opt-in to HMR without causing full reloads.

// Track state for state-preservation test
window.__componentState = window.__componentState ?? { counter: 0 };

async function render() {
    const { message } = await import('./component.js?t=' + (window.__compVersion ?? '0'));
    document.getElementById('app').innerHTML = message;
}

// Self-accept so the dev server does NOT fall back to full-reload on this file
if (import.meta.hot) {
    import.meta.hot.accept((newMod) => {
        // Re-fetch component on update
        fetch('/src/component.js?t=' + Date.now())
            .then(r => r.text())
            .then(() => render());
    });
}

render().catch(console.error);
