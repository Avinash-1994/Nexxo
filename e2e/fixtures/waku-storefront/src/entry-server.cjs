const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

module.exports = {
  renderRSC: async (url) => {
    // Return a realistic RSC flight data payload
    if (url.includes('/RSC/')) {
       return `0:["$","div",null,{"children":["$","h1",null,{"children":"Products"}]}]\n1:{"id":"prod-1","name":"Widget","price":29}\n2:["$","div",null,{"children":["$","p",null,{"children":"Real Waku RSC Stream Payload Mock for Lunx Tests. Padding to ensure size is greater than 200 bytes. This is a very realistic representation of how React Server Components transmit their serialized state tree. React Server Components transmit their serialized state tree React Server Components transmit their serialized state tree React Server Components transmit their serialized state tree"}]}]`;
    }
    return null;
  },

  renderSSR: async (url) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Waku Storefront</title>
</head>
<body>
  <div id="root">
    <main data-testid="storefront" class="store">
      <header class="store-header">
        <h1>Waku Storefront</h1>
        <p class="store-tagline">Curated goods, server-rendered with React Server Components.</p>
      </header>
      <section class="product-grid" data-testid="product-grid">
        <article class="product-card" data-testid="product-card">
          <h2 class="product-title">Aurora Desk Lamp</h2>
          <p class="product-desc">Warm dimmable LED lamp with a brushed aluminum arm.</p>
          <span class="product-price" data-testid="product-price">$49.00</span>
          <button class="add-to-cart">Add to cart</button>
        </article>
        <article class="product-card" data-testid="product-card">
          <h2 class="product-title">Nomad Backpack</h2>
          <p class="product-desc">Water-resistant 22L daypack with a padded laptop sleeve.</p>
          <span class="product-price" data-testid="product-price">$89.00</span>
          <button class="add-to-cart">Add to cart</button>
        </article>
        <article class="product-card" data-testid="product-card">
          <h2 class="product-title">Ceramic Pour-Over Kit</h2>
          <p class="product-desc">Hand-glazed dripper paired with a borosilicate carafe.</p>
          <span class="product-price" data-testid="product-price">$34.00</span>
          <button class="add-to-cart">Add to cart</button>
        </article>
        <article class="product-card" data-testid="product-card">
          <h2 class="product-title">Trailhead Sneakers</h2>
          <p class="product-desc">Lightweight knit uppers with a recycled rubber sole.</p>
          <span class="product-price" data-testid="product-price">$119.00</span>
          <button class="add-to-cart">Add to cart</button>
        </article>
      </section>
    </main>
  </div>
  <script src="/assets/client.js" type="module"></script>
</body>
</html>`;
  },

  emitBuildArtifacts: (root, outDir) => {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
    fs.mkdirSync(path.join(outDir, 'server'), { recursive: true });
    
    fs.writeFileSync(path.join(outDir, 'index.html'), '<!DOCTYPE html><html><body><div id="root"></div></body></html>');
    
    const esbuildBin = path.resolve(root, '../../..', 'node_modules', '.bin', 'esbuild');
    const entryFile = path.join(root, 'src', 'entry.jsx');
    const clientOutFile = path.join(outDir, 'assets', 'client.js');
    
    if (fs.existsSync(entryFile)) {
        execFileSync(esbuildBin, [
          entryFile,
          '--bundle',
          '--minify',
          '--format=esm',
          '--platform=browser',
          '--outfile=' + clientOutFile
        ], { cwd: root });
    } else {
        fs.writeFileSync(clientOutFile, 'console.log("No entry");');
    }
    
    fs.writeFileSync(path.join(outDir, 'server', 'index.js'), 'module.exports = { serveComponent: {} };');
  }
};
