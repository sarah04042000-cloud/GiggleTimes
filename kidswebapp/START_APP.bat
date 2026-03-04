@echo off
title Kids Audio App Launcher
echo ============================================
echo   Kids Audio App - Full Launcher
echo ============================================
echo.

REM --- Start Backend in a new window ---
echo [1/2] Starting Backend on http://localhost:5000 ...
start "Kids Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe app.py"

REM --- Wait 3 seconds for Flask to start ---
timeout /t 3 /nobreak >nul

REM --- Start Frontend in a new window ---
echo [2/2] Starting Frontend on http://localhost:3000 ...
start "Kids Frontend" cmd /k "cd /d "%~dp0frontend" && "C:\Program Files\nodejs\npm.cmd" run dev"

REM --- Wait 4 seconds for Vite to start ---
timeout /t 4 /nobreak >nul

REM --- Open browser ---
echo.
echo Opening browser...
start http://localhost:3000

echo.
echo Both servers are running!
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo.
echo Close the two black windows to stop the app.
pause
