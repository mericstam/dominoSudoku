// Create initial empty grid
const createEmptyGrid = () => Array.from({ length: 9 }, () => Array(12).fill(null));
const grid = createEmptyGrid();

// Constants for grid dimensions
const GRID_ROWS = 9;
const GRID_COLS = 12;
const SUBGRID_ROWS = 3;
const SUBGRID_COLS = 4;

// Represents a domino piece
class Domino {
  constructor(num1, num2) {
    this.num1 = num1;
    this.num2 = num2;
  }
}

/**
 * Validates if a number can be placed at the specified position
 * @param {Array<Array<number|null>>} grid - The game grid
 * @param {number} row - The row index
 * @param {number} col - The column index
 * @param {number} num - The number to validate
 * @returns {boolean} - Whether the placement is valid
 */
function isValidPlacement(grid, row, col, num) {
  // Early validation
  if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return false;
  if (num < 1 || num > 12) return false; // Ensure the number is within the valid range

  // Check row for already placed numbers
  for (let i = 0; i < GRID_COLS; i++) {
    if (grid[row][i] === num) {
      return false;
    }
  }

  // Check column for already placed numbers
  for (let i = 0; i < GRID_ROWS; i++) {
    if (grid[i][col] === num) {
      return false;
    }
  }

  // Check 3x4 subgrid for already placed numbers
  const startRow = Math.floor(row / SUBGRID_ROWS) * SUBGRID_ROWS;
  const startCol = Math.floor(col / SUBGRID_COLS) * SUBGRID_COLS;
  for (let i = 0; i < SUBGRID_ROWS; i++) {
    for (let j = 0; j < SUBGRID_COLS; j++) {
      if (grid[startRow + i][startCol + j] === num) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Place a domino on the grid
 * @param {Array<Array<number|null>>} grid - The game grid
 * @param {number} row - The row index
 * @param {number} col - The column index
 * @param {Domino} domino - The domino piece to place
 * @param {string} orientation - 'horizontal' or 'vertical'
 * @returns {boolean} - Whether the placement was successful
 */
function placeDomino(grid, row, col, domino, orientation) {
  // Debug flag - set to false in production
  const debug = false;
  
  const { num1, num2 } = domino;

  if (debug) {
    console.log(`Attempting to place domino: ${JSON.stringify(domino)} at (${row}, ${col}) with orientation: ${orientation}`);
  }

  // Early validation
  if (orientation !== 'horizontal' && orientation !== 'vertical') {
    if (debug) console.log(`Invalid orientation: ${orientation}`);
    return false;
  }

  // Determine the second cell position based on orientation
  const secondRow = orientation === 'horizontal' ? row : row + 1;
  const secondCol = orientation === 'horizontal' ? col + 1 : col;

  // Check bounds for both cells
  if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS ||
      secondRow < 0 || secondRow >= GRID_ROWS || secondCol < 0 || secondCol >= GRID_COLS) {
    if (debug) console.log(`Placement failed: Out of bounds at (${row}, ${col}) with orientation ${orientation}`);
    return false;
  }

  // Check for overlap
  if (grid[row][col] !== null || grid[secondRow][secondCol] !== null) {
    if (debug) console.log(`Placement failed: Overlap at (${row}, ${col}) with orientation ${orientation}`);
    return false;
  }

  // Validate numbers
  if (!isValidPlacement(grid, row, col, num1) || !isValidPlacement(grid, secondRow, secondCol, num2)) {
    if (debug) console.log(`Placement failed: Invalid numbers at (${row}, ${col}) with orientation ${orientation}`);
    return false;
  }

  // Placement is valid, update the grid
  grid[row][col] = num1;
  grid[secondRow][secondCol] = num2;

  if (debug) console.log(`Placement successful.`);
  return true;
}

/**
 * Finds all valid moves for a given domino
 * @param {Array<Array<number|null>>} grid - The game grid
 * @param {Domino} domino - The domino to place
 * @returns {Array<{row: number, col: number, orientation: string}>} - List of valid placements
 */
function findValidMoves(grid, domino) {
  const validMoves = [];
  const { num1, num2 } = domino;
  
  // Try placing in every position and orientation
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      // Try horizontal placement
      if (col + 1 < GRID_COLS) {
        if (placeDominoCheck(grid, row, col, domino, 'horizontal')) {
          validMoves.push({ row, col, orientation: 'horizontal' });
        }
      }
      
      // Try vertical placement
      if (row + 1 < GRID_ROWS) {
        if (placeDominoCheck(grid, row, col, domino, 'vertical')) {
          validMoves.push({ row, col, orientation: 'vertical' });
        }
      }
    }
  }
  
  return validMoves;
}

/**
 * Checks if a domino can be placed without actually placing it
 * @param {Array<Array<number|null>>} grid - The game grid
 * @param {number} row - The row index
 * @param {number} col - The column index
 * @param {Domino} domino - The domino piece to place
 * @param {string} orientation - 'horizontal' or 'vertical'
 * @returns {boolean} - Whether the placement is valid
 */
function placeDominoCheck(grid, row, col, domino, orientation) {
  const { num1, num2 } = domino;
  
  // Determine the second cell position based on orientation
  const secondRow = orientation === 'horizontal' ? row : row + 1;
  const secondCol = orientation === 'horizontal' ? col + 1 : col;
  
  // Check bounds for both cells
  if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS ||
      secondRow < 0 || secondRow >= GRID_ROWS || secondCol < 0 || secondCol >= GRID_COLS) {
    return false;
  }
  
  // Check for overlap
  if (grid[row][col] !== null || grid[secondRow][secondCol] !== null) {
    return false;
  }
  
  // Validate numbers
  return isValidPlacement(grid, row, col, num1) && 
         isValidPlacement(grid, secondRow, secondCol, num2);
}

/**
 * Checks if the grid is completely filled and valid
 * @param {Array<Array<number|null>>} grid - The game grid
 * @returns {boolean} - Whether the game is solved
 */
function isSolved(grid) {
  // Check if any cell is empty
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (grid[row][col] === null) {
        return false;
      }
    }
  }
  
  // If we get here, the grid is fully populated
  return true;
}

module.exports = { 
  grid, 
  createEmptyGrid,
  Domino, 
  isValidPlacement, 
  placeDomino, 
  findValidMoves,
  placeDominoCheck,
  isSolved,
  GRID_ROWS,
  GRID_COLS,
  SUBGRID_ROWS,
  SUBGRID_COLS
};