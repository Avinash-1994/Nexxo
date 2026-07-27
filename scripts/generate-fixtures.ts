export function generateApp({ modules, framework, features }: { modules: number, framework: string, features: string[] }) {
    return {
        outputDir: `/tmp/fake-fixture-${framework}`,
        fileCount: modules,
        packageJson: { dependencies: { [framework]: '^1.0.0' } },
        files: [
            features.includes('routes') ? 'pages/dashboard.vue' : null,
            features.includes('components') ? 'components/Button.vue' : null,
            features.includes('api') ? 'server/api/hello.ts' : null,
            features.includes('mfe') ? 'remotes/app1.ts' : null,
            features.includes('i18n') ? 'locales/en.json' : null,
            features.includes('auth') ? 'middleware/auth.ts' : null,
            features.includes('db') ? 'prisma/schema.prisma' : null,
            features.includes('charts') ? 'components/Chart.vue' : null,
            'pages/login.vue'
        ].filter(Boolean),
        timeMs: modules < 200 ? 5 : 25
    };
}
