
// Edge Function Entry Point
export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/hello') {
        return new Response('Hello from Nexxo Edge!', {
            headers: { 'content-type': 'text/plain' }
        });
    }

    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><title>Nexxo Edge</title></head>
        <body>
          <h1>⚡ Nexxo Edge Runtime</h1>
          <p>Request URL: ${request.url}</p>
          <p>Region: ${request.cf?.colo || 'Local'}</p>
        </body>
      </html>
    `, {
      headers: { 'content-type': 'text/html' }
    });
  }
};
