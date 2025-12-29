// src/config/index.ts
import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import { z } from "zod";

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

// src/config/index.ts
var BuildConfigSchema = z.object({
  root: z.string().optional(),
  entry: z.array(z.string()).default(["src/main.tsx"]),
  mode: z.enum(["development", "production", "test"]).default("development"),
  outDir: z.string().default("build_output"),
  port: z.number().default(5173),
  plugins: z.array(z.any()).optional(),
  esbuildPlugins: z.array(z.any()).optional()
});
async function loadConfig(cwd) {
  const jsonPath = path.join(cwd, "urja.build.json");
  const yamlPath = path.join(cwd, "urja.build.yaml");
  const ymlPath = path.join(cwd, "urja.build.yml");
  const tsPath = path.join(cwd, "urja.build.ts");
  let rawConfig;
  try {
    if (await fs.access(jsonPath).then(() => true).catch(() => false)) {
      const raw = await fs.readFile(jsonPath, "utf-8");
      rawConfig = JSON.parse(raw);
    } else if (await fs.access(yamlPath).then(() => true).catch(() => false)) {
      const raw = await fs.readFile(yamlPath, "utf-8");
      rawConfig = yaml.load(raw);
    } else if (await fs.access(ymlPath).then(() => true).catch(() => false)) {
      const raw = await fs.readFile(ymlPath, "utf-8");
      rawConfig = yaml.load(raw);
    } else if (await fs.access(tsPath).then(() => true).catch(() => false)) {
      log.info("Loading TypeScript config...");
      const { build } = await import("esbuild");
      const outfile = path.join(cwd, "urja.build.temp.mjs");
      await build({
        entryPoints: [tsPath],
        outfile,
        bundle: true,
        platform: "node",
        format: "esm",
        target: "es2020",
        external: [
          "esbuild",
          "zod",
          "kleur",
          "svelte-preprocess",
          "svelte",
          "esbuild-svelte",
          "js-yaml",
          // svelte-preprocess optional deps
          "coffeescript",
          "pug",
          "stylus",
          "less",
          "postcss",
          "sass",
          "postcss-load-config",
          "sugarss"
        ]
        // exclude deps
      });
      try {
        const mod = await import(outfile);
        rawConfig = mod.default || mod;
      } finally {
        await fs.unlink(outfile).catch(() => {
        });
      }
    } else {
      return {
        root: cwd,
        entry: ["src/main.tsx"],
        mode: "development",
        outDir: "build_output",
        port: 5173
      };
    }
    const result = BuildConfigSchema.safeParse(rawConfig);
    if (!result.success) {
      log.error("Invalid config file:", result.error.format());
      process.exit(1);
    }
    const config = result.data;
    const root = config.root || cwd;
    return {
      ...config,
      root
    };
  } catch (e) {
    log.error("Failed to load config:", e.message);
    process.exit(1);
  }
}

// tests/config_test.ts
import fs2 from "fs/promises";
import path2 from "path";
import assert from "assert";
async function testYamlConfig() {
  console.log("Running YAML Config Test...");
  const cwd = process.cwd();
  const yamlPath = path2.join(cwd, "urja.build.yaml");
  const yamlContent = `
root: .
entry: 
  - src/main.tsx
mode: production
outDir: dist_yaml
port: 4000
`;
  try {
    await fs2.writeFile(yamlPath, yamlContent);
    const config = await loadConfig(cwd);
    assert.strictEqual(config.mode, "production");
    assert.strictEqual(config.port, 4e3);
    assert.strictEqual(config.outDir, "dist_yaml");
    console.log("YAML Config Test Passed!");
  } catch (error) {
    console.error("YAML Config Test Failed:", error);
    process.exit(1);
  } finally {
    await fs2.unlink(yamlPath).catch(() => {
    });
  }
}
testYamlConfig();
