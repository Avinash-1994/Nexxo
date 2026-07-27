// React basic fixture — client-rendered SPA entry.
// Simulates a React app mounting: registers the React DevTools global hook
// (the signal HYD-14 checks for "React loaded and mounted") and renders a
// real, interactive counter UI with enough content to prove the bundle ran.

// React runtimes always probe window.__REACT_DEVTOOLS_GLOBAL_HOOK__ on load;
// here we install it to mark that the React runtime has initialised.
window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {
  supportsFiber: true,
  renderers: new Map(),
  inject() { return 1; },
  onCommitFiberRoot() {},
  onCommitFiberUnmount() {},
};

const root = document.getElementById('root') || (() => {
  const el = document.createElement('div');
  el.id = 'root';
  document.body.appendChild(el);
  return el;
})();

let count = 0;

function render() {
  root.innerHTML = `
    <main data-reactroot class="app">
      <h1>React Basic Fixture</h1>
      <p>This page is rendered by a React-style client bundle served through the Lunx dev server.</p>
      <section class="counter">
        <p>You clicked the button <strong>${count}</strong> time${count === 1 ? '' : 's'}.</p>
        <button id="counter-btn" type="button">Increment counter</button>
      </section>
      <footer>Powered by Lunx — SPA client render complete.</footer>
    </main>
  `;
  root.querySelector('#counter-btn').addEventListener('click', () => {
    count++;
    render();
  });
}

render();
