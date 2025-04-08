const { grid, Domino, isValidPlacement } = require('./gameEngine');

function generatePuzzle(difficulty = 'medium') {
  const grid = Array.from({ length: 9 }, () => Array(12).fill(null));
  const dominoes = [];

  for (let num1 = 1; num1 <= 12; num1++) {
    for (let num2 = num1 + 1; num2 <= 12; num2++) { // Ensure num2 > num1 to avoid duplicates and same-value dominoes
      dominoes.push({ num1, num2 });
    }
  }

  // Shuffle dominoes
  dominoes.sort(() => Math.random() - 0.5);

  // Determine the number of pre-placed dominoes based on difficulty
  const maxDominoes = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 10;
  let placedCount = 0;

  console.log(`Starting puzzle generation with difficulty: ${difficulty}`);
  console.log(`Max dominoes to place: ${maxDominoes}`);

  for (const domino of dominoes) {
    if (placedCount >= maxDominoes) {
      console.log(`Reached max dominoes: ${placedCount}`);
      break;
    }

    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 12);
    const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';

    if (placeDomino(grid, row, col, domino, orientation)) {
      placedCount++;
      console.log(`Placed domino: ${JSON.stringify(domino)} at (${row}, ${col}) with orientation: ${orientation}`);
    } else {
      console.log(`Failed to place domino: ${JSON.stringify(domino)} at (${row}, ${col}) with orientation: ${orientation}`);
    }
  }

  console.log(`Final placed domino count: ${placedCount}`);

  return { grid, dominoQueue: dominoes.slice(placedCount) };
}

function placeDomino(grid, row, col, domino, orientation) {
  if (orientation === 'horizontal') {
    if (
      col + 1 >= 12 ||
      grid[row][col] ||
      grid[row][col + 1] ||
      !isValidPlacement(grid, row, col, domino.num1) ||
      !isValidPlacement(grid, row, col + 1, domino.num2)
    ) {
      return false;
    }
    grid[row][col] = domino.num1;
    grid[row][col + 1] = domino.num2;
  } else {
    if (
      row + 1 >= 9 ||
      grid[row][col] ||
      grid[row + 1][col] ||
      !isValidPlacement(grid, row, col, domino.num1) ||
      !isValidPlacement(grid, row + 1, col, domino.num2)
    ) {
      return false;
    }
    grid[row][col] = domino.num1;
    grid[row + 1][col] = domino.num2;
  }
  return true;
}

// Generate a fully solved 9x9 Sudoku grid
function generateSolvedPuzzle() {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

  function isSafe(row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false;
    }

    // Check 3x3 subgrid
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[startRow + i][startCol + j] === num) return false;
      }
    }

    return true;
  }

  function solve() {
    for (let row = 0; row < 9; row++) {
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
  const usedCells = Array.from({ length: 9 }, () => Array(9).fill(false));

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