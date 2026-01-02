import Alpine from 'alpinejs';

document.addEventListener('alpine:init', () => {
    Alpine.data('hello', () => ({
        message: 'Hello Alpine!',
        init() {
            console.log(this.message);
        }
    }));
});

Alpine.start();
