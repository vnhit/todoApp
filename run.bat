@echo off
setlocal
title Todo Dashboard
cd /d "%~dp0backend"
if errorlevel 1 exit /b 1

if not exist ".venv\Scripts\python.exe" (
    echo Chua co moi truong Python. Xem huong dan cai dat trong README.md.
    pause
    exit /b 1
)

echo Mo trinh duyet tai http://127.0.0.1:8000/
echo Giu cua so nay mo khi dung ung dung. Nhan Ctrl+C de dung.
echo.
".venv\Scripts\python.exe" manage.py runserver 127.0.0.1:8000
if errorlevel 1 (
    echo.
    echo Server chua khoi dong duoc. Xem thong bao loi phia tren.
    pause
)
