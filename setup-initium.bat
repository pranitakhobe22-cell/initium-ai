@echo off
echo 🚀 Starting Initium.AI Setup...

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is missing! Please install it from https://nodejs.org
    pause
    exit /b
)

:: 2. Install Root Dependencies
echo 📦 Installing Root Dependencies...
call npm install

:: 3. Install Backend Dependencies
echo 📦 Installing Backend Dependencies...
cd backend
call npm install
cd ..

:: 4. Install Frontend Dependencies
echo 📦 Installing Frontend Dependencies...
cd frontend-react
call npm install
cd ..

echo ✨ Setup Complete!
echo.
echo To run the platform:
echo   Option 1: Run 'npm start' in this folder
echo   Option 2: Run backend and frontend in separate terminals
echo.
pause
