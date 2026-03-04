@echo off
echo ============================================
echo  Kids Audio App - Frontend Launcher
echo ============================================
cd /d "%~dp0frontend"
echo Starting React frontend on http://localhost:3000 ...
SET "PATH=%PATH%;C:\Program Files\nodejs"
npm.cmd run dev
pause
