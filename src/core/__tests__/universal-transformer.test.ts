import { UniversalTransformer } from '../universal-transformer.js';
import path from 'path';

describe('UniversalTransformer', () => {
    let transformer: UniversalTransformer;
    const root = process.cwd();

    beforeEach(() => {
        transformer = new UniversalTransformer(root);
    });

    it('transforms vanilla TS files', async () => {
        const input = `const x: number = 42; export default x;`;
        const filePath = path.join(root, 'test.ts');

        const result = await transformer.transform({ code: input, filePath, framework: 'vanilla', root });

        expect(result.code).toContain('const x = 42'); // Target is ES2020, so const is preserved
        expect(result.code).not.toContain(': number'); // Type assertion should be removed
        expect(result.code).toContain('default');
    });

    it('transforms React JSX files', async () => {
        const input = `import React from 'react'; export const C = () => <div>Hello</div>;`;
        const filePath = path.join(root, 'test.tsx');

        // We assume babel/esbuild is working
        const result = await transformer.transform({ code: input, filePath, framework: 'react', root });

        // We accept either Classic (React.createElement) or Automatic (_jsx) runtime
        const isClassic = result.code.includes('React.createElement("div"');
        const isAutomatic = result.code.includes('react/jsx-runtime') || result.code.includes('_jsx');

        expect(isClassic || isAutomatic).toBe(true);
    });
});
