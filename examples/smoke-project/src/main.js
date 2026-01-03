const root = document.getElementById('app');
root.innerHTML = `
  <div style="padding: 2rem; border: 4px dashed #ff00ff; border-radius: 20px; text-align: center;">
    <h1 style="color: #ff00ff; font-family: 'Courier New', monospace;">💨 Urja Smoke Test</h1>
    <p>Status: ✅ Dev Server & Transformer Baseline Verified</p>
    <p style="font-size: 0.8rem; color: #888;">Initial build successful.</p>
  </div>
`;

// HMR test hook
if (import.meta && import.meta.hot) {
  import.meta.hot.accept(() => {
    root.innerHTML = `<h1>Urja Smoke Test (Updated)</h1><p>HMR applied.</p>`;
  });
}

