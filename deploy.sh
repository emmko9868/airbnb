#!/usr/bin/env bash
set -euo pipefail
if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This script is for macOS. On Windows, run deploy.ps1 instead." >&2
  exit 1
fi
cd "$(dirname "$0")"
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found. Run setup-local.sh first to set up your computer." >&2
  exit 1
fi
exec node scripts/deploy.mjs "$@"
