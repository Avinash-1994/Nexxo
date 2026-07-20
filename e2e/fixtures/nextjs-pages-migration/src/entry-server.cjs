'use strict';
/**
 * nextjs-pages-migration/src/entry-server.cjs
 * Lunx SSR renderer for the Next.js Pages Router fixture.
 *
 * Emits a full HTML document with a hydrated `#__next` container and the
 * `__NEXT_DATA__` payload Next.js ships on every page — both as the
 * <script id="__NEXT_DATA__"> element and as window.__NEXT_DATA__ so the
 * hydration marker resolves without the full Next runtime.
 */

function getPageData(url) {
  const route = url || '/';
  if (route.startsWith('/about')) {
    return {
      page: '/about',
      title: 'About',
      body: `
        <h1>About</h1>
        <p>This is a Next.js Pages Router application migrated to the Lunx build pipeline.</p>
        <p>Server-side rendering runs through the Lunx dev server while keeping the classic getServerSideProps data flow.</p>
        <a href="/">&larr; Back home</a>`,
      props: { page: 'about' },
    };
  }
  return {
    page: '/',
    title: 'Notes App',
    body: `
      <h1>My Notes</h1>
      <p>A simple notes application rendered server-side and hydrated on the client via Lunx SSR. This platform provides a seamless transition for developers looking to move legacy Pages Router applications into a modern, high-performance build pipeline without sacrificing existing server-side data fetching patterns.</p>
      <ul class="note-list">
        <li><a href="/posts/1">Note 1 — Migrating to Lunx</a></li>
        <li><a href="/posts/2">Note 2 — SWC transforms explained</a></li>
        <li><a href="/posts/3">Note 3 — Pages Router compatibility</a></li>
      </ul>
      <a href="/about">About this app</a>`,
    props: {
      posts: [
        { id: 1, title: 'Migrating to Lunx' },
        { id: 2, title: 'SWC transforms explained' },
        { id: 3, title: 'Pages Router compatibility' },
      ],
    },
  };
}

function renderPage(url) {
  const data = getPageData(url);
  const nextData = {
    props: { pageProps: data.props },
    page: data.page,
    query: {},
    buildId: 'lunx-dev',
    isFallback: false,
    gssp: true,
  };
  const serialized = JSON.stringify(nextData);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.title}</title>
</head>
<body>
  <div id="__next"><main>${data.body}</main></div>
  <script id="__NEXT_DATA__" type="application/json">${serialized}</script>
  <script>window.__NEXT_DATA__ = ${serialized};</script>
</body>
</html>`;
}

module.exports = { renderPage };
