$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$script:setupNpmPrefix = $null

# OneDrive 동기화 경로는 경고만 하고 설치를 계속한다.
$setupProjectPath = (Get-Location).Path
$insideOneDrive = $setupProjectPath -match '(?i)(^|[\\/])OneDrive(?:[- ][^\\/]*)?([\\/]|$)'
foreach ($oneDriveRoot in @($env:OneDrive, $env:OneDriveCommercial, $env:OneDriveConsumer)) {
  if ($oneDriveRoot) {
    $oneDrivePrefix = $oneDriveRoot.TrimEnd([char[]]'\/')
    if ($setupProjectPath.Equals($oneDrivePrefix, [StringComparison]::OrdinalIgnoreCase) -or $setupProjectPath.StartsWith($oneDrivePrefix + '\', [StringComparison]::OrdinalIgnoreCase) -or $setupProjectPath.StartsWith($oneDrivePrefix + '/', [StringComparison]::OrdinalIgnoreCase)) { $insideOneDrive = $true }
  }
}
if ($insideOneDrive) { Write-Host 'Warning: OneDrive sync can slow the install down or lock files. Move the project to a folder outside OneDrive (for example C:\DS-Starter) if you can. The install continues.' }

function Update-SessionPath {
  # 현재 세션에서 추가한 npm/버전 관리 도구 경로도 보존한다.
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User') + ';' + $env:Path + ';' + (Join-Path $HOME '.local\bin')
  if ($script:setupNpmPrefix) { $env:Path = $script:setupNpmPrefix + ';' + $env:Path }
}

function Install-WingetPackage([string]$Id) {
  & winget install --id $Id --exact --source winget --accept-package-agreements --accept-source-agreements
  if ($LASTEXITCODE -ne 0) { throw "$Id install failed. Check whether you need administrator rights or a restart, then run the same script again." }
  Update-SessionPath
}

function Refresh-NpmGlobalPath {
  $npmPrefix = & npm.cmd prefix -g 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $npmPrefix) {
    throw 'npm.cmd prefix -g failed. Check that Node.js and npm are installed correctly.'
  }
  $npmPrefix = $npmPrefix.Trim()
  $script:setupNpmPrefix = $npmPrefix
  # Windows에서 npm 전역 shim(.cmd)은 prefix 폴더 바로 아래에 있음
  # 첫 전역 패키지 설치 전에는 prefix 폴더가 없어도 정상이다.
  $env:Path = $npmPrefix + ';' + $env:Path
}

Update-SessionPath
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe
  Update-SessionPath
}
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  throw 'WinGet was not found. Install App Installer from the Microsoft Store, then run this script again.'
}

Write-Host '[1/5] Git · Node.js · pnpm'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Install-WingetPackage 'Git.Git' }
$nodeMajor = 0
if (Get-Command node -ErrorAction SilentlyContinue) { $nodeMajor = [int]((& node --version).TrimStart('v').Split('.')[0]) }
if ($nodeMajor -lt 22) { Install-WingetPackage 'OpenJS.NodeJS.LTS' }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js was just installed. Run this script again in a new terminal.' }
if ([int]((& node --version).TrimStart('v').Split('.')[0]) -lt 22) { throw 'Node.js 22 or later is required. Run this script again in a new terminal.' }
Refresh-NpmGlobalPath
try {
  $packageManager = (Get-Content -LiteralPath (Join-Path (Get-Location).Path 'package.json') -Raw | ConvertFrom-Json).packageManager
  if ($packageManager -notmatch '^pnpm@([0-9]+\.[0-9]+\.[0-9]+)(?:\+sha[0-9]+\.[a-f0-9]+)?$') { throw 'invalid packageManager' }
  $pnpmRequiredVersion = $Matches[1]
} catch { throw 'Could not read packageManager in package.json. Unzip the project again and run this script again.' }
function Get-InstalledPnpmVersion {
  if (-not (Get-Command pnpm.cmd -ErrorAction SilentlyContinue)) { return '' }
  try {
    $version = (& pnpm.cmd --version 2>$null | Out-String).Trim()
    if ($LASTEXITCODE -eq 0) { return $version }
  } catch {}
  return ''
}
$pnpmCurrentVersion = Get-InstalledPnpmVersion
if ($pnpmCurrentVersion -ne $pnpmRequiredVersion) {
  $pnpmBefore = if ($pnpmCurrentVersion) { $pnpmCurrentVersion } else { 'none or failed to run' }
  Write-Host "Installing pnpm $pnpmRequiredVersion (current: $pnpmBefore)"
  try {
    & npm.cmd install -g "pnpm@$pnpmRequiredVersion"
    if ($LASTEXITCODE -ne 0) { throw 'npm global install failed' }
    Update-SessionPath
    Refresh-NpmGlobalPath
  } catch { throw "pnpm install failed. Run npm.cmd install -g pnpm@$pnpmRequiredVersion, then run this script again." }
  $pnpmCurrentVersion = Get-InstalledPnpmVersion
}
if ($pnpmCurrentVersion -ne $pnpmRequiredVersion) {
  $pnpmAfter = if ($pnpmCurrentVersion) { $pnpmCurrentVersion } else { 'none or failed to run' }
  Write-Host "pnpm version mismatch: need $pnpmRequiredVersion / current $pnpmAfter"
  $selectedPnpm = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
  if ($selectedPnpm) { Write-Host ("pnpm in use: " + $selectedPnpm.Source) }
  if (Get-Command where.exe -ErrorAction SilentlyContinue) { & where.exe pnpm }
  throw 'Make sure the npm global folder (npm.cmd prefix -g) comes before the paths above in PATH, then run this script again in a new terminal. Do not delete the other pnpm installs.'
}
Write-Host "pnpm $pnpmCurrentVersion OK (matches package.json)"

Write-Host '[2/5] Qwen Code CLI'
$qwenCliPackage = '@qwen-code/qwen-code@0.25.1'
try {
  if ((Get-Command qwen.cmd -ErrorAction SilentlyContinue) -or (Get-Command qwen -ErrorAction SilentlyContinue)) {
    Write-Host 'Qwen Code CLI is already installed. Skipping it and keeping your version.'
  } else {
    & npm.cmd install -g $qwenCliPackage
    if ($LASTEXITCODE -ne 0) { throw 'npm global install failed' }
    Update-SessionPath
    Refresh-NpmGlobalPath
    Write-Host 'Qwen Code CLI installed. The last step checks its version.'
  }
} catch {
  Write-Host 'Qwen Code CLI install failed. The rest of the install continues.'
  Write-Host "Manual install: npm.cmd install -g $qwenCliPackage"
}

Write-Host '[3/5] Figma Desktop · Qwen Code extension'
$figmaListing = (& winget list --id Figma.Figma --exact --source winget 2>$null | Out-String)
if ($figmaListing -notmatch 'Figma\.Figma') { Install-WingetPackage 'Figma.Figma' }
if (Get-Command code -ErrorAction SilentlyContinue) {
  & code --install-extension qwenlm.qwen-code-vscode-ide-companion
  if ($LASTEXITCODE -ne 0) { throw 'Qwen Code extension install failed. Install it yourself from the VS Code Extensions view, or check the error and run this script again.' }
} else {
  Write-Host 'The code command is missing. Install Qwen Code (qwenlm.qwen-code-vscode-ide-companion) manually from the VS Code Extensions view.'
}

Write-Host '[4/5] Project packages · Chromium for checks'
& pnpm.cmd install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { throw 'Project package install failed.' }
& pnpm.cmd exec playwright install chromium
if ($LASTEXITCODE -ne 0) { throw 'Chromium (used for checks) failed to install. Check your network, then run the same script again.' }

Write-Host '[5/5] Figma MCP · starting Storybook'
Write-Host ''
Write-Host 'Registering and checking the Figma MCP settings, then opening Storybook → http://localhost:6006'
Write-Host 'In Qwen Code, type /auth and connect your Token Plan API key.'
Write-Host 'Stop Storybook: Ctrl+C'
Write-Host 'Checking the Qwen Code CLI version (qwen --version)'
try {
  $qwenCliCommand = if (Get-Command qwen.cmd -ErrorAction SilentlyContinue) { 'qwen.cmd' } elseif (Get-Command qwen -ErrorAction SilentlyContinue) { 'qwen' } else { $null }
  if (-not $qwenCliCommand) { throw 'qwen command not found' }
  & $qwenCliCommand --version
  if ($LASTEXITCODE -ne 0) { throw 'qwen version check failed' }
  Write-Host 'Qwen Code CLI version OK. Run qwen yourself, by hand, in this project folder.'
} catch {
  Write-Host 'Qwen Code CLI did not run. Check your PATH in a new terminal. The rest of the install continues.'
  Write-Host 'Manual install: npm.cmd install -g @qwen-code/qwen-code@0.25.1'
}
# Qwen 0.27.x 는 VS Code 신뢰 폴더에 훅 승인 카드를 띄우지 않는다. 학생이 실행한 설치가 키트 검사(훅)를 승인으로 등록한다.
try {
  & node scripts/qwen-hooks-approve.mjs
  if ($LASTEXITCODE -ne 0) { throw 'qwen hooks approve failed' }
} catch {
  Write-Host "Could not turn on the kit's checks automatically. Please show this screen to the instructor."
}
Write-Host 'If you download the kit again or it changes, run this install command again: it turns the kit''s checks back on.'
Write-Host 'Qwen uses your own Token Plan credits — chat by hand, never from scripts or loops.'
Write-Host ''
& pnpm.cmd storybook
exit $LASTEXITCODE
