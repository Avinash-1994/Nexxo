#!/bin/bash

echo "🚀 Self-Learning AI Demo"
echo "========================"
echo ""

# Setup
echo "📦 Setting up demo project..."
mkdir -p demo_project
cd demo_project

# Initialize a simple project
cat > package.json << 'EOF'
{
  "name": "demo-ai-learning",
  "version": "1.0.0",
  "dependencies": {}
}
EOF

echo "✅ Demo project created"
echo ""

# Simulate an error
echo "❌ Simulating build error: Missing dependency 'lodash'"
echo ""

# Show AI fix command
echo "💡 Running: nextgen ai fix"
echo ""
echo "🤖 AI Fix Suggestions:"
echo "1. Install missing dependency: lodash (Confidence: 0.95)"
echo ""

# Show status
echo "📊 Running: nextgen ai status"
echo ""
echo "🧠 AI Learning Status"
echo "   - Learned Errors: 1"
echo "   - Known Fixes:    1"
echo "   - Successful Fixes: 1"
echo ""

# Show sync
echo "🌐 Running: nextgen ai sync-models"
echo ""
echo "ℹ️  Cloud sync disabled (local mode)"
echo ""

echo "✨ Demo complete!"
echo ""
echo "📚 Available AI Commands:"
echo "  - nextgen ai fix          # Auto-fix last error"
echo "  - nextgen ai status       # Show learning stats"
echo "  - nextgen ai forget <id>  # Remove a pattern"
echo "  - nextgen ai sync-models  # Sync with cloud"
echo "  - nextgen ai contribute   # Share learnings"
