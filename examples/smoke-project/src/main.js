const root = document.getElementById('app');
root.innerHTML = `<h1>Urja Smoke Test</h1><p>Dev server + transformer working.</p>`;

// HMR test hook
if (import.meta && import.meta.hot) {
  import.meta.hot.accept(() => {
    root.innerHTML = `<h1>Urja Smoke Test (Updated)</h1><p>HMR applied.</p>`;
  });
}

