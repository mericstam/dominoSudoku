// Simple puzzle generator implementation as requested
const { 
  Domino, 
  isValidPlacement,
  GRID_ROWS, 
  GRID_COLS,
  SUBGRID_ROWS,
  SUBGRID_COLS,
  createEmptyGrid
} = require('./gameEngine');

/**
 * Shuffle an array in place
 * @param {Array} array - The array to shuffle
 * @returns {Array} - The shuffled array (same reference as input)
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generates a puzzle with the specified difficulty level using the simplified approach:
 * 1. Create a solved grid using Sudoku rules
 * 2. Create domino pairs from the grid
 * 3. Remove all dominoes to queue
 * 4. Pre-place some dominoes based on difficulty
 * 
 * @param {string} difficulty - Difficulty level:
 *   'easy': More pre-placed dominoes (25-30) - easier to solve
 *   'medium': Moderate pre-placed dominoes (15-20)
 *   'hard': Fewer pre-placed dominoes (10-15) - harder to solve
 * @returns {Object} - The puzzle grid and domino queue
 */
function generatePuzzle(difficulty = 'medium') {
  // Adjust difficulty settings - determining how many dominoes to pre-place
  let difficultySettings = {
    easy: { placedDominoes: 27 },     // More pre-placed dominoes for easier puzzles
    medium: { placedDominoes: 20 },   // Balanced approach for medium difficulty
    hard: { placedDominoes: 14 }      // Fewer pre-placed dominoes for harder puzzles
  };
  
  // Get settings for the requested difficulty
  const settings = difficultySettings[difficulty] || difficultySettings.medium;
  
  // Step 1: Generate a solved grid using Sudoku rules
  const solvedGrid = generateSolvedPuzzle();
  console.log("Generated solved grid");

  // Step 2: Create domino pairs from the solved grid
  // Step 3: Remove them all to queue
  const { dominoPlacements, originalGrid } = createAndRemoveDominoes(solvedGrid);
  
  // Count horizontal and vertical dominoes
  const horizontalCount = dominoPlacements.filter(p => p.orientation === 'horizontal').length;
  const verticalCount = dominoPlacements.filter(p => p.orientation === 'vertical').length;
  console.log(`Generated domino list: ${horizontalCount} horizontal, ${verticalCount} vertical`);

  // Create a copy of all dominoes with solution info
  const allDominoes = dominoPlacements.map(placement => ({
    ...placement.domino,
    _solutionRow: placement.row,
    _solutionCol: placement.col,
    _solutionOrientation: placement.orientation
  }));
  // Step 4: Shuffle the queue
  shuffleArray(allDominoes);
  
  // Step 5: Determine how many dominoes to pre-place based on difficulty
  // Total dominoes should be exactly 54 (9x12 grid / 2 cells per domino)
  const totalDominoes = dominoPlacements.length;
  console.log(`Total dominoes: ${totalDominoes}`); // Should be 54
  
  if (totalDominoes !== 54) {
    throw new Error(`Error: Expected exactly 54 dominoes but got ${totalDominoes}`);
  }
  
  // Set the target number of pre-placed dominoes based on difficulty
  const targetPlaced = Math.min(settings.placedDominoes, totalDominoes - 1);
  
  // Step 6: Create empty grid and put some dominoes back based on difficulty
  const puzzleGrid = createEmptyGrid();
  const dominoQueue = [...allDominoes]; // Start with all dominoes in queue
  const prePlaced = [];
  
  // Pre-place dominoes based on difficulty
  for (let i = 0; i < targetPlaced && dominoQueue.length > 0; i++) {
    const dominoToPlace = dominoQueue.shift(); // Take from queue
    const { _solutionRow: row, _solutionCol: col, _solutionOrientation: orientation } = dominoToPlace;
    
    // Place the domino on the grid
    if (orientation === 'horizontal') {
      puzzleGrid[row][col] = dominoToPlace.num1;
      puzzleGrid[row][col + 1] = dominoToPlace.num2;
    } else { // vertical
      puzzleGrid[row][col] = dominoToPlace.num1;
      puzzleGrid[row + 1][col] = dominoToPlace.num2;
    }
    
    prePlaced.push({
      row,
      col,
      orientation,
      domino: { num1: dominoToPlace.num1, num2: dominoToPlace.num2 }
    });
  }
    console.log(`Pre-placed ${prePlaced.length} dominoes on the initial grid`);
  console.log(`Returning ${dominoQueue.length} dominoes in the queue`);
  
  // Validate: total dominoes should account for all cells
  const totalDominoCount = prePlaced.length + dominoQueue.length;
  if (totalDominoCount !== 54) {
    console.error(`Error: Total domino count is ${totalDominoCount}, expected 54`);
    throw new Error(`Invalid domino count: ${totalDominoCount}`);
  }
  
  // Validate that each pre-placed domino covers exactly 2 cells
  const coveredCells = new Set();
  for (const placement of prePlaced) {
    const { row, col, orientation } = placement;
    const cellKey1 = `${row},${col}`;
    coveredCells.add(cellKey1);
    
    if (orientation === 'horizontal') {
      const cellKey2 = `${row},${col+1}`;
      coveredCells.add(cellKey2);
    } else {
      const cellKey2 = `${row+1},${col}`;
      coveredCells.add(cellKey2);
    }
  }
  
  console.log(`Pre-placed dominoes cover ${coveredCells.size} cells`);
  
  return { 
    grid: puzzleGrid, 
    dominoQueue: dominoQueue,
    isSolvable: true // Always true with this approach
  };
}

/**
 * Creates and removes domino pairs from the solved grid
 * Using the exact domino covering algorithm to ensure all cells are covered
 * @param {Array<Array<number>>} solvedGrid - The solved puzzle grid
 * @returns {Object} - The domino placements and original grid
 */
function createAndRemoveDominoes(solvedGrid) {
  // Make a copy of the solved grid
  const originalGrid = solvedGrid.map(row => [...row]);
  
  // Create a grid to track which cells are already used in dominoes
  const usedCells = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
  
  // List to store all domino placements
  const dominoPlacements = [];
  
  // Using a "greedy with backtracking" approach to cover all cells with dominoes
  function coverWithDominoes() {
    // Find the first uncovered cell
    let startRow = -1;
    let startCol = -1;
    
    findNextCell:
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (!usedCells[row][col]) {
          startRow = row;
          startCol = col;
          break findNextCell;
        }
      }
    }
    
    // If all cells are covered, we're done
    if (startRow === -1) {
      return true;
    }
    
    // Try to cover the cell with a domino in each direction
    // We'll try horizontal first, then vertical
    const directions = [
      { orientation: 'horizontal', dr: 0, dc: 1 },
      { orientation: 'vertical', dr: 1, dc: 0 }
    ];
    
    // Shuffle the directions for variety
    shuffleArray(directions);
    
    for (const dir of directions) {
      const { orientation, dr, dc } = dir;
      const endRow = startRow + dr;
      const endCol = startCol + dc;
      
      // Check if the second cell is within bounds and not used
      if (
        endRow >= 0 && endRow < GRID_ROWS &&
        endCol >= 0 && endCol < GRID_COLS &&
        !usedCells[endRow][endCol]
      ) {
        // Cover both cells with a domino
        usedCells[startRow][startCol] = true;
        usedCells[endRow][endCol] = true;
        
        // Create the domino
        const num1 = solvedGrid[startRow][startCol];
        const num2 = solvedGrid[endRow][endCol];
        
        // Add to our domino placements list
        dominoPlacements.push({
          row: startRow,
          col: startCol,
          orientation,
          domino: new Domino(num1, num2)
        });
        
        // Continue covering the rest of the grid
        if (coverWithDominoes()) {
          return true;
        }
        
        // If we couldn't cover the rest of the grid, backtrack
        usedCells[startRow][startCol] = false;
        usedCells[endRow][endCol] = false;
        dominoPlacements.pop();
      }
    }
    
    // If we tried all directions and couldn't cover this cell, backtrack
    return false;
  }
  
  // Start covering all cells with dominoes
  const success = coverWithDominoes();
  
  // Verify that all cells are covered
  let uncoveredCells = 0;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (!usedCells[row][col]) {
        uncoveredCells++;
      }
    }
  }
  
  if (uncoveredCells > 0) {
    console.error(`Error: ${uncoveredCells} cells are not covered by dominoes`);
    throw new Error('Failed to cover all cells with dominoes');
  }
  
  // Check that we have exactly 54 dominoes (108 cells / 2)
  if (dominoPlacements.length !== 54) {
    console.error(`Error: Expected 54 dominoes but got ${dominoPlacements.length}`);
    throw new Error('Incorrect number of dominoes');
  }
  
  console.log(`Success: All cells covered with ${dominoPlacements.length} dominoes`);
  
  // Shuffle the domino placements for variety
  shuffleArray(dominoPlacements);
  
  return { dominoPlacements, originalGrid };
}

/**
 * Generates a solved puzzle grid following Sudoku rules
 * @returns {Array<Array<number>>} - The solved puzzle grid
 */
function generateSolvedPuzzle() {
  const grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(0));

  /**
   * Checks if it's safe to place a number at a specific position
   * @param {number} row - The row index
   * @param {number} col - The column index
   * @param {number} num - The number to check
   * @returns {boolean} - Whether the placement is safe
   */
  function isSafe(row, col, num) {
    // Check row
    for (let x = 0; x < GRID_COLS; x++) {
      if (grid[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < GRID_ROWS; x++) {
      if (grid[x][col] === num) return false;
    }

    // Check subgrid
    const startRow = Math.floor(row / SUBGRID_ROWS) * SUBGRID_ROWS;
    const startCol = Math.floor(col / SUBGRID_COLS) * SUBGRID_COLS;
    for (let i = 0; i < SUBGRID_ROWS; i++) {
      for (let j = 0; j < SUBGRID_COLS; j++) {
        if (grid[startRow + i][startCol + j] === num) return false;
      }
    }

    return true;
  }

  /**
   * Recursively solves the puzzle using backtracking
   * @returns {boolean} - Whether the puzzle was solved
   */
  function solve() {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (grid[row][col] === 0) {
          // Randomize the order of numbers to try
          const numbers = Array.from({ length: 12 }, (_, i) => i + 1);
          shuffleArray(numbers);
          
          for (const num of numbers) {
            if (isSafe(row, col, num)) {
              grid[row][col] = num;

              if (solve()) {
                return true;
              }

              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  solve();
  return grid;
}

module.exports = { generatePuzzle, generateSolvedPuzzle };