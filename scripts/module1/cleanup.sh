#!/bin/bash

# Nexxo v2.0 Module 1 - Project Cleanup Script
# Removes all cache directories, build outputs, and temporary files

echo "🧹 Cleaning Nexxo project..."

# Remove cache directories
echo "  Removing cache directories..."
find . -type d -name ".nexxo_cache" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "build_output" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "test_output_*" -exec rm -rf {} + 2>/dev/null || true

# Remove node_modules cache
echo "  Removing node_modules cache..."
find . -path "*/node_modules/.cache" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove dist if rebuilding
if [ "$1" == "--full" ]; then
  echo "  Removing dist directory..."
  rm -rf dist
fi

# Remove temporary test directories
echo "  Removing temporary test directories..."
rm -rf tests/validation/temp/*/.nexxo_cache 2>/dev/null || true
rm -rf tests/snapshot_test_dir/.nexxo_cache 2>/dev/null || true

# Remove old benchmark results
echo "  Removing old benchmark results..."
rm -rf benchmarks/results/*.json 2>/dev/null || true

echo "✅ Cleanup complete!"
