/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                accent: {
                    primary: '#3B82F6',
                    secondary: '#10B981',
                },
                surface: {
                    light: '#FFFFFF',
                    dark: '#0F172A',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
                display: ['Space Grotesk', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
