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

  // Check row
  for (let i = 0; i < 12; i++) {
    if (grid[row][i] === num) return false;
  }

  // Check column
  for (let i = 0; i < 9; i++) {
    if (grid[i][col] === num) return false;
  }

  // Check 3x4 subgrid
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 4) * 4;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[startRow + i][startCol + j] === num) return false;
    }
  }

  return true;
}

// Place a domino on the grid
function placeDomino(grid, row, col, domino, orientation) {
  const { num1, num2 } = domino;

  if (orientation === 'horizontal') {
    if (col + 1 < 12 && isValidPlacement(grid, row, col, num1) && isValidPlacement(grid, row, col + 1, num2)) {
      grid[row][col] = num1;
      grid[row][col + 1] = num2;
      return true;
    }
  } else if (orientation === 'vertical') {
    if (row + 1 < 9 && isValidPlacement(grid, row, col, num1) && isValidPlacement(grid, row + 1, col, num2)) {
      grid[row][col] = num1;
      grid[row + 1][col] = num2;
      return true;
    }
  }

  return false; // Invalid placement
}

module.exports = { grid, Domino, isValidPlacement, placeDomino };