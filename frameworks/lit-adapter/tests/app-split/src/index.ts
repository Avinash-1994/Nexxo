async function load() {
    const { message } = await import('./lazy.js'); // Vite/TS usually likes extension or not.
    console.log(message);
}
load();
