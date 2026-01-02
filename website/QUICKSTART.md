# Urja Website - Quick Start Guide

## Running the Website

The Urja documentation website is built using Urja itself. Here's how to run it:

### Development Mode

```bash
cd website/
npx urja dev
```

The dev server will start at `http://localhost:5174` (configured port in `urja.config.js`)

### Production Build

```bash
cd website/
npx urja build
```

The production bundle will be generated in the `dist/` directory.

### Available Commands

| Command | Description |
|---------|-------------|
| `npx urja dev` | Start development server with HMR |
| `npx urja build` | Build for production |
| `npx urja audit --url http://localhost:5174` | Run quality audits (SEO, A11y, Performance) |

### Configuration

The website uses the following configuration (`urja.config.js`):

- **Framework**: React with TypeScript
- **CSS**: Tailwind CSS
- **Port**: 5174
- **Preset**: SPA (Single Page Application)
- **Pre-bundled Dependencies**: react, react-dom, lucide-react

### Project Structure

```
website/
├── src/
│   ├── components/     # Reusable components (Layout, Theme, etc.)
│   ├── pages/          # Page components (Home, Docs, Guides, etc.)
│   ├── styles/         # Global styles and theme
│   └── main.tsx        # Application entry point
├── public/
│   ├── index.html      # HTML template
│   └── service-worker.js  # PWA offline support
├── urja.config.js      # Urja build configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Dependencies
```

### Features

- ✅ **Dark/Light Theme** - Persistent theme switching
- ✅ **Offline Support** - PWA with service worker caching
- ✅ **Multi-language** - English and Hindi (i18n)
- ✅ **Interactive Game** - Dependency Defender mini-game
- ✅ **Quality Audits** - Automated SEO, A11y, and Performance checks
- ✅ **Responsive Design** - Mobile-first approach

### Troubleshooting

**Port already in use?**
```bash
# Kill the process using port 5174
lsof -ti:5174 | xargs kill -9

# Or change the port in urja.config.js
```

**Build errors?**
```bash
# Clear cache and rebuild
rm -rf .urja_cache dist
npx urja build
```

**Dependencies not found?**
```bash
# Reinstall dependencies
npm install
```

### Development Tips

- Use `DEBUG=true npx urja dev` to see detailed logs
- The audit report runs automatically after every build
- HMR (Hot Module Replacement) preserves React component state
- The game high score is stored in localStorage
