import path from 'path';
import fs from 'fs/promises';

export type ModuleNode = {
  id: string;
  filePath: string;
  deps: Set<string>;
};

export class DependencyGraph {
  nodes = new Map<string, ModuleNode>();

  async addEntry(entry: string) {
    const abs = path.resolve(entry);
    await this._crawl(abs);
  }

  private async _crawl(filePath: string) {
    if (this.nodes.has(filePath)) return;
    let content = '';
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch (e) {
      return;
    }

    const deps = new Set<string>();

    // Use TypeScript AST to parse imports
    const ts = (await import('typescript')).default;
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    // Let's collect import paths first, then resolve them in parallel.
    const importsToResolve: string[] = [];
    const collect = (node: any) => {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          const dep = node.moduleSpecifier.text;
          if (dep.startsWith('.') || dep.startsWith('/')) {
            importsToResolve.push(path.resolve(path.dirname(filePath), dep));
          }
        }
      }
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const arg = node.arguments[0];
        if (ts.isStringLiteral(arg)) {
          const dep = arg.text;
          if (dep.startsWith('.') || dep.startsWith('/')) {
            importsToResolve.push(path.resolve(path.dirname(filePath), dep));
          }
        }
      }
      ts.forEachChild(node, collect);
    };
    collect(sourceFile);

    for (const p of importsToResolve) {
      const resolved = await this._resolve(p);
      if (resolved) {
        deps.add(resolved);
        await this._crawl(resolved);
      }
    }

    this.nodes.set(filePath, { id: filePath, filePath, deps });
  }

  private async _resolve(basePath: string): Promise<string | null> {
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
    for (const ext of extensions) {
      const p = basePath + ext;
      try {
        await fs.access(p);
        return p;
      } catch (e) { }
    }
    // Try index files
    for (const ext of extensions) {
      const p = path.join(basePath, 'index' + ext);
      try {
        await fs.access(p);
        return p;
      } catch (e) { }
    }
    return null;
  }
}
