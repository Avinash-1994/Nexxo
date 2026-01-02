# Urja Documentation Website

The official documentation website for Urja - The Honest Build System.

## 🚀 Quick Start

```bash
# Navigate to website directory
cd website/

# Start development server
npx urja dev
```

Visit `http://localhost:5174` to view the website.

## 📦 Available Commands

| Command | Description |
|---------|-------------|
| `npx urja dev` | Start development server with HMR |
| `npx urja build` | Build for production |
| `npx urja audit --url http://localhost:5174` | Run quality audits |

## 🎯 Features

- **Comprehensive Documentation** - Installation, guides, and API reference
- **Framework Guides** - React, Vue, Angular, Solid, Svelte, and more
- **MFE Architecture** - Micro-frontend patterns and best practices
- **Quality Audits** - Built-in SEO, Accessibility, and Performance checks
- **Interactive Game** - "Dependency Defender" mini-game
- **Dark/Light Theme** - Persistent theme switching
- **Offline Support** - PWA with service worker
- **Multi-language** - English and Hindi (i18n)

## 🛠️ Tech Stack

- **Build Tool**: Urja (dogfooding our own tool!)
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: Hash-based routing

## 📁 Project Structure

```
website/
├── src/
│   ├── components/     # Reusable components
│   │   ├── Layout.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── I18nContext.tsx
│   │   └── BackgroundAnimation.tsx
│   ├── pages/          # Page components
│   │   ├── Home.tsx
│   │   ├── Docs.tsx
│   │   ├── CoreConcepts.tsx
│   │   ├── FrameworkGuides.tsx
│   │   ├── MicroFrontends.tsx
│   │   ├── QualityGuide.tsx
│   │   └── Play.tsx
│   ├── styles/         # Global styles
│   └── main.tsx        # Entry point
├── public/
│   ├── index.html
│   └── service-worker.js
├── urja.config.js      # Urja configuration
├── tailwind.config.js  # Tailwind configuration
└── package.json
```

## 🔧 Configuration

The website is configured via `urja.config.js`:

```javascript
module.exports = {
    adapter: 'react-adapter',
    entry: ['src/main.tsx'],
    preset: 'spa',
    port: 5174,
    css: {
        framework: 'tailwind'
    },
    prebundle: {
        include: ['react', 'react-dom', 'lucide-react']
    }
};
```

## 🐛 Troubleshooting

**Port already in use?**
```bash
lsof -ti:5174 | xargs kill -9
```

**Clear cache and rebuild:**
```bash
rm -rf .urja_cache dist
npx urja build
```

**Enable debug logging:**
```bash
DEBUG=true npx urja dev
```

## 📝 Development

The website automatically:
- Runs quality audits after each build
- Provides HMR for instant updates
- Validates accessibility and SEO
- Caches assets for offline use

## 📄 License

MIT License - See main Urja repository for details.

## 🔗 Links

- [Main Repository](https://github.com/avinash-1994/urja)
- [Documentation](http://localhost:5174)
- [Report Issues](https://github.com/avinash-1994/urja/issues)
