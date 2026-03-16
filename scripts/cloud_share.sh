#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-4173}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

require() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "$1 is required" >&2
    exit 1
  }
}

require python3
require curl

echo "[1/3] Starting static server on :${PORT} ..."
cd "$ROOT_DIR"
python3 -m http.server "$PORT" >/tmp/dreamatlas_http.log 2>&1 &
HTTP_PID=$!
trap 'kill $HTTP_PID >/dev/null 2>&1 || true' EXIT
sleep 1

curl -fsS "http://127.0.0.1:${PORT}" >/dev/null || {
  echo "Failed to start local server on port ${PORT}" >&2
  exit 1
}

if command -v ssh >/dev/null 2>&1; then
  echo "[2/3] Trying localhost.run tunnel (SSH) ..."
  set +e
  ssh -o StrictHostKeyChecking=no -o ConnectTimeout=8 -o ServerAliveInterval=30 -R 80:localhost:${PORT} nokey@localhost.run
  SSH_STATUS=$?
  set -e
  if [[ "$SSH_STATUS" -eq 0 ]]; then
    exit 0
  fi
  echo "localhost.run unavailable in current network (exit ${SSH_STATUS}), fallback to localtunnel."
fi

if command -v npx >/dev/null 2>&1; then
  echo "[3/3] Starting localtunnel fallback ..."
  echo "Keep this terminal open while sharing. Press Ctrl+C to stop."
  npx --yes localtunnel --port "$PORT"
  exit 0
fi

echo "No public tunnel method available (missing ssh/npx)." >&2
exit 1
