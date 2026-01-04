#!/bin/bash
export TERM=xterm
CLI_BIN="$(pwd)/dist/cli.js"
TEST_ROOT="$(pwd)/_test_cli"
WORK_DIR="$TEST_ROOT/workspace"

# Cleanup and setup
rm -rf "$TEST_ROOT"
mkdir -p "$WORK_DIR"

PASSED=0
FAILED=0

function check() {
    if [ $1 -eq 0 ]; then
        echo -e "\033[0;32m✅ PASSED: $2\033[0m"
        ((PASSED++))
    else
        echo -e "\033[0;31m❌ FAILED: $2 (Code: $1)\033[0m"
        ((FAILED++))
    fi
}

echo "Starting CLI Tests..."
echo "CLI Binary: $CLI_BIN"

# 1. urja init
cd "$WORK_DIR"
echo "--- Testing urja init ---"
echo "<h1>Test</h1>" > index.html
echo "body { color: red; }" > style.css
node "$CLI_BIN" init --yes > ../init.log 2>&1
check $? "urja init"

# 2. urja audit
echo "--- Testing urja audit ---"
node "$CLI_BIN" audit > ../audit.log 2>&1
check $? "urja audit"

# 3. urja inspect
echo "--- Testing urja inspect ---"
node "$CLI_BIN" inspect > ../inspect.log 2>&1
check $? "urja inspect"

# 4. urja optimize
echo "--- Testing urja optimize ---"
echo "q" | node "$CLI_BIN" optimize > ../optimize.log 2>&1
check $? "urja optimize"

# 5. urja dev
echo "--- Testing urja dev ---"
timeout 5s node "$CLI_BIN" dev --port 5999 > ../dev.log 2>&1
RET=$?
if [ $RET -eq 124 ]; then
    check 0 "urja dev (started successfully)"
else
    check $RET "urja dev"
fi

# 6. urja report
echo "--- Testing urja report ---"
node "$CLI_BIN" report > ../report.log 2>&1
check $? "urja report"

# 7. urja css purge
echo "--- Testing urja css purge ---"
echo "n" | node "$CLI_BIN" css purge > ../css.log 2>&1
check $? "urja css purge"

# 8. urja bootstrap
cd "$TEST_ROOT"
echo "--- Testing urja bootstrap ---"
node "$CLI_BIN" bootstrap --name boot_app --template react > bootstrap.log 2>&1
check $? "urja bootstrap"

echo "-------------------"
echo -e "Total Passed: \033[0;32m$PASSED\033[0m"
echo -e "Total Failed: \033[0;31m$FAILED\033[0m"

if [ $FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
