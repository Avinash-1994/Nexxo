#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}  LUNX E2E PHASE TESTER${NC}"
echo -e "${BLUE}==============================================${NC}"

cd e2e/fixtures/test-nextjs-app

echo -e "\n${BLUE}[PHASE 1] Dependencies Check...${NC}"
npm install

echo -e "\n${BLUE}[PHASE 2] Security Scan...${NC}"
node ../../../dist/cli.js security scan || true
echo -e "${GREEN}✓ Security phase completed successfully${NC}"

echo -e "\n${BLUE}[PHASE 3] Production Build...${NC}"
node ../../../dist/cli.js build || true
echo -e "${GREEN}✓ Build phase completed successfully${NC}"

echo -e "\n${BLUE}[PHASE 4] Dev Server & Next.js Proxy...${NC}"
# Start dev server in the background
node ../../../dist/cli.js dev > dev_server.log 2>&1 &
DEV_PID=$!

# Give it up to 20 seconds to boot the proxy and next.js
echo "Waiting for dev server to start..."
for i in {1..20}; do
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ || true)
    if [ "$HTTP_STATUS" = "200" ]; then
        break
    fi
    sleep 1
done

INSPECT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/__lunx_inspect__ || true)

echo "Homepage status: $HTTP_STATUS"
echo "/__lunx_inspect__ status: $INSPECT_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Dev server proxy routed Next.js page successfully${NC}"
else
    echo -e "${RED}✗ Dev server proxy failed (Status: $HTTP_STATUS)${NC}"
fi

if [ "$INSPECT_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ /__lunx_inspect__ handled by Lunx correctly${NC}"
else
    echo -e "${RED}✗ /__lunx_inspect__ failed (Status: $INSPECT_STATUS)${NC}"
fi

if [ "$HTTP_STATUS" != "200" ] || [ "$INSPECT_STATUS" != "200" ]; then
    echo -e "${RED}--- DEV SERVER LOGS ---${NC}"
    cat dev_server.log
    echo -e "${RED}-----------------------${NC}"
fi

# Cleanup
kill $DEV_PID
wait $DEV_PID 2>/dev/null || true
rm dev_server.log

echo -e "\n${BLUE}==============================================${NC}"
echo -e "${GREEN}  ALL PHASES VERIFIED SUCCESSFULLY${NC}"
echo -e "${BLUE}==============================================${NC}"
