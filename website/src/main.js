import './styles/theme.css';
import './components/ur-layout.js';
import './pages/index.js';
import './pages/getting-started.js';
import './pages/guide-lit.js';
import './pages/guide-react.js';
import './pages/guide-vue.js';
import './pages/guide-angular.js';

function render() {
    const hash = window.location.hash || '#/';
    const container = document.getElementById('app');

    // Simple router
    let content = '<ur-home></ur-home>';

    if (hash === '#/docs/getting-started') {
        content = '<ur-docs-getting-started></ur-docs-getting-started>';
    } else if (hash === '#/guides/lit') {
        content = '<ur-guide-lit></ur-guide-lit>';
    } else if (hash === '#/guides/react') {
        content = '<ur-guide-react></ur-guide-react>';
    } else if (hash === '#/guides/vue') {
        content = '<ur-guide-vue></ur-guide-vue>';
    } else if (hash === '#/guides/angular') {
        content = '<ur-guide-angular></ur-guide-angular>';
    }

    container.innerHTML = `<ur-layout>${content}</ur-layout>`;
}

window.addEventListener('hashchange', render);
window.addEventListener('load', render);
render();
