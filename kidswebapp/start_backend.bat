@echo off
echo ============================================
echo  Kids Audio App - Backend (using venv)
echo ============================================
cd /d "%~dp0backend"
echo Starting Flask on http://localhost:5000 ...
venv\Scripts\python.exe app.py
pause
