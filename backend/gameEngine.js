const grid = Array.from({ length: 9 }, () => Array(12).fill(null));

// Represents a domino piece
class Domino {
  constructor(num1, num2) {
    this.num1 = num1;
    this.num2 = num2;
  }
}

// Adjusted to validate numbers 1–12
function isValidPlacement(grid, row, col, num) {
  if (num < 1 || num > 12) return false; // Ensure the number is within the valid range

  // Check row for already placed numbers
  for (let i = 0; i < 12; i++) {
    if (grid[row][i] === num) {
      return false;
    }
  }

  // Check column for already placed numbers
  for (let i = 0; i < 9; i++) {
    if (grid[i][col] === num) {
      return false;
    }
  }

  // Check 3x4 subgrid for already placed numbers
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 4) * 4;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[startRow + i][startCol + j] === num) {
        return false;
      }
    }
  }

  return true;
}

// Place a domino on the grid
function placeDomino(grid, row, col, domino, orientation) {
  const { num1, num2 } = domino;

  console.log(`Attempting to place domino: ${JSON.stringify(domino)} at (${row}, ${col}) with orientation: ${orientation}`);
  console.log(`Grid state before placement: ${JSON.stringify(grid)}`);

  if (orientation !== 'horizontal' && orientation !== 'vertical') {
    console.log(`Invalid orientation: ${orientation}`);
    return false;
  }

  // Step 1: Check for out-of-bounds
  if (orientation === 'horizontal' && (col < 0 || col + 1 >= grid[0].length)) {
    console.log(`Horizontal placement failed: Out of bounds at (${row}, ${col})`);
    return false;
  }
  if (orientation === 'vertical' && row + 1 >= grid.length) {
    console.log(`Vertical placement failed: Out of bounds at (${row}, ${col})`);
    return false;
  }

  // Step 2: Check for overlap
  if (orientation === 'horizontal' && (grid[row][col] !== null || grid[row][col + 1] !== null)) {
    console.log(`Horizontal placement failed: Overlap at (${row}, ${col})`);
    return false;
  }
  if (orientation === 'vertical' && (grid[row][col] !== null || grid[row + 1][col] !== null)) {
    console.log(`Vertical placement failed: Overlap at (${row}, ${col})`);
    return false;
  }

  // Step 3: Validate numbers
  if (orientation === 'horizontal' && (!isValidPlacement(grid, row, col, num1) || !isValidPlacement(grid, row, col + 1, num2))) {
    console.log(`Horizontal placement failed: Invalid numbers at (${row}, ${col})`);
    return false;
  }
  if (orientation === 'vertical' && (!isValidPlacement(grid, row, col, num1) || !isValidPlacement(grid, row + 1, col, num2))) {
    console.log(`Vertical placement failed: Invalid numbers at (${row}, ${col})`);
    return false;
  }

  // Placement is valid, update the grid
  if (orientation === 'horizontal') {
    grid[row][col] = num1;
    grid[row][col + 1] = num2;
  } else {
    grid[row][col] = num1;
    grid[row + 1][col] = num2;
  }

  console.log(`Placement successful. Grid state after placement: ${JSON.stringify(grid)}`);
  return true;
}

module.exports = { grid, Domino, isValidPlacement, placeDomino };