@echo off
setlocal
cd /d "%~dp0"
echo Start > upload-log.txt
where git >> upload-log.txt 2>&1
if errorlevel 1 (
  echo KEIN_GIT >> upload-log.txt
  exit /b
)
if not exist .git (
  git init -b main >> upload-log.txt 2>&1
)
git config user.name "Redurbabat" >> upload-log.txt 2>&1
git config user.email "babatredur.ch@gmail.com" >> upload-log.txt 2>&1
git add . >> upload-log.txt 2>&1
git commit -m "Start: RED-KURD Lernapp (Woerterbuch + Lektion 1)" >> upload-log.txt 2>&1
git remote remove origin >nul 2>&1
git remote add origin https://github.com/Redurbabat/RED-KURD.git >> upload-log.txt 2>&1
git pull origin main --rebase --allow-unrelated-histories >> upload-log.txt 2>&1
git push -u origin main >> upload-log.txt 2>&1
if errorlevel 1 (
  echo PUSH_FEHLER >> upload-log.txt
) else (
  echo PUSH_OK >> upload-log.txt
)
