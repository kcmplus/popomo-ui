@echo off
cd /d "%~dp0"
py -3 --version >nul 2>&1
if not errorlevel 1 (py -3 tools\server.py & goto end)
python --version >nul 2>&1
if not errorlevel 1 (python tools\server.py & goto end)
node --version >nul 2>&1
if not errorlevel 1 (node tools\server.mjs & goto end)
echo Please install Python 3 or Node.js first.
pause
:end
