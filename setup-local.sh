#!/usr/bin/env bash
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This script is for macOS. On Windows, run setup-local.ps1 instead." >&2
  exit 1
fi

cd "$(dirname "$0")"
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

# OneDrive 동기화 경로는 경고만 하고 설치를 계속한다.
if [[ "$PWD" =~ (^|/)OneDrive([[:space:]-][^/]*)?(/|$) ]]; then
  echo "Warning: OneDrive sync can slow the install down or lock files. Move the project to a folder outside OneDrive (for example ~/DS-Starter) if you can. The install continues."
fi

if ! command -v brew >/dev/null 2>&1; then
  echo "[1/6] Installing Homebrew"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  if [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -x /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
fi

echo "[2/6] Node.js · pnpm"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]]; then
  brew install node
fi
hash -r 2>/dev/null || true
if ! command -v node >/dev/null 2>&1 || [[ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]]; then
  echo "No working Node.js 22 or later was found. Check the Node.js install and your PATH, then run this script again." >&2
  exit 1
fi

# pnpm이 설치되는 npm 전역 경로를 먼저 등록한다.
npm_global_prefix="$(npm prefix -g)" || {
  echo "npm prefix -g failed. Check that Node.js and npm are installed correctly." >&2
  exit 1
}
if [[ -n "$npm_global_prefix" ]]; then
  export PATH="$npm_global_prefix/bin:$PATH"
fi
hash -r 2>/dev/null || true
if ! pnpm_required_version="$(node -p 'const m = /^pnpm@([0-9]+\.[0-9]+\.[0-9]+)(?:\+sha[0-9]+\.[a-f0-9]+)?$/i.exec(require("./package.json").packageManager); if (!m) throw new Error("invalid packageManager"); m[1]')"; then
  echo "Could not read packageManager in package.json. Unzip the project again and run this script again." >&2
  exit 1
fi
pnpm_current_version=""
if command -v pnpm >/dev/null 2>&1; then
  pnpm_current_version="$(pnpm --version 2>/dev/null)" || pnpm_current_version=""
fi
if [[ "$pnpm_current_version" != "$pnpm_required_version" ]]; then
  echo "Installing pnpm $pnpm_required_version (current: ${pnpm_current_version:-none or failed to run})"
  if ! npm install -g "pnpm@$pnpm_required_version"; then
    echo "pnpm install failed. Run npm install -g pnpm@$pnpm_required_version, then run this script again." >&2
    exit 1
  fi
  hash -r 2>/dev/null || true
  pnpm_current_version="$(pnpm --version 2>/dev/null)" || pnpm_current_version=""
fi
if [[ "$pnpm_current_version" != "$pnpm_required_version" ]]; then
  echo "pnpm version mismatch: need $pnpm_required_version / current ${pnpm_current_version:-none or failed to run}" >&2
  echo "pnpm in use: $(command -v pnpm || true)" >&2
  type -a pnpm >&2 || true
  echo "Make sure the npm global folder $npm_global_prefix/bin comes before the paths above in PATH, then run this script again in a new terminal. Do not delete the other pnpm installs." >&2
  exit 1
fi
echo "pnpm $pnpm_current_version OK (matches package.json)"

echo "[3/6] Qwen Code CLI"
qwen_cli_package="@qwen-code/qwen-code@0.25.1"
if command -v qwen >/dev/null 2>&1; then
  echo "Qwen Code CLI is already installed. Skipping it and keeping your version."
elif npm install -g "$qwen_cli_package"; then
  hash -r 2>/dev/null || true
  echo "Qwen Code CLI installed. The last step checks its version."
else
  echo "Qwen Code CLI install failed. The rest of the install continues."
  echo "Manual install: npm install -g $qwen_cli_package"
fi

echo "[4/6] Figma Desktop · Qwen Code extension"
if [[ ! -d /Applications/Figma.app && ! -d "$HOME/Applications/Figma.app" ]]; then
  brew install --cask figma
fi
if command -v code >/dev/null 2>&1; then
  code --install-extension qwenlm.qwen-code-vscode-ide-companion
else
  echo "The code command is missing. In VS Code, open the Command Palette (⌘⇧P) → Shell Command: Install 'code' command in PATH, then run this script again. Or install Qwen Code (qwenlm.qwen-code-vscode-ide-companion) manually from the Extensions view."
fi

echo "[5/6] Project packages · Chromium for checks"
pnpm install --frozen-lockfile
pnpm exec playwright install chromium

echo "[6/6] Figma MCP · starting Storybook"
echo
echo "Registering and checking the Figma MCP settings, then opening Storybook → http://localhost:6006"
echo "In Qwen Code, type /auth and connect your Token Plan API key."
echo "Stop Storybook: Ctrl+C"
echo "Checking the Qwen Code CLI version (qwen --version)"
if command -v qwen >/dev/null 2>&1 && qwen --version; then
  echo "Qwen Code CLI version OK. Run qwen yourself, by hand, in this project folder."
else
  echo "Qwen Code CLI did not run. Check your PATH in a new terminal. The rest of the install continues."
  echo "Manual install: npm install -g @qwen-code/qwen-code@0.25.1"
fi
# Qwen 0.27.x 는 VS Code 신뢰 폴더에 훅 승인 카드를 띄우지 않는다. 학생이 실행한 설치가 키트 검사(훅)를 승인으로 등록한다.
if ! node scripts/qwen-hooks-approve.mjs; then
  echo "Could not turn on the kit's checks automatically. Please show this screen to the instructor."
fi
echo "If you download the kit again or it changes, run this install command again: it turns the kit's checks back on."
echo "Qwen uses your own Token Plan credits — chat by hand, never from scripts or loops."
echo
exec pnpm storybook
