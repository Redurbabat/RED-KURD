@echo off
cd /d "%~dp0"
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul
start "RED-KURD Datenbank-Server" cmd /k node server.js
timeout /t 2 >nul
start "RED-KURD App" cmd /k npm run dev
