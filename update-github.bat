@echo off
echo ========================================
echo    Dream Factory - GitHub Updater
echo ========================================
echo.

echo Checking for changes...
"C:\Program Files\Git\bin\git.exe" status

echo.
echo Adding all changes...
"C:\Program Files\Git\bin\git.exe" add .

echo.
echo Committing changes...
set timestamp=%date% %time%
"C:\Program Files\Git\bin\git.exe" commit -m "Auto-update: %timestamp%"

echo.
echo Pushing to GitHub...
"C:\Program Files\Git\bin\git.exe" push

echo.
echo ========================================
echo    Update Complete!
echo ========================================
echo.
echo Your changes have been pushed to GitHub.
echo Check your repository at:
echo https://github.com/CUEv1/dream-factory-clicker
echo.
pause 