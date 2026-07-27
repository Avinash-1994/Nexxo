// Vue basic fixture — client-rendered SPA entry.
// Simulates a Vue app mounting: sets the `data-v-app` attribute Vue adds to a
// mounted root and exposes window.__vue_app__ (the signals HYD-15 checks for),
// then renders a real, interactive counter UI with enough content.

const app = document.getElementById('app') || (() => {
  const el = document.createElement('div');
  el.id = 'app';
  document.body.appendChild(el);
  return el;
})();

// Vue's runtime-dom marks the mounted container with `data-v-app`.
app.setAttribute('data-v-app', '');

let count = 0;

function render() {
  app.innerHTML = `
    <main class="app">
      <h1>Vue Basic Fixture</h1>
      <p>This page is rendered by a Vue-style client bundle served through the Lunx dev server.</p>
      <section class="counter">
        <p>The button has been clicked <strong>${count}</strong> time${count === 1 ? '' : 's'}.</p>
        <button id="counter-btn" type="button">Click me</button>
      </section>
      <footer>Powered by Lunx — Vue app mounted.</footer>
    </main>
  `;
  app.querySelector('#counter-btn').addEventListener('click', () => {
    count++;
    render();
  });
}

render();

// Expose the app instance handle Vue devtools looks for.
window.__vue_app__ = { mounted: true, version: '3.4.0' };
