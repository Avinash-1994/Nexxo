import Alpine from 'alpinejs';
import app from './app.js';
import './styles.css';

// Inject template
document.body.innerHTML = `
<div x-data="app" class="template-root">
    <h1>Alpine.js Starter</h1>
    <p x-text="message"></p>
    <button @click="increment">
        Count: <span x-text="count"></span>
    </button>
    <img src="/logo.svg" class="logo" alt="Logo" />
</div>
`;

window.Alpine = Alpine;
Alpine.data('app', app);
Alpine.start();
