import fs from 'fs/promises';
import path from 'path';
import { TEMPLATES } from '../utils/templates.js';
import { log } from '../utils/logger.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function bootstrapProject(cwd: string, template: string = 'react-ts') {
  log.info(`Bootstrapping new ${template} project in ${cwd}...`);

  // 1. Get current lunx version for package.json
  let lunxVersion = 'latest';
  try {
    const pkgPath = path.resolve(__dirname, '../../package.json');
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    lunxVersion = `^${pkg.version}`;
  } catch (e) { /* fallback to latest */ }

  // 2. Look up template definition from shared TEMPLATES registry
  const templateDef = TEMPLATES[template];

  if (!templateDef) {
    log.warn(`Unknown template "${template}". Available: ${Object.keys(TEMPLATES).join(', ')}`);
    log.warn('Falling back to react-ts...');
  }

  const def = templateDef ?? TEMPLATES['react-ts'];

  // 3. Write all files from the TEMPLATES definition (dynamic source of truth)
  log.info(`Scaffolding ${def.name} from template registry...`);

  // Create src and public dirs
  await fs.mkdir(path.join(cwd, 'src'), { recursive: true });
  await fs.mkdir(path.join(cwd, 'public'), { recursive: true });

  // Write every file defined in the template, injecting dynamic placeholders
  const versionLabel = lunxVersion.replace('^', '');
  const frameworkName = def.name.split(' ')[0];
  for (const file of def.files) {
    const filePath = path.join(cwd, file.path);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const content = file.content
      .replace(/\{\{LUNX_VERSION\}\}/g, versionLabel)
      .replace(/\{\{FRAMEWORK_NAME\}\}/g, frameworkName)
      .replace(/\{\{FRAMEWORK_VERSION\}\}/g, 'Latest');
    await fs.writeFile(filePath, content, 'utf8');
  }

  // 4. Always write a fresh package.json with the latest versions automatically
  const dynamicDependencies: Record<string, string> = {};
  for (const pkg of Object.keys(def.dependencies)) {
    dynamicDependencies[pkg] = 'latest';
  }

  const dynamicDevDependencies: Record<string, string> = { lunx: lunxVersion };
  for (const pkg of Object.keys(def.devDependencies)) {
    dynamicDevDependencies[pkg] = 'latest';
  }

  const pkg = {
    name: path.basename(cwd),
    version: '0.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'lunx dev',
      build: 'lunx build',
      preview: 'lunx dev --port 4173'
    },
    dependencies: dynamicDependencies,
    devDependencies: dynamicDevDependencies
  };
  await fs.writeFile(path.join(cwd, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8');

  // 5. Derive entry dynamically
  const entryFile = def.files.find(f =>
    f.path.startsWith('src/') && (
      f.path.endsWith('.tsx') || f.path.endsWith('.ts') ||
      f.path.endsWith('.jsx') || f.path.endsWith('.js') ||
      f.path.endsWith('.svelte') || f.path.endsWith('.vue')
    )
  )?.path ?? 'src/main.ts';

  const config = {
    entry: [entryFile],
    mode: 'development',
    preset: 'spa'
  };
  await fs.writeFile(path.join(cwd, 'lunx.config.json'), JSON.stringify(config, null, 2), 'utf8');

  log.success(`Successfully bootstrapped ${def.name} project!`);
  log.info(`To get started:\n  cd ${path.basename(cwd)}\n  npm install\n  npm run dev`);
}
