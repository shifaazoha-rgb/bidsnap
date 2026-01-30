@echo off
cd /d "C:\Users\PC\Documents\bidssnap"

if not exist .git (
    git init
    git remote add origin https://github.com/shifaazoha-rgb/bidsnap.git
) else (
    git remote get-url origin 2>nul
    if errorlevel 1 git remote add origin https://github.com/shifaazoha-rgb/bidsnap.git
)

git add .
git status
git commit -m "BidSnap frontend"
git branch -M main
git push -u origin main

echo.
echo Done! View at https://github.com/shifaazoha-rgb/bidsnap
pause
