const { grid, Domino, isValidPlacement } = require('./gameEngine');

// Corrected the grid dimensions to 9 columns and 12 rows in the generatePuzzle function
function generatePuzzle(difficulty = 'medium') {
  // Step 1: Generate a solved grid using Sudoku logic
  const solvedGrid = generateSolvedPuzzle();

  // Step 2: Convert the solved grid into a list of dominoes
  const dominoes = generateDominoListFromPuzzle(solvedGrid);

  // Step 3: Create a puzzle by removing some dominoes based on difficulty
  const maxDominoes = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
  const puzzleGrid = solvedGrid.map(row => row.slice()); // Create a copy of the solved grid
  let removedCount = 0;

  while (removedCount < maxDominoes) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 12);

    if (puzzleGrid[row][col] !== 0) {
      const backup = puzzleGrid[row][col];
      puzzleGrid[row][col] = 0;

      // Check if the puzzle is still solvable
      if (!solve(puzzleGrid)) {
        puzzleGrid[row][col] = backup; // Restore the value if not solvable
      } else {
        removedCount++;
      }
    }
  }

  // Step 4: Return the puzzle grid and remaining dominoes
  return { grid: puzzleGrid, dominoQueue: dominoes };
}

function placeDomino(grid, row, col, domino, orientation) {
  if (orientation === 'horizontal') {
    if (
      col + 1 >= grid[0].length || // Ensure the domino fits horizontally within the grid
      grid[row][col] !== null || // Check if the starting cell is empty
      grid[row][col + 1] !== null || // Check if the adjacent cell is empty
      !isValidPlacement(grid, row, col, domino.num1) || // Validate the first number
      !isValidPlacement(grid, row, col + 1, domino.num2) // Validate the second number
    ) {
      return false;
    }
    grid[row][col] = domino.num1;
    grid[row][col + 1] = domino.num2;
  } else if (orientation === 'vertical') {
    if (
      row + 1 >= grid.length || // Ensure the domino fits vertically within the grid
      grid[row][col] !== null || // Check if the starting cell is empty
      grid[row + 1][col] !== null || // Check if the cell below is empty
      !isValidPlacement(grid, row, col, domino.num1) || // Validate the first number
      !isValidPlacement(grid, row + 1, col, domino.num2) // Validate the second number
    ) {
      return false;
    }
    grid[row][col] = domino.num1;
    grid[row + 1][col] = domino.num2;
  } else {
    return false; // Invalid orientation
  }
  return true;
}

// Corrected the grid dimensions to 9 columns and 12 rows in the generateSolvedPuzzle function
function generateSolvedPuzzle() {
  const grid = Array.from({ length: 9 }, () => Array(12).fill(0));

  function isSafe(row, col, num) {
    // Check row
    for (let x = 0; x < 12; x++) {
      if (grid[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false;
    }

    // Check 3x3 subgrid
    const startRow = Math.floor(row / 4) * 4;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[startRow + i][startCol + j] === num) return false;
      }
    }

    return true;
  }

  function solve() {
    for (let row = 0; row < 12; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
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

// Generate a list of dominoes from a solved puzzle
function generateDominoListFromPuzzle(solvedPuzzle) {
  const dominoes = [];
  const usedCells = Array.from({ length: 9 }, () => Array(12).fill(false));

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (!usedCells[row][col]) {
        // Try to create a horizontal domino
        if (col + 1 < 9 && !usedCells[row][col + 1]) {
          dominoes.push({ num1: solvedPuzzle[row][col], num2: solvedPuzzle[row][col + 1] });
          usedCells[row][col] = true;
          usedCells[row][col + 1] = true;
        } else if (row + 1 < 9 && !usedCells[row + 1][col]) {
          // Try to create a vertical domino
          dominoes.push({ num1: solvedPuzzle[row][col], num2: solvedPuzzle[row + 1][col] });
          usedCells[row][col] = true;
          usedCells[row + 1][col] = true;
        }
      }
    }
  }

  // Shuffle the domino list to randomize the order
  for (let i = dominoes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dominoes[i], dominoes[j]] = [dominoes[j], dominoes[i]];
  }

  return dominoes;
}

module.exports = { generatePuzzle, generateSolvedPuzzle, generateDominoListFromPuzzle };