/**
 * Domino Sudoku Start Script
 * 
 * This script checks if the frontend or backend servers are running,
 * terminates them if they are, and then starts both servers.
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Configuration
const BACKEND_PORT = 3001;
const FRONTEND_PORT = 3000;

/**
 * Checks if a port is in use
 * @param {number} port - The port to check
 * @returns {boolean} - Whether the port is in use
 */
function isPortInUse(port) {
    try {
        // Different commands for different operating systems
        if (os.platform() === 'win32') {
            // Windows
            const result = execSync(`netstat -ano | findstr :${port}`).toString();
            return result.length > 0;
        } else {
            // Unix-like
            const result = execSync(`lsof -i:${port}`).toString();
            return result.length > 0;
        }
    } catch (error) {
        // If the command fails, the port is likely not in use
        return false;
    }
}

/**
 * Kills a process using a specific port
 * @param {number} port - The port to kill
 * @returns {Promise<boolean>} - Whether the kill was successful
 */
async function killProcessOnPort(port) {
    try {
        console.log(`Attempting to kill process on port ${port}...`);
        
        if (os.platform() === 'win32') {
            // Windows - more robust implementation
            // Using findstr with LISTENING state to be more specific
            const output = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`).toString();
            const lines = output.split('\n').filter(line => line.trim().length > 0);
            
            if (lines.length === 0) {
                console.log(`No process found listening on port ${port}`);
                return true;
            }
            
            let allKilled = true;
            for (const line of lines) {
                // The PID is the last column in the output
                const matches = line.match(/(\d+)\s*$/);
                if (matches && matches.length > 1) {
                    const pid = matches[1];
                    try {
                        execSync(`taskkill /F /PID ${pid}`);
                        console.log(`Killed process with PID ${pid} on port ${port}`);
                    } catch (killError) {
                        console.error(`Failed to kill PID ${pid}: ${killError.message}`);
                        allKilled = false;
                    }
                } else {
                    console.warn(`Could not extract PID from: ${line}`);
                    allKilled = false;
                }
            }
            return allKilled;
        } else {
            // Unix-like
            const pids = execSync(`lsof -t -i:${port}`).toString().trim().split('\n');
            if (pids.length === 0 || (pids.length === 1 && !pids[0])) {
                console.log(`No process found listening on port ${port}`);
                return true;
            }
            
            let allKilled = true;
            for (const pid of pids) {
                if (pid) {
                    try {
                        execSync(`kill -9 ${pid}`);
                        console.log(`Killed process with PID ${pid} on port ${port}`);
                    } catch (killError) {
                        console.error(`Failed to kill PID ${pid}: ${killError.message}`);
                        allKilled = false;
                    }
                }
            }
            return allKilled;
        }
    } catch (error) {
        // If the command to find processes fails, the port might not be in use
        console.log(`No process found using port ${port} or command failed: ${error.message}`);
        return true;
    }
}

/**
 * Starts a server with the specified command in a directory
 * @param {string} dir - The directory to run the command in
 * @param {string} command - The command to run
 * @param {string} name - A name for logging purposes
 * @returns {ChildProcess|null} - The server process or null on failure
 */
function startServer(dir, command, name) {
    console.log(`Starting ${name}...`);
    
    const fullPath = path.join(__dirname, dir);
    
    // Verify directory exists
    if (!fs.existsSync(fullPath)) {
        console.error(`ERROR: Directory ${fullPath} does not exist.`);
        return null;
    }
    
    // Check for package.json
    if (!fs.existsSync(path.join(fullPath, 'package.json'))) {
        console.error(`ERROR: No package.json found in ${fullPath}`);
        return null;
    }
    
    // Check for node_modules
    if (!fs.existsSync(path.join(fullPath, 'node_modules'))) {
        console.warn(`WARNING: node_modules directory not found in ${fullPath}`);
        console.log(`Installing dependencies in ${fullPath}...`);
        try {
            execSync('npm install', { cwd: fullPath, stdio: 'inherit' });
            console.log(`Dependencies installed successfully in ${fullPath}`);
        } catch (error) {
            console.error(`ERROR: Failed to install dependencies in ${fullPath}:`, error.message);
            return null;
        }
    }
    
    console.log(`Executing '${command}' in directory ${fullPath}`);
    
    try {
        // Use detached mode to make sure the server can run independently
        const server = spawn(command, [], {
            cwd: fullPath,
            shell: true,
            stdio: 'pipe', // Capture output so we can log it with server name prefixed
            detached: false // Keep the child process attached to the parent
        });
        
        // Set up output handlers with server name prefixes
        server.stdout.on('data', (data) => {
            console.log(`[${name}] ${data.toString().trim()}`);
        });
        
        server.stderr.on('data', (data) => {
            console.error(`[${name} ERROR] ${data.toString().trim()}`);
        });
        
        server.on('error', (err) => {
            console.error(`Error starting ${name}:`, err);
        });
        
        server.on('close', (code) => {
            console.log(`${name} process exited with code ${code}`);
        });
        
        // Verify the process started successfully
        if (server.pid) {
            console.log(`${name} started with PID: ${server.pid}`);
            return server;
        } else {
            console.error(`Failed to get PID for ${name}`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to start ${name}:`, error.message);
        return null;
    }
}

/**
 * Verifies a port is free and keeps trying to kill the process if needed
 * @param {number} port - The port to check
 * @param {number} maxAttempts - Maximum attempts to free the port
 * @returns {Promise<boolean>} - Whether the port is free
 */
async function ensurePortIsFree(port, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (isPortInUse(port)) {
            console.log(`Attempt ${attempt}/${maxAttempts}: Port ${port} is still in use.`);
            await killProcessOnPort(port);
            
            // Wait for the process to fully terminate
            console.log(`Waiting for port ${port} to clear...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
            console.log(`Port ${port} is free.`);
            return true;
        }
    }
    
    return !isPortInUse(port);
}

// Main function to check ports and start servers
async function start() {
    console.log('============================================');
    console.log('Domino Sudoku Server Starter');
    console.log('============================================');
    
    // Ensure backend port is free
    const backendFree = await ensurePortIsFree(BACKEND_PORT);
    if (!backendFree) {
        throw new Error(`Failed to free port ${BACKEND_PORT} after multiple attempts.`);
    }
    
    // Ensure frontend port is free
    const frontendFree = await ensurePortIsFree(FRONTEND_PORT);
    if (!frontendFree) {
        throw new Error(`Failed to free port ${FRONTEND_PORT} after multiple attempts.`);
    }
    
    // Give some time for the ports to fully clear
    console.log('All ports are ready. Preparing to start servers...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start backend server
    const backendServer = startServer('backend', 'npm start', 'Backend Server');
    
    if (!backendServer) {
        throw new Error('Failed to start backend server.');
    }
      // Wait for the backend to initialize and check if it's running
    console.log('Waiting for backend server to initialize...');
    let backendStarted = false;
    for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
            // Try to access the backend to see if it's running
            // Use different approaches based on platform
            if (os.platform() === 'win32') {
                // On Windows, use PowerShell's Invoke-WebRequest
                try {
                    execSync(`powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:${BACKEND_PORT}/health -UseBasicParsing -TimeoutSec 1; Write-Output $response.StatusCode } catch { Write-Output 0 }"`);
                    backendStarted = true;
                    console.log('Backend server is running.');
                    break;
                } catch (err) {
                    // Try with curl if PowerShell fails
                    try {
                        execSync(`curl -s -o NUL -w "%%{http_code}" http://localhost:${BACKEND_PORT}/health || echo 0`);
                        backendStarted = true;
                        console.log('Backend server is running.');
                        break;
                    } catch (curlErr) {
                        console.log(`Waiting for backend (attempt ${i+1}/10)...`);
                    }
                }
            } else {
                // On Unix systems, use curl
                execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${BACKEND_PORT}/health || echo 0`);
                backendStarted = true;
                console.log('Backend server is running.');
                break;
            }
        } catch (err) {
            console.log(`Waiting for backend (attempt ${i+1}/10)...`);
        }
    }
    
    if (!backendStarted) {
        console.warn('Backend may not have started properly, but will continue with frontend startup.');
    }
    
    // Start frontend server
    const frontendServer = startServer('frontend', 'npm start', 'Frontend Server');
    
    if (!frontendServer) {
        console.error('Failed to start frontend server.');
        backendServer.kill();
        throw new Error('Failed to start frontend server.');
    }
    
    console.log('\nBoth servers should now be starting...');
    console.log(`Backend running on http://localhost:${BACKEND_PORT}`);
    console.log(`Frontend running on http://localhost:${FRONTEND_PORT}`);
    console.log('\nPress Ctrl+C to stop both servers.');
    
    // Handle script termination
    process.on('SIGINT', () => {
        console.log('\nShutting down servers...');
        backendServer && backendServer.kill();
        frontendServer && frontendServer.kill();
        process.exit(0);
    });
}

// Run the start function
start().catch(error => {
    console.error('Failed to start servers:', error);
    process.exit(1);
});
