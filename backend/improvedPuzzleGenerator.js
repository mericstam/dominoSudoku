// New improved puzzle generator implementation
const { 
  Domino, 
  isValidPlacement,
  placeDomino: enginePlaceDomino,
  placeDominoCheck,
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
 * Generates a puzzle with the specified difficulty level using the simplified approach
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
  
  // Step 1: Generate a solved grid using Sudoku logic
  const solvedGrid = generateSolvedPuzzle();
  console.log("Generated solved grid");

  // Step 2: Create balanced domino placements from the solved grid
  const dominoPlacements = createDominoPlacements(solvedGrid);
  
  // Count horizontal and vertical dominoes
  const horizontalCount = dominoPlacements.filter(p => p.orientation === 'horizontal').length;
  const verticalCount = dominoPlacements.filter(p => p.orientation === 'vertical').length;
  console.log(`Generated balanced domino list: ${horizontalCount} horizontal, ${verticalCount} vertical`);
  
  // Debug logging for all dominoes and their placements
  dominoPlacements.forEach((placement, idx) => {
    console.log(`  Domino ${idx}: ${placement.domino.num1}-${placement.domino.num2} at [${placement.row},${placement.col}] ${placement.orientation}`);
  });

  // Step 3: Create a shuffled copy of all dominoes for the queue
  const allDominoes = [...dominoPlacements];
  shuffleArray(allDominoes);
  
  // Step 4: Determine how many dominoes to pre-place based on difficulty
  const totalDominoes = dominoPlacements.length;
  const targetPlaced = Math.min(settings.placedDominoes, totalDominoes - 1);
  
  // Step 5: Create empty grid and put some dominoes back based on difficulty
  const puzzleGrid = createEmptyGrid();
  const prePlacedDominoes = [];
  const dominoQueue = [];
  
  // Take dominoes from the shuffled list until we have enough pre-placements
  for (let i = 0; i < allDominoes.length; i++) {
    const placement = allDominoes[i];
    
    if (prePlacedDominoes.length < targetPlaced) {
      // Pre-place this domino on the grid
      const { domino, row, col, orientation } = placement;
      
      if (orientation === 'horizontal') {
        puzzleGrid[row][col] = domino.num1;
        puzzleGrid[row][col + 1] = domino.num2;
      } else { // vertical
        puzzleGrid[row][col] = domino.num1;
        puzzleGrid[row + 1][col] = domino.num2;
      }
      
      prePlacedDominoes.push(placement);
      console.log(`Pre-placed domino ${domino.num1}-${domino.num2} at [${row},${col}] ${orientation}`);
    } else {
      // Add the rest to the queue
      const dominoWithSolution = {
        ...placement.domino,
        _solutionRow: placement.row,
        _solutionCol: placement.col,
        _solutionOrientation: placement.orientation
      };
      dominoQueue.push(dominoWithSolution);
    }
  }
  
  // Make sure the queue is well shuffled
  shuffleArray(dominoQueue);
  
  console.log(`Placed ${prePlacedDominoes.length} dominoes on the initial grid`);
  console.log(`Returning ${dominoQueue.length} dominoes in the queue`);
  
  // Log solution information for debugging hints
  console.log("Solution placements for queue dominoes:");
  dominoQueue.forEach((domino, idx) => {
    console.log(`  Domino ${idx}: ${domino.num1}-${domino.num2} solution: row=${domino._solutionRow}, col=${domino._solutionCol}, ${domino._solutionOrientation}`);
  });
  
  return { 
    grid: puzzleGrid, 
    dominoQueue: dominoQueue,
    isSolvable: true
  };
}

/**
 * Creates domino placements from a solved puzzle with balanced orientations
 * @param {Array<Array<number>>} solvedPuzzle - The solved puzzle grid
 * @returns {Array<Object>} - List of domino placements with position and orientation info
 */
function createDominoPlacements(solvedPuzzle) {
  // Track which cells have been used in a placement
  const usedCells = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
  
  // Collect all possible placements first
  const possiblePlacements = [];
  
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      // Skip if cell already used
      if (usedCells[row][col]) continue;
      
      // Check horizontal pair
      if (col + 1 < GRID_COLS && !usedCells[row][col + 1]) {
        possiblePlacements.push({
          domino: new Domino(solvedPuzzle[row][col], solvedPuzzle[row][col + 1]),
          row,
          col,
          orientation: 'horizontal'
        });
      }
      
      // Check vertical pair
      if (row + 1 < GRID_ROWS && !usedCells[row + 1][col]) {
        possiblePlacements.push({
          domino: new Domino(solvedPuzzle[row][col], solvedPuzzle[row + 1][col]),
          row,
          col,
          orientation: 'vertical'
        });
      }
    }
  }
  
  // Shuffle the possible placements for randomness
  shuffleArray(possiblePlacements);
  
  // Now select placements with balanced orientation
  const selectedPlacements = [];
  const finalUsedCells = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
  
  // Track counts to aim for balance
  let horizontalCount = 0;
  let verticalCount = 0;
  
  // Process all possible placements
  for (const placement of possiblePlacements) {
    const { row, col, orientation } = placement;
    
    // Skip if any cells of this domino are already used
    if (finalUsedCells[row][col]) continue;
    
    if (orientation === 'horizontal') {
      if (finalUsedCells[row][col + 1]) continue;
      
      // When the horizontal/vertical ratio is unbalanced (too many horizontals),
      // give preference to verticals by skipping some horizontals
      if (horizontalCount > verticalCount + 3) {
        // Skip this horizontal with 80% probability to favor vertical next time
        if (Math.random() < 0.8) continue;
      }
      
      // Mark cells as used
      finalUsedCells[row][col] = true;
      finalUsedCells[row][col + 1] = true;
      horizontalCount++;
    } else { // vertical
      if (finalUsedCells[row + 1][col]) continue;
      
      // When the horizontal/vertical ratio is unbalanced (too many verticals),
      // give preference to horizontals by skipping some verticals
      if (verticalCount > horizontalCount + 3) {
        // Skip this vertical with 80% probability to favor horizontal next time
        if (Math.random() < 0.8) continue;
      }
      
      // Mark cells as used
      finalUsedCells[row][col] = true;
      finalUsedCells[row + 1][col] = true;
      verticalCount++;
    }
    
    // Add this placement to our selected placements
    selectedPlacements.push(placement);
  }
  
  return selectedPlacements;
}

/**
 * Generates a solved puzzle grid
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
          for (let num = 1; num <= 12; num++) { // Use numbers 1-12 for the puzzle
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

/**
 * Avoid consecutive sequences in the queue
 * @param {Array<Object>} queue - The domino queue to reorganize
 * @returns {Array<Object>} - The reorganized queue
 */
function avoidConsecutiveSequences(queue) {
  // Check if two dominoes have consecutive numbers
  function areConsecutiveDominoes(domino1, domino2) {
    const nums1 = [domino1.num1, domino1.num2];
    const nums2 = [domino2.num1, domino2.num2];
    
    for (const n1 of nums1) {
      for (const n2 of nums2) {
        if (Math.abs(n1 - n2) === 1) {
          return true;
        }
      }
    }
    return false;
  }

  // Start with a shuffled copy of the queue
  const shuffled = [...queue];
  shuffleArray(shuffled);
  
  // Create a new queue avoiding consecutive sequences
  const result = [];
  
  // Start with the first domino
  if (shuffled.length > 0) {
    result.push(shuffled.shift());
  }
  
  // For each remaining domino, try to find one that doesn't form a sequence
  while (shuffled.length > 0) {
    let bestIndex = -1;
    
    // Find a domino that doesn't create a consecutive sequence with the last one
    for (let i = 0; i < shuffled.length; i++) {
      if (!areConsecutiveDominoes(result[result.length - 1], shuffled[i])) {
        bestIndex = i;
        break;
      }
    }
    
    // If we couldn't find a non-consecutive domino, just take the first one
    if (bestIndex === -1) {
      bestIndex = 0;
    }
    
    // Add the selected domino to the result
    result.push(shuffled.splice(bestIndex, 1)[0]);
  }
  
  return result;
}

module.exports = { 
  generatePuzzle, 
  generateSolvedPuzzle, 
  createDominoPlacements,
  avoidConsecutiveSequences
};
