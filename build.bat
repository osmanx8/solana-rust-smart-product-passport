@echo off
setlocal enabledelayedexpansion

echo Installing dependencies...
cd frontend\app
call npm ci
if errorlevel 1 (
    echo Error installing dependencies
    exit /b 1
)

echo Building application...
call npm run build
if errorlevel 1 (
    echo Error building application
    exit /b 1
)

echo Build completed successfully! 