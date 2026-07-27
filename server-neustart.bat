@echo off
cd /d "%~dp0"
taskkill /f /fi "WINDOWTITLE eq RED-KURD Datenbank-Server*" >nul 2>&1
timeout /t 2 >nul
start "RED-KURD Datenbank-Server" cmd /k node server.js
