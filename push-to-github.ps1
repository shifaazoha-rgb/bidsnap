# Push BidSnap to GitHub - run this in PowerShell or Git Bash
# Repository: https://github.com/shifaazoha-rgb/bidsnap

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# Init and remote if needed
if (-not (Test-Path .git)) { git init }
$remote = git remote get-url origin 2>$null
if (-not $remote) { git remote add origin https://github.com/shifaazoha-rgb/bidsnap.git }

# Stage, commit, push
git add .
git status
git commit -m "BidSnap frontend: landing, estimate form, quote dashboard, design tokens" -m "- Vite + React + TypeScript + Tailwind" -m "- Estimate form with validation (React Hook Form)" -m "- Quote dashboard with line items, chart, mock data" -m "- tsconfig.node.json added"
git branch -M main
git push -u origin main

Write-Host "Done! View at https://github.com/shifaazoha-rgb/bidsnap" -ForegroundColor Green
