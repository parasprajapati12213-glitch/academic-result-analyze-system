@echo off
title MITS Gwalior - Result Analysis System
cd /d "%~dp0backend"

echo ========================================================
echo   MITS GWALIOR - ACADEMIC RESULT ANALYSIS SYSTEM
echo ========================================================
echo.

tasklist /FI "IMAGENAME eq server.exe" 2>NUL | find /I /N "server.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Backend server is already running on port 8080.
) else (
    echo [STARTING] Starting C++ Backend Server...
    start "" "%~dp0backend\server.exe"
    timeout /t 2 /nobreak >nul
)

echo [LAUNCHING] Opening Web Application in Browser...
start http://localhost:8080/

echo.
echo Application is active at: http://localhost:8080/
echo.
