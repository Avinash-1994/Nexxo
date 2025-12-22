#!/bin/bash

# Create Real-World Meta-Framework Test Projects
# This script creates actual Next.js, Nuxt, and Remix projects for testing

set -e

echo "🚀 Creating Real-World Meta-Framework Test Projects..."

# ==================== NEXT.JS PROJECT ====================
echo ""
echo "📦 Creating Next.js 14 Test Project..."

mkdir -p examples/nextjs-test/{pages,app,public}
cd examples/nextjs-test

# Create package.json
cat > package.json << 'EOF'
{
  "name": "nextjs-test",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "node ../../dist/cli.js dev",
    "build": "node ../../dist/cli.js build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
EOF

# Pages Router - Index
mkdir -p pages
cat > pages/index.tsx << 'EOF'
export default function Home() {
  return (
    <div>
      <h1>Next.js Pages Router - Home</h1>
      <p>Testing file-based routing with Urja</p>
    </div>
  );
}
EOF

# Pages Router - About
cat > pages/about.tsx << 'EOF'
export default function About() {
  return (
    <div>
      <h1>About Page</h1>
      <p>Static route: /about</p>
    </div>
  );
}
EOF

# Pages Router - Dynamic Route
mkdir -p pages/blog
cat > pages/blog/[slug].tsx << 'EOF'
export default function BlogPost({ params }: any) {
  return (
    <div>
      <h1>Blog Post</h1>
      <p>Dynamic route: /blog/[slug]</p>
    </div>
  );
}
EOF

# Pages Router - Catch-all
mkdir -p pages/docs
cat > pages/docs/[...slug].tsx << 'EOF'
export default function Docs({ params }: any) {
  return (
    <div>
      <h1>Documentation</h1>
      <p>Catch-all route: /docs/[...slug]</p>
    </div>
  );
}
EOF

# Pages Router - API Route
mkdir -p pages/api
cat > pages/api/hello.ts << 'EOF'
export default function handler(req: any, res: any) {
  res.status(200).json({ message: 'Hello from API' });
}
EOF

# App Router - Root Layout
mkdir -p app
cat > app/layout.tsx << 'EOF'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
EOF

# App Router - Home Page
cat > app/page.tsx << 'EOF'
export default function AppHome() {
  return (
    <div>
      <h1>Next.js App Router - Home</h1>
      <p>Testing App Router with Urja</p>
    </div>
  );
}
EOF

# App Router - Dynamic Route
mkdir -p app/products/[id]
cat > app/products/[id]/page.tsx << 'EOF'
export default function Product({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Product {params.id}</h1>
      <p>App Router dynamic route</p>
    </div>
  );
}
EOF

# App Router - Route Group
mkdir -p "app/(marketing)/features"
cat > "app/(marketing)/features/page.tsx" << 'EOF'
export default function Features() {
  return (
    <div>
      <h1>Features</h1>
      <p>Route group: (marketing) - ignored in URL</p>
    </div>
  );
}
EOF

cd ../..

echo "✅ Next.js project created!"

# ==================== NUXT 3 PROJECT ====================
echo ""
echo "📦 Creating Nuxt 3 Test Project..."

mkdir -p examples/nuxt-test/pages
cd examples/nuxt-test

# Create package.json
cat > package.json << 'EOF'
{
  "name": "nuxt-test",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "node ../../dist/cli.js dev",
    "build": "node ../../dist/cli.js build"
  },
  "dependencies": {
    "nuxt": "^3.8.0",
    "vue": "^3.3.0"
  }
}
EOF

# Nuxt - Index Page
cat > pages/index.vue << 'EOF'
<template>
  <div>
    <h1>Nuxt 3 - Home</h1>
    <p>Testing auto-routing with Urja</p>
  </div>
</template>
EOF

# Nuxt - About Page
cat > pages/about.vue << 'EOF'
<template>
  <div>
    <h1>About</h1>
    <p>Static route: /about</p>
  </div>
</template>
EOF

# Nuxt - Dynamic Route
mkdir -p pages/users
cat > pages/users/[id].vue << 'EOF'
<template>
  <div>
    <h1>User Profile</h1>
    <p>Dynamic route: /users/[id]</p>
  </div>
</template>
EOF

# Nuxt - Nested Route
mkdir -p pages/blog
cat > pages/blog/index.vue << 'EOF'
<template>
  <div>
    <h1>Blog</h1>
    <p>Blog index: /blog</p>
  </div>
</template>
EOF

cat > pages/blog/[slug].vue << 'EOF'
<template>
  <div>
    <h1>Blog Post</h1>
    <p>Dynamic route: /blog/[slug]</p>
  </div>
</template>
EOF

# Nuxt - Catch-all
cat > pages/[...slug].vue << 'EOF'
<template>
  <div>
    <h1>Catch-all Page</h1>
    <p>Matches any unmatched route</p>
  </div>
</template>
EOF

cd ../..

echo "✅ Nuxt project created!"

# ==================== REMIX PROJECT ====================
echo ""
echo "📦 Creating Remix Test Project..."

mkdir -p examples/remix-test/app/routes
cd examples/remix-test

# Create package.json
cat > package.json << 'EOF'
{
  "name": "remix-test",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "node ../../dist/cli.js dev",
    "build": "node ../../dist/cli.js build"
  },
  "dependencies": {
    "@remix-run/react": "^2.3.0",
    "@remix-run/node": "^2.3.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
EOF

# Remix - Root
cat > app/root.tsx << 'EOF'
import { Outlet } from '@remix-run/react';

export default function Root() {
  return (
    <html>
      <body>
        <Outlet />
      </body>
    </html>
  );
}
EOF

# Remix - Index Route
cat > app/routes/_index.tsx << 'EOF'
export default function Index() {
  return (
    <div>
      <h1>Remix - Home</h1>
      <p>Testing nested routing with Urja</p>
    </div>
  );
}
EOF

# Remix - About Route
cat > app/routes/about.tsx << 'EOF'
export default function About() {
  return (
    <div>
      <h1>About</h1>
      <p>Static route: /about</p>
    </div>
  );
}
EOF

# Remix - Nested Route (dot notation)
cat > app/routes/dashboard.settings.tsx << 'EOF'
export default function DashboardSettings() {
  return (
    <div>
      <h1>Dashboard Settings</h1>
      <p>Nested route: /dashboard/settings</p>
    </div>
  );
}
EOF

# Remix - Dynamic Route
cat > app/routes/posts.$slug.tsx << 'EOF'
export default function Post() {
  return (
    <div>
      <h1>Blog Post</h1>
      <p>Dynamic route: /posts/$slug</p>
    </div>
  );
}
EOF

# Remix - Pathless Layout
cat > app/routes/__layout.tsx << 'EOF'
import { Outlet } from '@remix-run/react';

export default function Layout() {
  return (
    <div>
      <nav>Pathless Layout</nav>
      <Outlet />
    </div>
  );
}
EOF

# Remix - Splat Route
cat > app/routes/$.tsx << 'EOF'
export default function SplatRoute() {
  return (
    <div>
      <h1>404 - Not Found</h1>
      <p>Splat route catches all unmatched paths</p>
    </div>
  );
}
EOF

cd ../..

echo "✅ Remix project created!"

# ==================== SUMMARY ====================
echo ""
echo "🎉 All meta-framework test projects created successfully!"
echo ""
echo "📁 Project Structure:"
echo "  - examples/nextjs-test (Pages Router + App Router)"
echo "  - examples/nuxt-test (Auto-routing)"
echo "  - examples/remix-test (Nested routing)"
echo ""
echo "🧪 To test routing:"
echo "  cd examples/nextjs-test && npm install && npm run build"
echo "  cd examples/nuxt-test && npm install && npm run build"
echo "  cd examples/remix-test && npm install && npm run build"
echo ""
echo "✅ Ready for real-world routing validation!"
