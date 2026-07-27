
exports.render = async function render(context) {
    const url = context.url || '/';
    const secret = context.initialState?.secret || 'none';
    
    // Inject overlay test if requested
    if (url === '/error') throw new Error('overlay-test');

    const html = '<div id="app"><h1>SSR</h1><p>Secret: ' + secret + '</p></div>';
    return { html, head: '', state: context.initialState };
};
