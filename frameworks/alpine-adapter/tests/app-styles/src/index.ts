import Alpine from 'alpinejs';
import './style.css';
import logo from './logo.png';

document.addEventListener('alpine:init', () => {
    Alpine.data('styles', () => ({
        logo: logo
    }));
});

Alpine.start();
