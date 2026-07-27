#!/bin/bash
# Start all framework test projects one by one on fixed ports
TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_PORT=5010

declare -A PROJECTS=(
  ["test-alpine"]=5010
  ["test-analog"]=5011
  ["test-angular"]=5012
  ["test-astro"]=5013
  ["test-electron"]=5014
  ["test-lit"]=5015
  ["test-module-federation"]=5016
  ["test-nextjs-pages"]=5017
  ["test-nuxt"]=5018
  ["test-preact"]=5019
  ["test-qwik"]=5020
  ["test-react"]=5021
  ["test-react-router-v7"]=5022
  ["test-remix"]=5023
  ["test-solid"]=5024
  ["test-solidstart"]=5025
  ["test-svelte"]=5026
  ["test-sveltekit"]=5027
  ["test-tanstack-start"]=5028
  ["test-tauri"]=5029
  ["test-vanilla"]=5030
  ["test-vitepress"]=5031
  ["test-vue"]=5032
  ["test-waku"]=5033
)

echo "⚡ Starting all Lunx framework test projects..."
echo ""

for project in "${!PROJECTS[@]}"; do
  port="${PROJECTS[$project]}"
  dir="$TESTS_DIR/$project"
  if [ -d "$dir" ]; then
    PORT=$port npm run dev --prefix "$dir" > /tmp/lunx-${project}.log 2>&1 &
    echo "  ✓ $project → http://localhost:$port"
  fi
done

echo ""
echo "🕐 Waiting 5 seconds for servers to start..."
sleep 5
echo "✅ All servers started!"
echo ""
echo "URLs:"
for project in $(echo "${!PROJECTS[@]}" | tr ' ' '\n' | sort); do
  port="${PROJECTS[$project]}"
  echo "  http://localhost:$port  ($project)"
done
