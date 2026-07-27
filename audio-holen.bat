@echo off
cd /d "%~dp0"
py audio-holen.py > audio-log.txt 2>&1
