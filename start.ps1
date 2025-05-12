# Domino Sudoku Start Script (PowerShell)

Write-Host "============================================" -ForegroundColor Green
Write-Host "Domino Sudoku Game - Start Script" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Using Node.js $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Node.js is not installed or not in your PATH." -ForegroundColor Red
    Write-Host "Please install Node.js and try again." -ForegroundColor Red
    exit 1
}

# Check for running servers and kill them
Write-Host "Checking for running servers..." -ForegroundColor Cyan

# Check if backend server is running (port 3001)
$backendProcesses = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
if ($backendProcesses) {
    Write-Host "Backend server found running on port 3001. Attempting to kill..." -ForegroundColor Yellow
    foreach ($process in $backendProcesses) {
        $pid = $process.OwningProcess
        try {
            Stop-Process -Id $pid -Force
            Write-Host "Successfully killed process ID $pid on port 3001" -ForegroundColor Green
        } catch {
            Write-Host "Failed to kill process ID $pid on port 3001" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Backend server not running on port 3001" -ForegroundColor Green
}

# Check if frontend server is running (port 3000)
$frontendProcesses = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
if ($frontendProcesses) {
    Write-Host "Frontend server found running on port 3000. Attempting to kill..." -ForegroundColor Yellow
    foreach ($process in $frontendProcesses) {
        $pid = $process.OwningProcess
        try {
            Stop-Process -Id $pid -Force
            Write-Host "Successfully killed process ID $pid on port 3000" -ForegroundColor Green
        } catch {
            Write-Host "Failed to kill process ID $pid on port 3000" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Frontend server not running on port 3000" -ForegroundColor Green
}

Write-Host ""
Write-Host "Waiting for ports to clear..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

# Start the servers
Write-Host "Starting servers..." -ForegroundColor Cyan

# Start the backend server in a new window
Write-Host "Starting backend server on http://localhost:3001" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command cd '$PSScriptRoot\backend'; npm start"

# Wait for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# Start the frontend server in a new window
Write-Host "Starting frontend server on http://localhost:3000" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command cd '$PSScriptRoot\frontend'; npm start"

Write-Host ""
Write-Host "Servers should be starting now in separate windows." -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can close this window, but keep the server windows open to keep the game running." -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to exit"
