// node_modules/kleur/index.mjs
var FORCE_COLOR;
var NODE_DISABLE_COLORS;
var NO_COLOR;
var TERM;
var isTTY = true;
if (typeof process !== "undefined") {
  ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
  isTTY = process.stdout && process.stdout.isTTY;
}
var $ = {
  enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY),
  // modifiers
  reset: init(0, 0),
  bold: init(1, 22),
  dim: init(2, 22),
  italic: init(3, 23),
  underline: init(4, 24),
  inverse: init(7, 27),
  hidden: init(8, 28),
  strikethrough: init(9, 29),
  // colors
  black: init(30, 39),
  red: init(31, 39),
  green: init(32, 39),
  yellow: init(33, 39),
  blue: init(34, 39),
  magenta: init(35, 39),
  cyan: init(36, 39),
  white: init(37, 39),
  gray: init(90, 39),
  grey: init(90, 39),
  // background colors
  bgBlack: init(40, 49),
  bgRed: init(41, 49),
  bgGreen: init(42, 49),
  bgYellow: init(43, 49),
  bgBlue: init(44, 49),
  bgMagenta: init(45, 49),
  bgCyan: init(46, 49),
  bgWhite: init(47, 49)
};
function run(arr, str) {
  let i = 0, tmp, beg = "", end = "";
  for (; i < arr.length; i++) {
    tmp = arr[i];
    beg += tmp.open;
    end += tmp.close;
    if (!!~str.indexOf(tmp.close)) {
      str = str.replace(tmp.rgx, tmp.close + tmp.open);
    }
  }
  return beg + str + end;
}
function chain(has, keys) {
  let ctx = { has, keys };
  ctx.reset = $.reset.bind(ctx);
  ctx.bold = $.bold.bind(ctx);
  ctx.dim = $.dim.bind(ctx);
  ctx.italic = $.italic.bind(ctx);
  ctx.underline = $.underline.bind(ctx);
  ctx.inverse = $.inverse.bind(ctx);
  ctx.hidden = $.hidden.bind(ctx);
  ctx.strikethrough = $.strikethrough.bind(ctx);
  ctx.black = $.black.bind(ctx);
  ctx.red = $.red.bind(ctx);
  ctx.green = $.green.bind(ctx);
  ctx.yellow = $.yellow.bind(ctx);
  ctx.blue = $.blue.bind(ctx);
  ctx.magenta = $.magenta.bind(ctx);
  ctx.cyan = $.cyan.bind(ctx);
  ctx.white = $.white.bind(ctx);
  ctx.gray = $.gray.bind(ctx);
  ctx.grey = $.grey.bind(ctx);
  ctx.bgBlack = $.bgBlack.bind(ctx);
  ctx.bgRed = $.bgRed.bind(ctx);
  ctx.bgGreen = $.bgGreen.bind(ctx);
  ctx.bgYellow = $.bgYellow.bind(ctx);
  ctx.bgBlue = $.bgBlue.bind(ctx);
  ctx.bgMagenta = $.bgMagenta.bind(ctx);
  ctx.bgCyan = $.bgCyan.bind(ctx);
  ctx.bgWhite = $.bgWhite.bind(ctx);
  return ctx;
}
function init(open, close) {
  let blk = {
    open: `\x1B[${open}m`,
    close: `\x1B[${close}m`,
    rgx: new RegExp(`\\x1b\\[${close}m`, "g")
  };
  return function(txt) {
    if (this !== void 0 && this.has !== void 0) {
      !!~this.has.indexOf(open) || (this.has.push(open), this.keys.push(blk));
      return txt === void 0 ? this : $.enabled ? run(this.keys, txt + "") : txt + "";
    }
    return txt === void 0 ? chain([open], [blk]) : $.enabled ? run([blk], txt + "") : txt + "";
  };
}
var kleur_default = $;

// src/utils/logger.ts
var log = {
  info: (...args) => console.log(kleur_default.cyan("[info]"), ...args),
  warn: (...args) => console.warn(kleur_default.yellow("[warn]"), ...args),
  error: (...args) => console.error(kleur_default.red("[error]"), ...args),
  success: (...args) => console.log(kleur_default.green("[ok]"), ...args)
};

// src/plugins/index.ts
var PluginManager = class {
  constructor() {
    this.plugins = [];
  }
  register(p) {
    this.plugins.push(p);
  }
  async transform(code, id) {
    let result = code;
    for (const p of this.plugins) {
      if (p.transform) {
        const res = await p.transform(result, id);
        if (res)
          result = res;
      }
    }
    return result;
  }
};

// src/core/pipeline.ts
var BuildPipeline = class {
  constructor(config) {
    this.steps = [];
    this.context = {
      config,
      pluginManager: new PluginManager(),
      entryPoints: {},
      files: {},
      artifacts: [],
      startTime: Date.now()
    };
    if (config.plugins) {
      config.plugins.forEach((p) => this.context.pluginManager.register(p));
    }
  }
  addStep(step) {
    this.steps.push(step);
    return this;
  }
  async execute() {
    log.info("Starting Build Pipeline...");
    for (const step of this.steps) {
      try {
        log.info(`[Pipeline] Running step: ${step.name}`);
        const start = Date.now();
        await step.run(this.context);
        const duration = Date.now() - start;
        log.info(`[Pipeline] Step ${step.name} completed in ${duration}ms`);
      } catch (error) {
        log.error(`[Pipeline] Step ${step.name} failed:`, error);
        throw error;
      }
    }
    const totalTime = Date.now() - this.context.startTime;
    log.success(`Build Pipeline completed in ${totalTime}ms`);
    return this.context;
  }
};

// src/core/steps.ts
import path4 from "path";
import fs4 from "fs/promises";
import esbuild from "esbuild";

// src/cache/index.ts
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
var globalFetch = globalThis.fetch;
var DiskCache = class {
  constructor(base) {
    this.dir = path.resolve(base, ".urja_cache");
  }
  async ensure() {
    await fs.mkdir(this.dir, { recursive: true });
  }
  async keyFromFiles(paths) {
    const hash = crypto.createHash("sha256");
    for (const p of paths.sort()) {
      try {
        const data = await fs.readFile(p);
        hash.update(data);
      } catch (e) {
        hash.update(p);
      }
    }
    try {
      const cfg = await fs.readFile("urja.build.json");
      hash.update(cfg);
    } catch (e) {
    }
    try {
      const pkg = await fs.readFile("package.json");
      hash.update(pkg);
    } catch (e) {
    }
    try {
      const pluginDir = "./src/plugins";
      const items = await fs.readdir(pluginDir);
      for (const it of items.sort()) {
        try {
          const p = path.join(pluginDir, it);
          const d = await fs.readFile(p);
          hash.update(d);
        } catch (e) {
        }
      }
    } catch (e) {
    }
    const relevant = [process.env.NODE_ENV || "", process.env.TOOL_VERSION || ""];
    hash.update(relevant.join("|"));
    return hash.digest("hex");
  }
  async has(key) {
    const p = path.join(this.dir, key + ".json");
    try {
      await fs.access(p);
      return true;
    } catch (e) {
      const remote = process.env.REMOTE_CACHE_URL;
      if (remote && globalFetch) {
        try {
          const headers = {};
          if (process.env.REMOTE_CACHE_TOKEN)
            headers["authorization"] = `Bearer ${process.env.REMOTE_CACHE_TOKEN}`;
          const res = await globalFetch(`${remote}/manifest/${key}`, { headers });
          return res.status === 200;
        } catch (e2) {
          return false;
        }
      }
      return false;
    }
  }
  async get(key) {
    const p = path.join(this.dir, key + ".json");
    try {
      const raw = await fs.readFile(p, "utf-8");
      return JSON.parse(raw);
    } catch (e) {
      const remote = process.env.REMOTE_CACHE_URL;
      if (!remote || !globalFetch)
        return null;
      try {
        const headers = {};
        if (process.env.REMOTE_CACHE_TOKEN)
          headers["authorization"] = `Bearer ${process.env.REMOTE_CACHE_TOKEN}`;
        const res = await globalFetch(`${remote}/manifest/${key}`, { headers });
        if (res.status !== 200)
          return null;
        const data = await res.text();
        const entry = JSON.parse(data);
        await this.put(entry);
        await this.putFiles(key, entry.files);
        return entry;
      } catch (e2) {
        return null;
      }
    }
  }
  async put(entry) {
    const p = path.join(this.dir, entry.key + ".json");
    await fs.writeFile(p, JSON.stringify(entry, null, 2));
  }
  // store output files into cache directory under the key
  async putFiles(key, files) {
    const keyDir = path.join(this.dir, key);
    await fs.mkdir(keyDir, { recursive: true });
    const outDir = path.join(keyDir, "files");
    await fs.mkdir(outDir, { recursive: true });
    for (const f of files) {
      try {
        const data = await fs.readFile(f);
        const rel = path.basename(f);
        await fs.writeFile(path.join(outDir, rel), data);
        const remote = process.env.REMOTE_CACHE_URL;
        if (remote && globalFetch) {
          try {
            const headers = {};
            if (process.env.REMOTE_CACHE_TOKEN)
              headers["authorization"] = `Bearer ${process.env.REMOTE_CACHE_TOKEN}`;
            await globalFetch(`${remote}/file/${key}/${rel}`, { method: "PUT", body: data, headers });
          } catch (e) {
          }
        }
      } catch (e) {
      }
    }
  }
  // restore cached files into target outDir
  async restoreFiles(key, targetOutDir) {
    const keyDir = path.join(this.dir, key, "files");
    try {
      const items = await fs.readdir(keyDir);
      await fs.mkdir(targetOutDir, { recursive: true });
      for (const name of items) {
        const src = path.join(keyDir, name);
        const dest = path.join(targetOutDir, name);
        const data = await fs.readFile(src);
        await fs.writeFile(dest, data);
      }
      return true;
    } catch (e) {
      const remote = process.env.REMOTE_CACHE_URL;
      if (!remote || !globalFetch)
        return false;
      try {
        await fs.mkdir(targetOutDir, { recursive: true });
        const headers = {};
        if (process.env.REMOTE_CACHE_TOKEN)
          headers["authorization"] = `Bearer ${process.env.REMOTE_CACHE_TOKEN}`;
        const manifestRes = await globalFetch(`${remote}/manifest/${key}`, { headers });
        if (manifestRes.status !== 200)
          return false;
        const entry = await manifestRes.json();
        for (const f of entry.files) {
          const name = path.basename(f);
          const fileRes = await globalFetch(`${remote}/file/${key}/${name}`, { headers });
          if (fileRes.status === 200) {
            const buf = await fileRes.arrayBuffer();
            await fs.writeFile(path.join(targetOutDir, name), Buffer.from(buf));
          }
        }
        return true;
      } catch (ee) {
        return false;
      }
    }
  }
};

// src/plugins/esbuildAdapter.ts
import path2 from "path";
import fs2 from "fs/promises";
function createEsbuildPlugin(pm) {
  return {
    name: "urja-adapter",
    setup(build2) {
      build2.onLoad({ filter: /.*/ }, async (args) => {
        if (args.path.includes("node_modules"))
          return;
        const ext = path2.extname(args.path);
        if (![".ts", ".tsx", ".js", ".jsx", ".mjs"].includes(ext))
          return;
        let raw = await fs2.readFile(args.path, "utf-8");
        const transformed = await pm.transform(raw, args.path);
        return {
          contents: transformed,
          loader: ext.slice(1)
        };
      });
    }
  };
}

// src/plugins/assets.ts
import path3 from "path";
import fs3 from "fs/promises";

// src/native/index.ts
import { createRequire } from "module";
var nodeRequire = createRequire(import.meta.url);
var nativeModule = null;
function loadNative() {
  if (!nativeModule) {
    try {
      nativeModule = nodeRequire("../../urja_native.node");
    } catch (e) {
      throw new Error(`Failed to load Rust native worker: ${e}`);
    }
  }
  return nativeModule;
}
var RustNativeWorker = class {
  constructor(poolSize = 4) {
    const native = loadNative();
    this.worker = new native.NativeWorker(poolSize);
  }
  /**
   * Synchronously transform code
   */
  transformSync(code, id) {
    return this.worker.transformSync(code, id);
  }
  /**
   * Asynchronously transform code
   */
  async transform(code, id) {
    return this.worker.transform(code, id);
  }
  /**
   * Get the pool size
   */
  get poolSize() {
    return this.worker.poolSize;
  }
  /**
   * Process asset and return content hash
   */
  processAsset(content) {
    return this.worker.processAsset(content);
  }
};

// src/plugins/assets.ts
var AssetPlugin = class {
  constructor(outDir = "build_output") {
    this.name = "asset-plugin";
    this.worker = new RustNativeWorker(4);
    this.outDir = outDir;
  }
  setup(build2) {
    build2.onResolve({ filter: /\.(png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|otf)$/ }, (args) => {
      return {
        path: path3.resolve(args.resolveDir, args.path),
        namespace: "asset-ns"
      };
    });
    build2.onLoad({ filter: /.*/, namespace: "asset-ns" }, async (args) => {
      const content = await fs3.readFile(args.path);
      const hash = this.worker.processAsset(content);
      const ext = path3.extname(args.path);
      const name = path3.basename(args.path, ext);
      const hashedName = `${name}.${hash.slice(0, 8)}${ext}`;
      const assetsDir = path3.join(this.outDir, "assets");
      await fs3.mkdir(assetsDir, { recursive: true });
      const outputPath = path3.join(assetsDir, hashedName);
      await fs3.writeFile(outputPath, content);
      return {
        contents: `export default "/assets/${hashedName}";`,
        loader: "js"
      };
    });
  }
};

// src/plugins/css-in-js.ts
var CssInJsPlugin = class {
  constructor() {
    this.name = "css-in-js-plugin";
  }
  setup(build2) {
    build2.onResolve({ filter: /^@emotion\/(react|styled|css)$/ }, (args) => {
      return {
        path: args.path,
        external: false
        // Ensure it's bundled
      };
    });
    build2.onResolve({ filter: /^styled-components$/ }, (args) => {
      return {
        path: args.path,
        external: false
      };
    });
  }
};

// src/core/steps.ts
var ResolverStep = class {
  constructor() {
    this.name = "Resolver";
  }
  async run(ctx) {
    const { config } = ctx;
    ctx.entryPoints = {};
    config.entry.forEach((e, i) => {
      ctx.entryPoints["entry" + i] = path4.resolve(config.root, e);
    });
    if (Object.keys(ctx.entryPoints).length === 0) {
      throw new Error("No entry points found");
    }
  }
};
var TransformerStep = class {
  constructor() {
    this.name = "Transformer";
  }
  async run(ctx) {
  }
};
var BundlerStep = class {
  constructor() {
    this.name = "Bundler";
  }
  async run(ctx) {
    const { config, entryPoints, pluginManager } = ctx;
    const cache = new DiskCache(config.root);
    await cache.ensure();
    const key = await cache.keyFromFiles(Object.values(entryPoints));
    ctx.cacheKey = key;
    ctx.cache = cache;
    if (await cache.has(key)) {
      log.info("Cache hit, skipping build...");
      ctx.cacheHit = true;
      return;
    }
    const outdir = path4.resolve(config.root, config.outDir);
    const internalPlugins = [
      createEsbuildPlugin(pluginManager),
      {
        name: "asset-plugin-adapter",
        setup(build2) {
          new AssetPlugin(outdir).setup(build2);
        }
      },
      {
        name: "css-in-js-plugin-adapter",
        setup(build2) {
          new CssInJsPlugin().setup(build2);
        }
      }
    ];
    const result = await esbuild.build({
      entryPoints,
      bundle: true,
      splitting: true,
      // ESM requires splitting
      format: "esm",
      outdir: path4.resolve(config.root, config.outDir),
      minify: config.mode === "production",
      sourcemap: config.mode !== "production",
      target: ["es2020"],
      loader: { ".css": "css" },
      // Remove default file loaders for images as our plugin handles them
      metafile: true,
      logLevel: "info",
      plugins: [
        ...internalPlugins,
        ...config.esbuildPlugins || []
      ]
    });
  }
};
var OptimizerStep = class {
  constructor() {
    this.name = "Optimizer";
  }
  async run(ctx) {
    if (ctx.config.mode === "production") {
    }
  }
};
var OutputterStep = class {
  constructor() {
    this.name = "Outputter";
  }
  async run(ctx) {
    const { config } = ctx;
    const cache = ctx.cache;
    const key = ctx.cacheKey;
    const isCacheHit = ctx.cacheHit;
    const outdir = path4.resolve(config.root, config.outDir);
    if (isCacheHit) {
      log.info("Restoring artifacts from cache...");
      await cache.restoreFiles(key, outdir);
    } else {
      try {
        const files = (await fs4.readdir(outdir)).map((f) => path4.join(outdir, f));
        await cache.put({ key, outDir: outdir, files, created: Date.now() });
        await cache.putFiles(key, files);
        log.info("Cached build artifacts");
      } catch (e) {
        log.warn("Failed to cache build artifacts", e);
      }
    }
  }
};

// src/build/bundler.ts
async function build(cfg) {
  const pipeline = new BuildPipeline(cfg);
  pipeline.addStep(new ResolverStep()).addStep(new TransformerStep()).addStep(new BundlerStep()).addStep(new OptimizerStep()).addStep(new OutputterStep());
  await pipeline.execute();
}

// tests/asset_test.ts
import path5 from "path";
import fs5 from "fs/promises";
import assert from "assert";
async function testAssetPipeline() {
  console.log("Running Asset Pipeline Test...");
  const cwd = process.cwd();
  const testDir = path5.join(cwd, "test_assets_temp");
  try {
    await fs5.mkdir(path5.join(testDir, "src"), { recursive: true });
    await fs5.mkdir(path5.join(testDir, "public"), { recursive: true });
    const redPixelPng = Buffer.from([
      137,
      80,
      78,
      71,
      13,
      10,
      26,
      10,
      0,
      0,
      0,
      13,
      73,
      72,
      68,
      82,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      8,
      2,
      0,
      0,
      0,
      144,
      119,
      83,
      222,
      0,
      0,
      0,
      12,
      73,
      68,
      65,
      84,
      8,
      215,
      99,
      248,
      207,
      192,
      0,
      0,
      3,
      1,
      1,
      0,
      24,
      221,
      141,
      180,
      0,
      0,
      0,
      0,
      73,
      69,
      78,
      68,
      174,
      66,
      96,
      130
    ]);
    await fs5.writeFile(path5.join(testDir, "src", "test.png"), redPixelPng);
    const entryContent = `
import logo from './test.png';
console.log('Logo path:', logo);
export default logo;
`;
    await fs5.writeFile(path5.join(testDir, "src", "main.js"), entryContent);
    await fs5.writeFile(path5.join(testDir, "public", "index.html"), "<html><body>Test</body></html>");
    const config = {
      root: testDir,
      entry: ["src/main.js"],
      mode: "development",
      outDir: "dist",
      port: 3e3
    };
    await build(config);
    const distDir = path5.join(testDir, "dist");
    const assetsDir = path5.join(distDir, "assets");
    const assetsDirExists = await fs5.access(assetsDir).then(() => true).catch(() => false);
    assert(assetsDirExists, "Assets directory should exist");
    const assetFiles = await fs5.readdir(assetsDir);
    const pngFiles = assetFiles.filter((f) => f.endsWith(".png"));
    assert(pngFiles.length > 0, "Should have at least one PNG file");
    assert(pngFiles[0].includes("."), "PNG filename should include hash");
    const jsFiles = await fs5.readdir(distDir);
    const bundleFiles = jsFiles.filter((f) => f.endsWith(".js"));
    assert(bundleFiles.length > 0, "Should have at least one JS bundle");
    const bundleContent = await fs5.readFile(path5.join(distDir, bundleFiles[0]), "utf-8");
    assert(bundleContent.includes("/assets/"), "Bundle should reference assets directory");
    console.log("\u2713 Asset Pipeline Test Passed!");
    console.log(`  - Created hashed asset: ${pngFiles[0]}`);
    console.log(`  - Bundle references: /assets/`);
  } catch (error) {
    console.error("\u2717 Asset Pipeline Test Failed:", error);
    throw error;
  } finally {
    await fs5.rm(testDir, { recursive: true, force: true });
  }
}
testAssetPipeline();
