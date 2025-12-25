
import { CSSImportPrecedenceResolver } from '../src/resolve/css-precedence.js';
import { GraphEdge } from '../src/resolve/graph.js';

async function testCSSPrecedence() {
    console.log("🧪 Testing CSS Import Precedence Resolver...");

    const resolver = new CSSImportPrecedenceResolver();

    const edges: GraphEdge[] = [
        {
            from: 'main',
            to: 'utilities.css',
            kind: 'css-import',
            metadata: { precedence: { specificity: 0, sourceOrder: 3, cascadeLayer: 'utilities' } }
        },
        {
            from: 'main',
            to: 'base.css',
            kind: 'css-import',
            metadata: { precedence: { specificity: 0, sourceOrder: 1, cascadeLayer: 'base' } }
        },
        {
            from: 'main',
            to: 'button.css',
            kind: 'css-import',
            metadata: { precedence: { specificity: 10, sourceOrder: 2, cascadeLayer: 'components' } }
        }
    ];

    const resolved = resolver.resolve(edges, new Map());

    const order = resolved.map(e => e.to);
    console.log("Resolved Order:", order);

    const expectedOrder = ['base.css', 'button.css', 'utilities.css'];

    if (JSON.stringify(order) === JSON.stringify(expectedOrder)) {
        console.log("✅ Precedence Test Passed (Base < Components < Utilities)");
    } else {
        console.error("❌ Precedence Test Failed!");
        process.exit(1);
    }
}

testCSSPrecedence();
