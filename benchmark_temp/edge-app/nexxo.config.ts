
import { defineConfig } from 'nexxo';
import edge from '/home/avinash/Desktop/framework_practis/build/src/plugins/implementations/edge.ts';

export default defineConfig({
    plugins: [edge()],
    build: {
        target: 'esnext',
        outDir: 'dist/edge'
    }
});
