@echo off
cd /d "%~dp0"
start "Master Export Pro API" cmd /k "npm --prefix server run dev"
start "Master Export Pro Client" cmd /k "npm --prefix client run dev"
timeout /t 3 >nul
start http://localhost:5173
