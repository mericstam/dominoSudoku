// Game Engine for Domino Sudoku

const grid = Array.from({ length: 9 }, () => Array(12).fill(null));
// Represents a domino piece
class Domino {
  constructor(num1, num2) {
    this.num1 = num1;
    this.num2 = num2;
  }
}

// Adjust the placement logic for the new grid size and 3x4 subgrids
function isValidPlacement(grid, row, col, num) {
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

function placeDomino(grid, row, col, domino, orientation) {
  const { num1, num2 } = domino;

  console.log(`Attempting to place domino at row: ${row}, col: ${col}, orientation: ${orientation}`);

  if (orientation === 'horizontal') {
    console.log(`Checking horizontal placement: col + 1 = ${col + 1}, grid width = ${grid[0].length}`);
    console.log(`Grid state at [${row}][${col}]: ${grid[row][col]}, at [${row}][${col + 1}]: ${col + 1 < grid[0].length ? grid[row][col + 1] : 'out of bounds'}`);
    if (
      col + 1 < grid[0].length && // Ensure within bounds for horizontal
      grid[row][col] === null && // Ensure the cell is empty
      grid[row][col + 1] === null && // Ensure the next cell is empty
      isValidPlacement(grid, row, col, num1) &&
      isValidPlacement(grid, row, col + 1, num2)
    ) {
      grid[row][col] = num1;
      grid[row][col + 1] = num2;
      return true;
    }
  } else if (orientation === 'vertical') {
    console.log(`Grid state at [${row}][${col}]: ${grid[row][col]}, at [${row + 1}][${col}]: ${row + 1 < grid.length ? grid[row + 1][col] : 'out of bounds'}`);
    if (
      row + 1 < grid.length && // Ensure within bounds for vertical
      grid[row][col] === null && // Ensure the cell is empty
      grid[row + 1][col] === null && // Ensure the next cell is empty
      isValidPlacement(grid, row, col, num1) &&
      isValidPlacement(grid, row + 1, col, num2) // Ensure placement is valid
    ) {
      grid[row][col] = num1;
      grid[row + 1][col] = num2; // Correctly place the second number in the same column
      return true;
    }
  }

  return false; // Invalid placement
}

module.exports = { grid, Domino, isValidPlacement, placeDomino };