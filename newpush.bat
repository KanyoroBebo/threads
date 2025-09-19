@echo off
:: New Repo Init + Push

:: Prompt for repo URL
set /p repo_url="Enter the remote GitHub repository URL: "

:: Prompt for commit message
set /p commit_msg="Enter your commit message: "

:: Check if .git folder exists
IF NOT EXIST ".git" (
    git init
)

:: Add all files
git add .

:: Commit changes
git commit -m "%commit_msg%"

:: Remove existing origin if exists (suppress errors)
git remote remove origin 2>nul

:: Add remote
git remote add origin %repo_url%

:: Rename branch to main
git branch -M main

:: Push to remote
git push -u origin main

:: If push failed due to unrelated histories, fix it
IF ERRORLEVEL 1 (
    echo Push failed, trying to pull with --allow-unrelated-histories...
    git pull origin main --allow-unrelated-histories
    git push -u origin main
)

echo.
echo Done!
pause
