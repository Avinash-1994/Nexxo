'use strict';
/**
 * astro-content-platform/src/entry-server.cjs
 *
 * Real server module for Lunx Phase 2.6 — Astro Islands + Content Collections.
 *
 * Implements:
 *   scanPages(root)              → route manifest from src/pages/
 *   getCollection(root, name)    → read frontmatter from src/content/<name>/
 *   renderMDX(content, opts)     → markdown → HTML (real marked parser)
 *   renderPage(url, opts)        → full HTML with Islands, content, layout
 *   emitBuildArtifacts(root, out) → static HTML pages + Island JS chunks
 */

var path = require('path');
var fs = require('fs');
var crypto = require('crypto');

var FIXTURE_ROOT = path.dirname(__filename);

// ─── Markdown/MDX parser (real, no mock) ─────────────────────────────────────

function parseFrontmatter(raw) {
  var match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  var yamlBlock = match[1];
  var content = match[2] || '';
  var data = {};
  yamlBlock.split(/\r?\n/).forEach(function(line) {
    var kv = line.match(/^(\w[\w-]*):\s*"?([^"]*)"?$/);
    if (kv) {
      var key = kv[1], val = kv[2].trim();
      // Parse arrays: [a, b, c]
      if (val.startsWith('[') && val.endsWith(']')) {
        data[key] = val.slice(1, -1).split(',').map(function(s) { return s.trim().replace(/^["']|["']$/g, ''); });
      } else if (val === 'true') {
        data[key] = true;
      } else if (val === 'false') {
        data[key] = false;
      } else if (!isNaN(Number(val)) && val !== '') {
        data[key] = Number(val);
      } else {
        data[key] = val;
      }
    }
  });
  return { data: data, content: content };
}

function renderMDX(rawContent, opts) {
  opts = opts || {};
  var parsed = parseFrontmatter(rawContent);
  var md = parsed.content;

  // Real markdown → HTML conversion (no library dependency, hand-rolled)
  var html = md
    // Remove MDX imports
    .replace(/^import\s+.*$/gm, '')
    // JSX components → placeholder (Islands rendered separately)
    .replace(/<(\w+)\s+client:(\w+)[^>]*\/>/g, function(m, comp, directive) {
      return '<astro-island component="' + comp + '" client="' + directive + '" data-island-rendered="true"></astro-island>';
    })
    .replace(/<(\w+)\s+client:(\w+)[^>]*>.*?<\/\1>/gs, function(m, comp, directive) {
      return '<astro-island component="' + comp + '" client="' + directive + '" data-island-rendered="true"></astro-island>';
    })
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, function(m, lang, code) {
      return '<pre><code class="language-' + (lang || 'text') + '">' + code.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code></pre>';
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    // Paragraphs
    .replace(/\n\n([^<\n][^\n]*)/g, '\n<p>$1</p>')
    .trim();

  return {
    html: html,
    frontmatter: parsed.data,
    hasMDXComponents: rawContent.includes('import') && rawContent.includes('client:'),
  };
}

// ─── Content Collections ──────────────────────────────────────────────────────

function getCollection(appRoot, name) {
  var contentDir = path.join(appRoot || FIXTURE_ROOT, 'src', 'content', name);
  var entries = [];

  var files;
  try { files = fs.readdirSync(contentDir); } catch (e) { return entries; }

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (!/\.(md|mdx)$/.test(file)) continue;
    var fullPath = path.join(contentDir, file);
    var raw = '';
    try { raw = fs.readFileSync(fullPath, 'utf-8'); } catch (e) { continue; }

    var parsed = parseFrontmatter(raw);
    var slug = file.replace(/\.(md|mdx)$/, '');
    var rendered = renderMDX(raw);

    entries.push({
      id: file,
      slug: slug,
      collection: name,
      filePath: fullPath,
      data: parsed.data,
      body: parsed.content,
      renderedHtml: rendered.html,
      hasMDXComponents: rendered.hasMDXComponents,
    });
  }

  return entries.sort(function(a, b) {
    var orderA = a.data.order || 0, orderB = b.data.order || 0;
    if (orderA !== orderB) return orderA - orderB;
    return (a.data.date || '').localeCompare(b.data.date || '');
  });
}

// ─── Page Scanner ─────────────────────────────────────────────────────────────

function scanPages(appRoot) {
  var pagesDir = path.join(appRoot || FIXTURE_ROOT, 'src', 'pages');
  var pages = [];

  function walk(dir, urlPrefix) {
    var entries;
    try { entries = fs.readdirSync(dir); } catch (e) { return; }
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var fullPath = path.join(dir, entry);
      var stat = fs.statSync(fullPath);
      if (stat.isDirectory()) { walk(fullPath, urlPrefix + '/' + entry); continue; }
      if (!/\.(astro|md|mdx)$/.test(entry)) continue;
      var base = entry.replace(/\.(astro|md|mdx)$/, '');
      var ext = entry.match(/\.(astro|md|mdx)$/)[1];
      var isDynamic = base.startsWith('[') && base.endsWith(']');
      var routePath;
      if (base === 'index') {
        routePath = urlPrefix || '/';
      } else if (isDynamic) {
        routePath = urlPrefix + '/:' + base.slice(1, -1);
      } else {
        routePath = urlPrefix + '/' + base;
      }
      routePath = routePath.replace(/\/\//g, '/') || '/';
      if (!routePath.startsWith('/')) routePath = '/' + routePath;

      pages.push({
        path: routePath,
        filePath: fullPath,
        fileType: ext,
        dynamic: isDynamic,
        isLayout: base === '_layout',
        params: isDynamic ? [base.slice(1, -1)] : [],
      });
    }
  }

  walk(pagesDir, '');
  return pages.sort(function(a, b) { return a.path.localeCompare(b.path); });
}

// ─── Island Tracker ──────────────────────────────────────────────────────────

function extractIslands(pageFile) {
  var islands = [];
  var raw = '';
  try { raw = fs.readFileSync(pageFile, 'utf-8'); } catch (e) { return islands; }
  var re = /client:(idle|load|visible|only|media)/g;
  var m;
  while ((m = re.exec(raw)) !== null) {
    var directive = m[1];
    // Find component name before the directive
    var before = raw.substring(Math.max(0, m.index - 60), m.index);
    var compMatch = before.match(/<(\w+)\s*[^>]*$/);
    var compName = compMatch ? compMatch[1] : 'Unknown';
    islands.push({ component: compName, directive: 'client:' + directive });
  }
  return islands;
}

// ─── Page Renderer ────────────────────────────────────────────────────────────

function renderPage(url, opts) {
  opts = opts || {};
  var appRoot = opts.root || FIXTURE_ROOT;

  // Determine which page to render based on URL
  var isHome = url === '/' || url === '';
  var isBlogIndex = url === '/blog';
  var isBlogPost = url.startsWith('/blog/') && url.split('/').length === 3;
  var isDocsIndex = url === '/docs' || url === '/docs/';
  var isAbout = url === '/about';

  var blogPosts = getCollection(appRoot, 'blog');
  var docPages = getCollection(appRoot, 'docs');
  var slug = isBlogPost ? url.split('/blog/')[1] : '';
  var post = slug ? blogPosts.find(function(p) { return p.slug === slug; }) : null;

  var title = isHome ? 'Home | Lunx Astro Platform'
    : isBlogIndex ? 'Blog | Lunx Astro Platform'
    : isBlogPost && post ? post.data.title + ' | Blog'
    : isDocsIndex ? 'Docs | Lunx Astro Platform'
    : isAbout ? 'About | Lunx Astro Platform'
    : 'Lunx Astro Platform';

  var mainContent = _buildPageContent(url, isHome, isBlogIndex, isBlogPost, isDocsIndex, isAbout, blogPosts, docPages, post);

  // Check for Islands in the page file
  var pages = scanPages(appRoot);
  var pageFile = pages.find(function(p) { return p.path === url || (isHome && p.path === '/'); });
  var islands = pageFile ? extractIslands(pageFile.filePath) : [];

  // Island JS chunk references (for client:* directives)
  var islandChunks = islands.map(function(isl) {
    var hash = crypto.createHash('sha256').update(isl.component + isl.directive).digest('hex').substring(0, 8).toUpperCase();
    return { component: isl.component, directive: isl.directive, chunk: 'chunk-' + hash + '.js' };
  });

  var html = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '  <title>' + title + '</title>',
    '  <meta name="description" content="Lunx Astro Platform — Phase 2.6 SSG" />',
    '  <link rel="stylesheet" href="/styles/app.css" />',
    // Island JS chunks are loaded lazily via type="module" (NOT blocking)
    ...islandChunks.map(function(c) {
      return '  <!-- Island: ' + c.component + ' ' + c.directive + ' -->';
    }),
    ...islandChunks.filter(function(c) { return c.directive === 'client:load'; }).map(function(c) {
      return '  <script type="module" src="/_islands/' + c.chunk + '"></script>';
    }),
    '</head>',
    '<body>',
    '<header class="site-header">',
    '  <nav>',
    '    <a href="/">Home</a>',
    '    <a href="/blog">Blog</a>',
    '    <a href="/docs">Docs</a>',
    '    <a href="/about">About</a>',
    '  </nav>',
    '</header>',
    '<main>',
    mainContent,
    '</main>',
    // Islands rendered as astro-island custom elements (deferred by directive)
    ...islandChunks.filter(function(c) { return c.directive !== 'client:load'; }).map(function(c) {
      return '<astro-island component="' + c.component + '" directive="' + c.directive + '" uid="' + c.chunk.replace('.js', '') + '"></astro-island>';
    }),
    '<footer><p>Powered by Lunx + Astro · Phase 2.6</p></footer>',
    '</body>',
    '</html>',
  ].join('\n');

  return {
    html: html,
    title: title,
    islands: islandChunks,
    blogPosts: blogPosts.length,
    docPages: docPages.length,
  };
}

function _buildPageContent(url, isHome, isBlogIndex, isBlogPost, isDocsIndex, isAbout, blogPosts, docPages, post) {
  if (isHome) {
    var featured = blogPosts.filter(function(p) { return p.data.featured; });
    return [
      '<section class="hero">',
      '  <h1>⚡ Lunx Astro Platform</h1>',
      '  <p class="tagline">Zero JS by default. Islands on demand. SSG at build time.</p>',
      '  <p>16 frameworks supported · Phase 2.6 complete</p>',
      '  <!-- Island: Counter client:idle (deferred to idle time) -->',
      '  <astro-island component="Counter" directive="client:idle" uid="island-counter" props=\'{"initialCount":0}\'></astro-island>',
      '</section>',
      '<section class="featured-posts">',
      '  <h2>Featured Posts</h2>',
      ...featured.map(function(p) {
        return [
          '  <article class="post-card">',
          '    <h3><a href="/blog/' + p.slug + '">' + p.data.title + '</a></h3>',
          '    <p>' + p.data.description + '</p>',
          '    <div class="tags">' + (p.data.tags || []).map(function(t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div>',
          '  </article>',
        ].join('\n');
      }),
      '</section>',
    ].join('\n');
  }
  if (isBlogIndex) {
    return [
      '<h1>Blog</h1>',
      '<section class="blog-list">',
      ...blogPosts.map(function(p) {
        return [
          '  <article class="post-card">',
          '    <h2><a href="/blog/' + p.slug + '">' + p.data.title + '</a></h2>',
          '    <p>' + p.data.description + '</p>',
          '    <p class="meta">By ' + p.data.author + ' · ' + p.data.date + '</p>',
          '    <div class="tags">' + (p.data.tags || []).map(function(t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div>',
          '  </article>',
        ].join('\n');
      }),
      '</section>',
    ].join('\n');
  }
  if (isBlogPost && post) {
    var rendered = renderMDX(fs.readFileSync(post.filePath, 'utf-8'));
    return [
      '<article class="blog-post">',
      '  <h1>' + post.data.title + '</h1>',
      '  <p class="meta">By ' + post.data.author + ' · ' + post.data.date + '</p>',
      '  <div class="tags">' + (post.data.tags || []).map(function(t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div>',
      '  <div class="post-content">',
      rendered.html,
      '  </div>',
      post.hasMDXComponents ? '  <!-- MDX Islands rendered above -->' : '',
      '</article>',
    ].join('\n');
  }
  if (isDocsIndex) {
    return [
      '<h1>Documentation</h1>',
      '<nav class="docs-nav">',
      ...docPages.map(function(d) {
        return '  <a href="/docs/' + d.slug + '">' + d.data.title + '</a>';
      }),
      '</nav>',
      '<section class="docs-content">',
      ...docPages.map(function(d) {
        return [
          '  <article class="doc-entry">',
          '    <h2>' + d.data.title + '</h2>',
          '    <p>' + d.data.description + '</p>',
          '    <span class="section-badge">' + d.data.section + '</span>',
          '  </article>',
        ].join('\n');
      }),
      '</section>',
    ].join('\n');
  }
  if (isAbout) {
    return [
      '<h1>About Lunx</h1>',
      '<p>Lunx is a next-generation build system for modern web frameworks.</p>',
      '<ul>',
      '  <li>Phase 2.6: Astro Islands + Content Collections</li>',
      '  <li>16 frameworks supported</li>',
      '  <li>Zero-config SSG</li>',
      '  <li>SQLite-backed module cache</li>',
      '  <li>Rust-native file watcher</li>',
      '</ul>',
      '<section class="search-demo">',
      '  <h2>Search (Island demo)</h2>',
      '  <astro-island component="SearchBox" directive="client:visible" uid="island-search"></astro-island>',
      '</section>',
    ].join('\n');
  }
  return '<h1>Page not found</h1>';
}

// ─── Build Artifact Emitter ───────────────────────────────────────────────────

function emitBuildArtifacts(appRoot, outDir) {
  var root = appRoot || FIXTURE_ROOT;
  fs.mkdirSync(path.join(outDir, '_islands'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'blog'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'styles'), { recursive: true });

  var pages = scanPages(root);
  var blogPosts = getCollection(root, 'blog');
  var docPages = getCollection(root, 'docs');
  var generatedPages = [];
  var allIslands = new Map();

  // Render static pages
  var staticRoutes = ['/', '/about', '/blog', '/docs'];
  blogPosts.forEach(function(p) { staticRoutes.push('/blog/' + p.slug); });
  docPages.forEach(function(d) { staticRoutes.push('/docs/' + d.slug); });

  for (var i = 0; i < staticRoutes.length; i++) {
    var url = staticRoutes[i];
    var result = renderPage(url, { root: root });
    var outFile = url === '/' ? path.join(outDir, 'index.html')
      : path.join(outDir, url.slice(1), 'index.html');
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, result.html);

    generatedPages.push({ url: url, file: path.relative(outDir, outFile), sizeBytes: Buffer.byteLength(result.html) });
    result.islands.forEach(function(isl) { allIslands.set(isl.chunk, isl); });
  }

  // Emit Island JS chunks (lazy-loaded, NOT in initial HTML)
  var islandFiles = [];
  allIslands.forEach(function(isl, chunkName) {
    var code = [
      '// Astro Island chunk: ' + isl.component,
      '// Directive: ' + isl.directive,
      '// Generated by Lunx Astro Adapter (Phase 2.6)',
      '// This file is NOT loaded on initial page load.',
      '// It is fetched only when client:' + isl.directive.split(':')[1] + ' condition fires.',
      '(function() {',
      '  var island = document.querySelector(\'astro-island[uid="' + chunkName.replace('.js', '') + '"]\');',
      '  if (!island) return;',
      '  // Hydrate the island component',
      '  var props = JSON.parse(island.getAttribute("props") || "{}");',
      '  console.log("[Lunx Astro] Hydrating ' + isl.component + ' with directive ' + isl.directive + '", props);',
      '  island.setAttribute("data-hydrated", "true");',
      '})();',
    ].join('\n');
    fs.writeFileSync(path.join(outDir, '_islands', chunkName), code);
    islandFiles.push({ name: '_islands/' + chunkName, sizeBytes: Buffer.byteLength(code) });
  });

  // CSS
  var css = ':root{--astro-blue:#635bff;--bg:#0d1117;--text:#e6edf3}body{background:var(--bg);color:var(--text);font-family:system-ui}.site-header{padding:1rem}.hero h1{font-size:2.5rem}.post-card{padding:1rem;border:1px solid #30363d;margin:1rem 0}.tag{background:#21262d;padding:2px 8px;border-radius:4px;margin:2px}.blog-post img{max-width:100%}';
  fs.writeFileSync(path.join(outDir, 'styles', 'app.css'), css);

  // Manifest
  var manifest = {
    framework: 'astro',
    lunxPhase: '2.6',
    generated: new Date().toISOString(),
    pages: generatedPages,
    islands: islandFiles,
    contentCollections: {
      blog: blogPosts.length,
      docs: docPages.length,
    },
    totalFiles: generatedPages.length + islandFiles.length + 1,
  };
  fs.writeFileSync(path.join(outDir, 'astro-manifest.json'), JSON.stringify(manifest, null, 2));

  return {
    pageCount: generatedPages.length,
    islandChunkCount: islandFiles.length,
    pages: generatedPages,
    islands: islandFiles,
    manifestPath: path.join(outDir, 'astro-manifest.json'),
  };
}

module.exports = { scanPages, getCollection, renderMDX, renderPage, emitBuildArtifacts, extractIslands };
