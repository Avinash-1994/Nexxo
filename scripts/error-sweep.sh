#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEBSITE="$ROOT/website"
LOGDIR="$ROOT/.nexxo/error-sweep"
mkdir -p "$LOGDIR"

echo "Starting Nexxo error sweep" > "$LOGDIR/summary.txt"

# Helper to wait for PROJECT ERROR in log
wait_for_error() {
  local log=$1
  local timeout=${2:-20}
  local i=0
  while [ $i -lt $timeout ]; do
    if grep -q "PROJECT ERROR" "$log"; then
      return 0
    fi
    sleep 1
    i=$((i+1))
  done
  return 1
}

# Save original file (force create backup)
MAIN="$WEBSITE/src/main.tsx"
BACKUP="$MAIN.bak"
if [ -f "$MAIN" ]; then
  cp -f "$MAIN" "$BACKUP"
else
  echo "ERROR: main.tsx not found at $MAIN" >&2
  exit 1
fi

# ---------- Test 1: Initial build error (file already broken at start) ----------
cp "$BACKUP" "$MAIN"
# Inject syntax error before 'const App' to simulate pre-existing error
perl -0777 -pe 's/(const App = )/const __NEXXO_ERROR__ = \n$1/s' "$MAIN" > "$MAIN.tmp" && mv "$MAIN.tmp" "$MAIN"

# Start dev server and capture logs
cd "$WEBSITE"
npm run dev > "$LOGDIR/dev-initial.log" 2>&1 &
PID=$!

if wait_for_error "$LOGDIR/dev-initial.log" 25; then
  echo "INITIAL_BUILD: ERROR_DETECTED" >> "$LOGDIR/summary.txt"
  echo "(see $LOGDIR/dev-initial.log)" >> "$LOGDIR/summary.txt"
else
  echo "INITIAL_BUILD: NO_ERROR_DETECTED" >> "$LOGDIR/summary.txt"
fi

# Kill dev server
kill $PID 2>/dev/null || true
sleep 1
# Restore main
if [ -f "$BACKUP" ]; then
  mv "$BACKUP" "$MAIN"
else
  echo "WARNING: backup not found, skipping restore" >&2
fi

# ---------- Test 2: HMR-triggered error ----------
# Start server clean
cd "$WEBSITE"
npm run dev > "$LOGDIR/dev-hmr.log" 2>&1 &
PID=$!
# Give server time to start
sleep 5
# Inject a syntax error into main.tsx to trigger HMR
perl -0777 -pe 's/(const App = )/const __NEXXO_ERROR__ = \n$1/s' "$MAIN" > "$MAIN.tmp" && mv "$MAIN.tmp" "$MAIN"
# Touch to ensure watcher picks up
touch "$MAIN"

if wait_for_error "$LOGDIR/dev-hmr.log" 25; then
  echo "HMR_ERROR: ERROR_DETECTED" >> "$LOGDIR/summary.txt"
  echo "(see $LOGDIR/dev-hmr.log)" >> "$LOGDIR/summary.txt"
else
  echo "HMR_ERROR: NO_ERROR_DETECTED" >> "$LOGDIR/summary.txt"
fi

# Cleanup: kill server and restore file
kill $PID 2>/dev/null || true
sleep 1
if [ -f "$BACKUP" ]; then
  mv "$BACKUP" "$MAIN"
else
  echo "WARNING: backup not found, skipping restore" >&2
fi

# Print summary
cat "$LOGDIR/summary.txt"

echo "Logs: $LOGDIR"
exit 0
