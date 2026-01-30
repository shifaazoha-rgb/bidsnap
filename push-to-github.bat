@echo off
cd /d "%~dp0"

if not exist .git git init
git remote get-url origin 2>nul || git remote add origin https://github.com/shifaazoha-rgb/bidsnap.git

git add .
git status
git commit -m "BidSnap frontend: landing, estimate form, quote dashboard"
git branch -M main
git push -u origin main

echo Done! View at https://github.com/shifaazoha-rgb/bidsnap
pause
