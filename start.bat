@echo off
echo ============================================
echo Domino Sudoku Game - Start Script
echo ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed or not in your PATH.
    echo Please install Node.js and try again.
    exit /b 1
)

:: Check for running servers and kill them
echo Checking for running servers...

:: Check if backend server is running (port 3001)
netstat -ano | findstr :3001 >nul
if %ERRORLEVEL% equ 0 (
    echo Backend server found running on port 3001. Attempting to kill...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /F /PID %%a >nul 2>nul
        if %ERRORLEVEL% equ 0 (
            echo Successfully killed process on port 3001.
        ) else (
            echo Failed to kill process on port 3001.
        )
    )
) else (
    echo Backend server not running on port 3001.
)

:: Check if frontend server is running (port 3000)
netstat -ano | findstr :3000 >nul
if %ERRORLEVEL% equ 0 (
    echo Frontend server found running on port 3000. Attempting to kill...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /F /PID %%a >nul 2>nul
        if %ERRORLEVEL% equ 0 (
            echo Successfully killed process on port 3000.
        ) else (
            echo Failed to kill process on port 3000.
        )
    )
) else (
    echo Frontend server not running on port 3000.
)

echo.
echo Waiting for ports to clear...
timeout /t 2 /nobreak >nul

:: Start the servers
echo Starting servers...

:: Start the backend server in a new window
echo Starting backend server on http://localhost:3001
start "Domino Sudoku Backend" cmd /c "cd backend && npm start"

:: Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

:: Start the frontend server in a new window
echo Starting frontend server on http://localhost:3000
start "Domino Sudoku Frontend" cmd /c "cd frontend && npm start"

echo.
echo Servers should be starting now in separate windows.
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo You can close this window, but keep the server windows open to keep the game running.
echo.

pause
