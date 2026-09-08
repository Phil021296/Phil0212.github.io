@echo off
cd /d "%~dp0"
set PORT=8000
start "" http://127.0.0.1:8000
node tools/preview.js
pause
