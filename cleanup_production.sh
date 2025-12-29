#!/bin/bash

# Urja Build Tool - Production Cleanup Script
# This script removes test files, debug code, and prepares for production

echo "🧹 Starting Urja Production Cleanup..."
echo "========================================"

# Track space saved
INITIAL_SIZE=$(du -sh . 2>/dev/null | cut -f1)

# 1. Remove test output directories
echo ""
echo "📁 Removing test output directories..."
rm -rf test_output_ai test_output_dx test_output_fed_core test_output_opt test_output_p5 test_output_prod test_output_rep
rm -rf test_phase1 test_phase2
rm -rf test-projects
rm -rf test-tailwind-init
rm -rf urja-test-project
rm -rf demo_project
echo "✅ Test directories removed"

# 2. Remove debug and temporary files
echo ""
echo "🐛 Removing debug and temporary files..."
rm -f worker-debug.log
rm -f tempPriv.pem
rm -f headless-test.js
rm -f test-build.mjs
rm -f demo_ai.sh
rm -f .remote_cache_pid
echo "✅ Debug files removed"

# 3. Remove cache directories (will be regenerated)
echo ""
echo "💾 Removing cache directories..."
rm -rf .urja_cache
rm -rf .remote_cache
echo "✅ Cache directories removed"

# 4. Remove redundant documentation
echo ""
echo "📄 Removing redundant documentation..."
rm -f ALL_FRAMEWORKS_PLAN.md
rm -f CLOUD_API_SPEC.md
rm -f CORE_PIPELINE_STATUS.md
rm -f FINAL_STATUS.md
rm -f HONEST_CORE_STATUS.md
rm -f NPM_PUBLISHING_GUIDE.md
rm -f PRODUCTION_READY.md
rm -f PROJECT_STATUS.md
rm -f PUBLISH_READY.md
rm -f REALISTIC_STATUS.md
rm -f SELF_LEARNING_AI.md
rm -f TEST_SCRIPT.md
rm -f URJA_TEST_REPORT.md
rm -f VISUAL_BUILDER_MIGRATION.md
rm -f WEEK1_ACTION_PLAN.md
rm -f plan_comparison.md
rm -f roadmap_comparison.md
echo "✅ Redundant docs removed"

# 5. Remove marketplace test data
echo ""
echo "🏪 Removing marketplace test data..."
rm -f marketplace.json
rm -f marketplace_auth.json
rm -rf marketplace_data
echo "✅ Marketplace test data removed"

# 6. Clean node_modules in subdirectories (optional - commented out)
# echo ""
# echo "📦 Cleaning subdirectory node_modules..."
# rm -rf visualBuilder/node_modules
# rm -rf cloud-backend/node_modules
# echo "✅ Subdirectory node_modules removed"

# 7. Show final size
echo ""
echo "========================================"
FINAL_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo "📊 Cleanup Complete!"
echo "   Initial size: $INITIAL_SIZE"
echo "   Final size: $FINAL_SIZE"
echo ""

# 8. List remaining important files
echo "📋 Remaining important files:"
echo "   ✅ README.md"
echo "   ✅ CHANGELOG.md"
echo "   ✅ LICENSE"
echo "   ✅ CONTRIBUTING.md"
echo "   ✅ PRODUCTION_READINESS_ASSESSMENT.md"
echo "   ✅ package.json"
echo "   ✅ src/ (source code)"
echo "   ✅ dist/ (if built)"
echo ""

# 9. Recommendations
echo "🎯 Next Steps:"
echo "   1. Review PRODUCTION_READINESS_ASSESSMENT.md"
echo "   2. Run: npm run build"
echo "   3. Test with a real React project"
echo "   4. Fix console.log statements in src/"
echo "   5. Address TODO comments"
echo ""
echo "✨ Cleanup complete! Ready for production work."
