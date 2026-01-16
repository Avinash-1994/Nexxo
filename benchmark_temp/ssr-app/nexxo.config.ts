
import { defineConfig } from 'nexxo';
import react from '/home/avinash/Desktop/framework_practis/build/src/plugins/implementations/react.ts';

export default defineConfig({
    plugins: [react()],
    build: {
        minify: false // For ease of debugging SSR locally
    }
});
