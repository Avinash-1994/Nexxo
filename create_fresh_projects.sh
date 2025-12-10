#!/bin/bash

# Create fresh test projects for verification
BASE_DIR="examples/fresh"
rm -rf "$BASE_DIR"
mkdir -p "$BASE_DIR"

echo "🚀 Creating FRESH test projects..."

# Helper
create_project() {
    local name=$1
    local deps=$2
    local framework=$3
    
    local dir="$BASE_DIR/$name"
    mkdir -p "$dir/src"
    mkdir -p "$dir/public"
    
    # package.json
    cat > "$dir/package.json" << EOF
{
  "name": "$name",
  "version": "0.0.1",
  "type": "module",
  "dependencies": $deps
}
EOF

    # index.html
    local script="/src/main.js"
    if [[ "$framework" == "react" || "$framework" == "preact" ]]; then script="/src/main.jsx"; fi
    
    cat > "$dir/public/index.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$name - Urja</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="$script"></script>
</body>
</html>
EOF

    echo "Created $name ($framework)"
}

# 1. React
create_project "react-app" '{"react": "^18.2.0", "react-dom": "^18.2.0"}' "react"
cat > "$BASE_DIR/react-app/src/main.jsx" << 'EOF'
import { createRoot } from 'react-dom/client';
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>React Fresh Test</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
EOF

# 2. Vue
create_project "vue-app" '{"vue": "^3.3.0"}' "vue"
cat > "$BASE_DIR/vue-app/src/main.js" << 'EOF'
import { createApp, ref } from 'vue';

const App = {
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Vue Fresh Test</h1>
      <p>Count: {{ count }}</p>
      <button @click="count++">Increment</button>
    </div>
  `,
  setup() {
    const count = ref(0);
    return { count };
  }
};

createApp(App).mount('#root');
EOF

# 3. Preact
create_project "preact-app" '{"preact": "^10.19.0"}' "preact"
cat > "$BASE_DIR/preact-app/src/main.jsx" << 'EOF'
import { render } from 'preact';
import { useState } from 'preact/hooks';

function App() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Preact Fresh Test</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

render(<App />, document.getElementById('root'));
EOF

# 4. Svelte
create_project "svelte-app" '{"svelte": "^4.0.0"}' "svelte"
cat > "$BASE_DIR/svelte-app/src/main.js" << 'EOF'
import App from './App.svelte';
const app = new App({ target: document.getElementById('root') });
export default app;
EOF

cat > "$BASE_DIR/svelte-app/src/App.svelte" << 'EOF'
<script>
  let count = 0;
</script>

<div style="padding: 20px; font-family: sans-serif;">
  <h1>Svelte Fresh Test</h1>
  <p>Count: {count}</p>
  <button on:click={() => count++}>Increment</button>
</div>
EOF

echo "Installing dependencies..."
# Use a loop to install
for dir in react-app vue-app preact-app svelte-app; do
    echo "Installing for $dir..."
    cd "$BASE_DIR/$dir" && npm install --silent && cd - > /dev/null
done

echo "Done!"
