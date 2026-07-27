@echo off
setlocal
cd /d "%~dp0"
echo ==============================================
echo   Hochladen nach github.com/Redurbabat/RED-KURD
echo ==============================================
echo.
where git >nul 2>nul
if errorlevel 1 (
  echo FEHLER: Git ist nicht installiert.
  echo Bitte von https://git-scm.com herunterladen und installieren.
  pause
  exit /b
)
if not exist .git (
  git init -b main
  git add .
  git commit -m "Start: Grundgeruest RED-KURD Lernapp (Woerterbuch + Lektion 1)"
)
git remote remove origin 2>nul
git remote add origin https://github.com/Redurbabat/RED-KURD.git
echo Versuche hochzuladen...
git push -u origin main
if errorlevel 1 (
  echo.
  echo Das Repo existiert wohl noch nicht. So legst du es an:
  echo  1. Oeffne https://github.com/new
  echo  2. Repository-Name: RED-KURD
  echo  3. Public waehlen, NICHTS ankreuzen, "Create repository"
  echo  4. Druecke dann hier eine Taste - ich lade alles hoch.
  pause
  git push -u origin main
)
echo.
echo FERTIG! Dein Repo: https://github.com/Redurbabat/RED-KURD
pause
