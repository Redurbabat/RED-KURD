@echo off
cd /d "%~dp0"
echo Starte RED-KURD (Server + App)...
start "RED-KURD Datenbank-Server" cmd /k node server.js
timeout /t 2 >nul
start "RED-KURD App" cmd /k npm run dev
timeout /t 6 >nul
start http://localhost:5173
echo Fertig! Die App oeffnet sich im Browser.
echo (Beide schwarzen Fenster offen lassen, solange du die App nutzt.)
