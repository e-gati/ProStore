@echo off
title ProStore
cd /d "%~dp0"

echo.
echo  ================================
echo   ProStore - Стартиране...
echo  ================================
echo.

:: Провери дали node_modules съществува
if not exist "node_modules" (
    echo  Инсталиране на зависимости...
    call npm install
    echo.
)

:: Стартирай Vite в background
echo  [1/2] Стартиране на Vite...
start /min cmd /c "npm run dev"

:: Изчакай Vite да се стартира
echo  [2/2] Изчакване на сървъра...
timeout /t 4 /nobreak >nul

:: Стартирай Electron
echo  Отваряне на ProStore...
call node_modules\.bin\electron.cmd .

:: Когато Electron се затвори - затвори и Vite
echo.
echo  Затваряне...
taskkill /f /im node.exe >nul 2>&1
exit
