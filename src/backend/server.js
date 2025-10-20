const express = require('express');
const path = require('path');
const cors = require('cors');
const { grid, Domino, isValidPlacement, placeDomino, isSolved, GRID_ROWS, GRID_COLS } = require('./gameEngine');
// Use the simple puzzle generator for better game experience
const { generatePuzzle } = require('./simplePuzzleGenerator');

const app = express();
const PORT = 3001;

// Middleware to parse JSON
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Endpoint to fetch a new puzzle
app.get('/api/puzzle', (req, res) => {
  const { difficulty } = req.query;
  
  // Generate a puzzle with the requested difficulty
  // Our new algorithm guarantees solvable puzzles
  console.log(`Generating puzzle with difficulty: ${difficulty || 'medium'}...`);
  const puzzle = generatePuzzle(difficulty || 'medium');
  const attempts = 1; // Always one attempt with the new algorithm
  
  console.log(`Generated puzzle with ${puzzle.dominoQueue.length} dominoes in queue`);
  
  const response = {
    grid: puzzle.grid || Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null)), // Fallback to empty grid
    dominoQueue: puzzle.dominoQueue || [], // Fallback to empty domino queue
    isSolvable: puzzle.isSolvable || false, // Include solvability information
    difficulty: difficulty || 'medium',
    generationAttempts: attempts
  };
  
  res.json(response);
});

// Endpoint to submit a solution
app.post('/api/solution', (req, res) => {
  const { solution } = req.body;
  
  // Check if the grid is completely filled (no null values)
  const isComplete = solution.every(row => row.every(cell => cell !== null));
  
  if (!isComplete) {
    console.log("Solution validation failed: Puzzle has empty cells");
    return res.json({ 
      success: false, 
      message: 'Puzzle is not complete - it has empty cells' 
    });
  }
  
  // Validate each cell according to Sudoku rules
  let isValid = true;
  const invalidPositions = [];
  
  // Check rows
  for (let row = 0; row < GRID_ROWS; row++) {
    const rowValues = new Set();
    for (let col = 0; col < GRID_COLS; col++) {
      const value = solution[row][col];
      if (value < 1 || value > 12 || rowValues.has(value)) {
        isValid = false;
        invalidPositions.push([row, col]);
      } else {
        rowValues.add(value);
      }
    }
  }
  
  // Check columns
  for (let col = 0; col < GRID_COLS; col++) {
    const colValues = new Set();
    for (let row = 0; row < GRID_ROWS; row++) {
      const value = solution[row][col];
      if (colValues.has(value)) {
        isValid = false;
        invalidPositions.push([row, col]);
      } else {
        colValues.add(value);
      }
    }
  }
  
  // Check 3x4 subgrids
  const SUBGRID_ROWS = 3;
  const SUBGRID_COLS = 4;
  
  for (let boxRow = 0; boxRow < GRID_ROWS / SUBGRID_ROWS; boxRow++) {
    for (let boxCol = 0; boxCol < GRID_COLS / SUBGRID_COLS; boxCol++) {
      const boxValues = new Set();
      for (let row = 0; row < SUBGRID_ROWS; row++) {
        for (let col = 0; col < SUBGRID_COLS; col++) {
          const value = solution[boxRow * SUBGRID_ROWS + row][boxCol * SUBGRID_COLS + col];
          if (boxValues.has(value)) {
            isValid = false;
            invalidPositions.push([boxRow * SUBGRID_ROWS + row, boxCol * SUBGRID_COLS + col]);
          } else {
            boxValues.add(value);
          }
        }
      }
    }
  }
  
  res.json({ 
    success: isValid,
    message: isValid ? 'Puzzle solution is valid!' : 'Puzzle solution has errors',
    invalidPositions: isValid ? [] : invalidPositions
  });
});

// Endpoint to validate domino placement
app.post('/api/validate-placement', (req, res) => {
  const { grid, row, col, domino, orientation } = req.body;
  const { num1, num2 } = domino;

  const isValid = orientation === 'horizontal'
    ? col + 1 < GRID_COLS && isValidPlacement(grid, row, col, num1) && isValidPlacement(grid, row, col + 1, num2)
    : row + 1 < GRID_ROWS && isValidPlacement(grid, row, col, num1) && isValidPlacement(grid, row + 1, col, num2);

  const invalidCells = [];
  if (!isValid) {
    if (orientation === 'horizontal') {
      if (!isValidPlacement(grid, row, col, num1)) invalidCells.push([row, col]);
      if (col + 1 < GRID_COLS && !isValidPlacement(grid, row, col + 1, num2)) invalidCells.push([row, col + 1]);
    } else {
      if (!isValidPlacement(grid, row, col, num1)) invalidCells.push([row, col]);
      if (row + 1 < GRID_ROWS && !isValidPlacement(grid, row + 1, col, num2)) invalidCells.push([row + 1, col]);
    }
  }

  res.json({ isValid, invalidCells });
});

// Add a hint endpoint to help users when they're stuck
app.post('/api/hint', (req, res) => {
  const { grid, dominoQueue } = req.body;
  
  if (!dominoQueue || dominoQueue.length === 0) {
    return res.json({ success: false, message: 'No dominoes left to place' });
  }
  
  const currentDomino = dominoQueue[0];
  
  // Debug log the current grid state and domino
  console.log(`Hint requested for domino: ${currentDomino.num1}-${currentDomino.num2}`);
  console.log("Current grid state:");
  grid.forEach((row, rowIdx) => {
    console.log(`  Row ${rowIdx}: ${row.join(' ')}`);
  });
  
  // Create temporary grid copy for testing
  const tempGrid = grid.map(row => [...row]);
    // Check if this domino has solution placement information
  if (currentDomino._solutionRow !== undefined && 
      currentDomino._solutionCol !== undefined && 
      currentDomino._solutionOrientation !== undefined) {
    
    console.log(`Found solution placement for this domino: row=${currentDomino._solutionRow}, col=${currentDomino._solutionCol}, ${currentDomino._solutionOrientation}`);
    
    // Check if this solution placement is still valid (cells are empty)
    const row = currentDomino._solutionRow;
    const col = currentDomino._solutionCol;
    const orientation = currentDomino._solutionOrientation;
    
    if (orientation === 'horizontal' &&
        col + 1 < GRID_COLS &&
        tempGrid[row][col] === null && 
        tempGrid[row][col + 1] === null &&
        isValidPlacement(tempGrid, row, col, currentDomino.num1) && 
        isValidPlacement(tempGrid, row, col + 1, currentDomino.num2)) {
          
      console.log("The solution placement is valid!");
      return res.json({
        success: true,
        hint: {
          row,
          col,
          orientation,
          flipped: false
        }
      });
    }
    else if (orientation === 'vertical' &&
             row + 1 < GRID_ROWS &&
             tempGrid[row][col] === null && 
             tempGrid[row + 1][col] === null &&
             isValidPlacement(tempGrid, row, col, currentDomino.num1) && 
             isValidPlacement(tempGrid, row + 1, col, currentDomino.num2)) {
               
      console.log("The solution placement is valid!");
      return res.json({
        success: true,
        hint: {
          row,
          col,
          orientation,
          flipped: false
        }
      });
    }
    
    console.log("The original solution placement is no longer valid, trying alternative placements...");
  } else {
    console.log("No solution placement information found for this domino, trying all possibilities...");
  }
    // Check if the current domino is flippable (num1 and num2 are different)
  const isFlippable = currentDomino.num1 !== currentDomino.num2;
  const dominoesToTry = isFlippable ? 
    [currentDomino, { num1: currentDomino.num2, num2: currentDomino.num1 }] : 
    [currentDomino];
  
  // Helper function to check if a placement creates consecutive sequences
  function createsConsecutiveSequence(grid, row, col, num, secondRow, secondCol, secondNum) {
    // Check if num is consecutive with any adjacent numbers in the grid
    
    // Directions to check: up, right, down, left
    const dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    
    // Check first number's adjacencies
    for (const [dr, dc] of dirs) {
      const r = row + dr;
      const c = col + dc;
      
      // Skip if this is the position of the second number
      if (r === secondRow && c === secondCol) continue;
      
      // Skip if out of bounds
      if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) continue;
      
      // Skip empty cells
      if (grid[r][c] === null) continue;
      
      // Check if consecutive
      if (Math.abs(grid[r][c] - num) === 1) {
        return true;
      }
    }
    
    // Check second number's adjacencies
    for (const [dr, dc] of dirs) {
      const r = secondRow + dr;
      const c = secondCol + dc;
      
      // Skip if this is the position of the first number
      if (r === row && c === col) continue;
      
      // Skip if out of bounds
      if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) continue;
      
      // Skip empty cells
      if (grid[r][c] === null) continue;
      
      // Check if consecutive
      if (Math.abs(grid[r][c] - secondNum) === 1) {
        return true;
      }
    }
    
    return false;
  }
  
  // Find all valid placements and prioritize those that don't create consecutive sequences
  const validPlacements = [];
  
  for (const dominoVariant of dominoesToTry) {
    // Check horizontal placements
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (col + 1 < GRID_COLS && 
            tempGrid[row][col] === null && 
            tempGrid[row][col + 1] === null &&
            isValidPlacement(tempGrid, row, col, dominoVariant.num1) && 
            isValidPlacement(tempGrid, row, col + 1, dominoVariant.num2)) {
          
          const placement = {
            row,
            col,
            orientation: 'horizontal',
            flipped: dominoVariant.num1 !== currentDomino.num1,
            createsConsecutive: createsConsecutiveSequence(
              tempGrid, row, col, dominoVariant.num1, row, col + 1, dominoVariant.num2
            )
          };
          
          validPlacements.push(placement);
        }
      }
    }
    
    // Check vertical placements
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (row + 1 < GRID_ROWS && 
            tempGrid[row][col] === null && 
            tempGrid[row + 1][col] === null &&
            isValidPlacement(tempGrid, row, col, dominoVariant.num1) && 
            isValidPlacement(tempGrid, row + 1, col, dominoVariant.num2)) {
          
          const placement = {
            row,
            col,
            orientation: 'vertical',
            flipped: dominoVariant.num1 !== currentDomino.num1,
            createsConsecutive: createsConsecutiveSequence(
              tempGrid, row, col, dominoVariant.num1, row + 1, col, dominoVariant.num2
            )
          };
          
          validPlacements.push(placement);
        }
      }
    }
  }
  
  // If we have valid placements, first prioritize those that don't create consecutive sequences
  if (validPlacements.length > 0) {
    // First try to find placements that don't create consecutive sequences
    const nonConsecutivePlacements = validPlacements.filter(p => !p.createsConsecutive);
    
    if (nonConsecutivePlacements.length > 0) {
      // Pick the first non-consecutive placement
      const bestPlacement = nonConsecutivePlacements[0];
      console.log("Found a placement that doesn't create consecutive sequences");
      return res.json({
        success: true,
        hint: {
          row: bestPlacement.row,
          col: bestPlacement.col,
          orientation: bestPlacement.orientation,
          flipped: bestPlacement.flipped
        }
      });
    }
    
    // If we can't avoid consecutive sequences, just use the first valid placement
    console.log("No non-consecutive placements found, using standard placement");
    const fallbackPlacement = validPlacements[0];
    return res.json({
      success: true,
      hint: {
        row: fallbackPlacement.row,
        col: fallbackPlacement.col,
        orientation: fallbackPlacement.orientation,
        flipped: fallbackPlacement.flipped
      }
    });
  }
    // If no valid placement was found for the current domino
  console.log(`No valid placement found for domino ${currentDomino.num1}-${currentDomino.num2}`);
  
  // Count null cells to check if there's enough space
  let nullCellCount = 0;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (tempGrid[row][col] === null) {
        nullCellCount++;
      }
    }
  }
  console.log(`Grid has ${nullCellCount} empty cells`);
  
  // Check for specific placement issues
  let horizontalSpaces = 0;
  let verticalSpaces = 0;
  let blockedByRules = 0;
  
  // Log detailed placement checks
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      // Check horizontal placements
      if (col + 1 < GRID_COLS && 
          tempGrid[row][col] === null && 
          tempGrid[row][col + 1] === null) {
        horizontalSpaces++;
        
        // Check why this placement fails
        if (!isValidPlacement(tempGrid, row, col, currentDomino.num1)) {
          console.log(`Horizontal failed at [${row},${col}]: first number ${currentDomino.num1} not valid`);
          blockedByRules++;
        } else if (!isValidPlacement(tempGrid, row, col + 1, currentDomino.num2)) {
          console.log(`Horizontal failed at [${row},${col}]: second number ${currentDomino.num2} not valid`);
          blockedByRules++;
        }
      }
      
      // Check vertical placements
      if (row + 1 < GRID_ROWS && 
          tempGrid[row][col] === null && 
          tempGrid[row + 1][col] === null) {
        verticalSpaces++;
        
        // Check why this placement fails
        if (!isValidPlacement(tempGrid, row, col, currentDomino.num1)) {
          console.log(`Vertical failed at [${row},${col}]: first number ${currentDomino.num1} not valid`);
          blockedByRules++;
        } else if (!isValidPlacement(tempGrid, row + 1, col, currentDomino.num2)) {
          console.log(`Vertical failed at [${row},${col}]: second number ${currentDomino.num2} not valid`);
          blockedByRules++;
        }
      }
    }
  }
  
  console.log(`Found ${horizontalSpaces} horizontal spaces, ${verticalSpaces} vertical spaces`);
  console.log(`${blockedByRules} potential placements blocked by Sudoku rules`);
  
  res.json({
    success: false,
    message: 'No valid placement found for the current domino. The puzzle may be unsolvable, try starting a new game.',
    deadEnd: true
  });
});

// Health check endpoint for server status monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all handler to serve the React app for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Only start the server if this file is being run directly, not if it's being required by tests
if (require.main === module) {
  const server = app.listen(PORT, (err) => {
    if (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  
  // Handle server errors
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`ERROR: Port ${PORT} is already in use. Please free the port and try again.`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('Server has been closed');
      process.exit(0);
    });
  });
}

module.exports = { app };