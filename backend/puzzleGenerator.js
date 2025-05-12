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
 * Generates a puzzle with the specified difficulty level using the improved algorithm
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
  // This gives us the "solution" with a better balance of horizontal and vertical dominoes
  const allDominoPlacements = generateDominoListFromPuzzle(solvedGrid);
  
  // Debug logging for all dominoes and their placements
  console.log("All domino placements:");
  
  // Count horizontal and vertical dominoes
  const horizontalCount = allDominoPlacements.filter(p => p.orientation === 'horizontal').length;
  const verticalCount = allDominoPlacements.filter(p => p.orientation === 'vertical').length;
  console.log(`  Horizontal dominoes: ${horizontalCount}, Vertical dominoes: ${verticalCount}`);
  
  // List all domino placements
  allDominoPlacements.forEach((placement, idx) => {
    console.log(`  Domino ${idx}: ${placement.domino.num1}-${placement.domino.num2} at [${placement.row},${placement.col}] ${placement.orientation}`);
  });
  
  // Step 3: Create a shuffled copy of all domino placements
  // This will be our "queue" for placing dominoes
  const allPlacementsCopy = [...allDominoPlacements];
  shuffleArray(allPlacementsCopy);
  
  // Step 4: Determine which dominoes to pre-place vs put in the queue
  const totalDominoes = allDominoPlacements.length;
  const targetPlaced = Math.min(settings.placedDominoes, totalDominoes - 1); // Ensure at least one domino remains for the queue
  
  // Balance dominoes for initial placement too
  const placementsToPrePlace = [];
  let placedHorizontal = 0;
  let placedVertical = 0;
  
  // Try to maintain balance between horizontal and vertical in pre-placements too
  for (let i = 0; i < allPlacementsCopy.length && placementsToPrePlace.length < targetPlaced; i++) {
    const placement = allPlacementsCopy[i];
    
    // Skip if adding this would create too much imbalance
    if (placement.orientation === 'horizontal' && placedHorizontal > placedVertical + 3) {
      // Skip with high probability to favor vertical next time
      if (Math.random() < 0.8) continue;
    } else if (placement.orientation === 'vertical' && placedVertical > placedHorizontal + 3) {
      // Skip with high probability to favor horizontal next time
      if (Math.random() < 0.8) continue;
    }
    
    // Add to pre-placements and update counters
    placementsToPrePlace.push(placement);
    if (placement.orientation === 'horizontal') {
      placedHorizontal++;
    } else {
      placedVertical++;
    }
  }
  
  console.log(`Pre-placements balance: ${placedHorizontal} horizontal, ${placedVertical} vertical`);
  
  // Step 5: Create an empty puzzle grid
  const puzzleGrid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));
  
  // Step 6: Place the pre-selected dominoes on the grid
  // First try those that don't create consecutive sequences
  const placedPlacements = [];
  const remainingPlacements = [...allDominoPlacements];
  
  // Keep track of which cells are used
  const usedCells = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
  
  // Place dominoes that don't create consecutive sequences first
  for (const placement of placementsToPrePlace) {
    const { domino, row, col, orientation } = placement;
    
    // Skip if any cells for this placement are already used
    if (usedCells[row][col]) continue;
    if (orientation === 'horizontal' && usedCells[row][col + 1]) continue;
    if (orientation === 'vertical' && usedCells[row + 1][col]) continue;
    
    // Check if placing this domino would create consecutive sequences
    if (!createsConsecutiveSequence(puzzleGrid, row, col, domino, orientation)) {
      // Place the domino
      if (orientation === 'horizontal') {
        puzzleGrid[row][col] = domino.num1;
        puzzleGrid[row][col + 1] = domino.num2;
        usedCells[row][col] = true;
        usedCells[row][col + 1] = true;
      } else { // vertical
        puzzleGrid[row][col] = domino.num1;
        puzzleGrid[row + 1][col] = domino.num2;
        usedCells[row][col] = true;
        usedCells[row + 1][col] = true;
      }
      
      // Add to placed placements and remove from remaining
      placedPlacements.push(placement);
      
      // Remove from remaining placements
      const index = remainingPlacements.findIndex(p => 
        p.row === row && p.col === col && p.orientation === orientation);
      if (index !== -1) {
        remainingPlacements.splice(index, 1);
      }
      
      // Log the placement
      console.log(`Placed domino ${domino.num1}-${domino.num2} at [${row},${col}] ${orientation} (optimized)`);
    }
  }
  
  // If we need more pre-placed dominoes, add the ones that might create consecutive sequences
  const additionalNeeded = targetPlaced - placedPlacements.length;
  if (additionalNeeded > 0) {
    for (const placement of placementsToPrePlace) {
      // Skip if already placed
      if (placedPlacements.includes(placement)) continue;
      
      const { domino, row, col, orientation } = placement;
      
      // Skip if any cells for this placement are already used
      if (usedCells[row][col]) continue;
      if (orientation === 'horizontal' && usedCells[row][col + 1]) continue;
      if (orientation === 'vertical' && usedCells[row + 1][col]) continue;
      
      // Place the domino regardless of consecutive sequences
      if (orientation === 'horizontal') {
        puzzleGrid[row][col] = domino.num1;
        puzzleGrid[row][col + 1] = domino.num2;
        usedCells[row][col] = true;
        usedCells[row][col + 1] = true;
      } else { // vertical
        puzzleGrid[row][col] = domino.num1;
        puzzleGrid[row + 1][col] = domino.num2;
        usedCells[row][col] = true;
        usedCells[row + 1][col] = true;
      }
      
      // Add to placed placements and remove from remaining
      placedPlacements.push(placement);
      
      // Remove from remaining placements
      const index = remainingPlacements.findIndex(p => 
        p.row === row && p.col === col && p.orientation === orientation);
      if (index !== -1) {
        remainingPlacements.splice(index, 1);
      }
      
      // Log the placement
      console.log(`Placed domino ${domino.num1}-${domino.num2} at [${row},${col}] ${orientation} (non-optimized)`);
      
      // Stop if we've placed enough
      if (placedPlacements.length >= targetPlaced) break;
    }
  }
  
  // Step 7: Create the domino queue from remaining placements
  // Store placement info along with the domino
  const dominoQueue = remainingPlacements.map(placement => ({
    ...placement.domino,
    _solutionRow: placement.row,
    _solutionCol: placement.col,
    _solutionOrientation: placement.orientation
  }));
  
  // Reorganize dominoQueue to avoid consecutive sequences like 1-2, 3-4, 5-6
  const reorganizedQueue = avoidConsecutiveSequences(dominoQueue);
  
  console.log(`Placed ${placedPlacements.length} dominoes on the initial grid`);
  console.log(`Returning ${reorganizedQueue.length} dominoes in the queue`);
  
  // Log solution information for debugging hints
  console.log("Solution placements for queue dominoes:");
  reorganizedQueue.forEach((domino, idx) => {
    console.log(`  Domino ${idx}: ${domino.num1}-${domino.num2} solution: row=${domino._solutionRow}, col=${domino._solutionCol}, ${domino._solutionOrientation}`);
  });
  
  return { 
    grid: puzzleGrid, 
    dominoQueue: reorganizedQueue,
    isSolvable: true // Always true with this approach
  };
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
 * Solves a given puzzle
 * @param {Array<Array<number>>} grid - The puzzle grid to solve
 * @returns {boolean} - Whether the puzzle was solved
 */
function solvePuzzle(grid) {
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

  function solve() {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 12; num++) {
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

  return solve();
}

/**
 * Generate a list of dominoes from a solved puzzle with better orientation balance
 * @param {Array<Array<number>>} solvedPuzzle - The solved puzzle grid
 * @returns {Array<Object>} - List of domino placements with position and orientation info
 */
function generateDominoListFromPuzzle(solvedPuzzle) {
  // First, identify all possible domino placements (both horizontal and vertical)
  const allPossiblePlacements = [];
  
  // Track which cells have been considered for placements
  const consideredCells = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
  
  // Collect all possible placements
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (!consideredCells[row][col]) {
        // Check horizontal domino
        if (col + 1 < GRID_COLS) {
          allPossiblePlacements.push({
            domino: new Domino(solvedPuzzle[row][col], solvedPuzzle[row][col + 1]),
            row,
            col,
            orientation: 'horizontal'
          });
        }
        
        // Check vertical domino
        if (row + 1 < GRID_ROWS) {
          allPossiblePlacements.push({
            domino: new Domino(solvedPuzzle[row][col], solvedPuzzle[row + 1][col]),
            row,
            col,
            orientation: 'vertical'
          });
        }
        
        consideredCells[row][col] = true;
      }
    }
  }
  
  // Now, select dominoes to use, ensuring we have a balance of horizontal and vertical
  const selectedPlacements = [];
  const usedCells = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
  
  // Shuffle the possible placements to ensure randomness
  shuffleArray(allPossiblePlacements);
  
  // Track counts to aim for balance
  let horizontalCount = 0;
  let verticalCount = 0;
  
  // Process all possible placements
  for (const placement of allPossiblePlacements) {
    const { row, col, orientation } = placement;
    
    // Skip if any cells of this domino are already used
    if (usedCells[row][col]) continue;
    
    if (orientation === 'horizontal') {
      if (usedCells[row][col + 1]) continue;
      
      // When the horizontal/vertical ratio is unbalanced (too many horizontals),
      // give preference to verticals by skipping some horizontals
      if (horizontalCount > verticalCount + 3) {
        // Skip this horizontal with 80% probability to favor vertical next time
        if (Math.random() < 0.8) continue;
      }
      
      // Mark cells as used
      usedCells[row][col] = true;
      usedCells[row][col + 1] = true;
      horizontalCount++;
    } else { // vertical
      if (usedCells[row + 1][col]) continue;
      
      // When the horizontal/vertical ratio is unbalanced (too many verticals),
      // give preference to horizontals by skipping some verticals
      if (verticalCount > horizontalCount + 3) {
        // Skip this vertical with 80% probability to favor horizontal next time
        if (Math.random() < 0.8) continue;
      }
      
      // Mark cells as used
      usedCells[row][col] = true;
      usedCells[row + 1][col] = true;
      verticalCount++;
    }
    
    // Add this placement to our selected placements
    selectedPlacements.push(placement);
  }
  
  console.log(`Generated balanced domino list: ${horizontalCount} horizontal, ${verticalCount} vertical`);
  
  return selectedPlacements;
}

/**
 * Places a domino on the grid - wrapper for the gameEngine's placeDomino
 * @param {Array<Array<number|null>>} grid - The game grid
 * @param {number} row - The row index
 * @param {number} col - The column index
 * @param {Domino} domino - The domino piece to place
 * @param {string} orientation - 'horizontal' or 'vertical'
 * @returns {boolean} - Whether the placement was successful
 */
function placeDomino(grid, row, col, domino, orientation) {
  return enginePlaceDomino(grid, row, col, domino, orientation);
}

/**
 * Checks if two dominoes have consecutive numbers (e.g., 1-2 and 3-4)
 * @param {Domino} domino1 - The first domino
 * @param {Domino} domino2 - The second domino
 * @returns {boolean} - Whether the dominoes have consecutive numbers
 */
function areConsecutiveDominoes(domino1, domino2) {
  // Get all numbers from both dominoes
  const nums1 = [domino1.num1, domino1.num2];
  const nums2 = [domino2.num1, domino2.num2];
  
  // Check if any number in nums1 is consecutive with any number in nums2
  for (const n1 of nums1) {
    for (const n2 of nums2) {
      if (Math.abs(n1 - n2) === 1) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Reorganizes the domino queue to avoid consecutive sequences of numbers
 * @param {Array<Domino>} queue - The domino queue to reorganize
 * @returns {Array<Domino>} - The reorganized queue
 */
function avoidConsecutiveSequences(queue) {
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

/**
 * Determines if placing a domino at this position would create adjacent consecutive numbers
 * @param {Array<Array<number|null>>} grid - The current grid
 * @param {number} row - Row index to place domino
 * @param {number} col - Column index to place domino
 * @param {Domino} domino - The domino to place
 * @param {string} orientation - 'horizontal' or 'vertical'
 * @returns {boolean} - True if placement creates consecutive sequences
 */
function createsConsecutiveSequence(grid, row, col, domino, orientation) {
  const { num1, num2 } = domino;
  const secondRow = orientation === 'horizontal' ? row : row + 1;
  const secondCol = orientation === 'horizontal' ? col + 1 : col;
  
  // Check all adjacent cells to both domino positions
  const positions = [
    { row, col, num: num1 },
    { row: secondRow, col: secondCol, num: num2 }
  ];
  
  // Check all adjacent cells for consecutive numbers
  for (const pos of positions) {
    // Check cell above
    if (pos.row > 0 && grid[pos.row - 1][pos.col] !== null) {
      if (Math.abs(grid[pos.row - 1][pos.col] - pos.num) === 1) {
        return true;
      }
    }
    
    // Check cell below
    if (pos.row < GRID_ROWS - 1 && grid[pos.row + 1][pos.col] !== null) {
      if (Math.abs(grid[pos.row + 1][pos.col] - pos.num) === 1) {
        return true;
      }
    }
    
    // Check cell left
    if (pos.col > 0 && grid[pos.row][pos.col - 1] !== null) {
      if (Math.abs(grid[pos.row][pos.col - 1] - pos.num) === 1) {
        return true;
      }
    }
    
    // Check cell right
    if (pos.col < GRID_COLS - 1 && grid[pos.row][pos.col + 1] !== null) {
      if (Math.abs(grid[pos.row][pos.col + 1] - pos.num) === 1) {
        return true;
      }
    }
  }
  
  return false;
}

module.exports = { 
  generatePuzzle, 
  generateSolvedPuzzle, 
  generateDominoListFromPuzzle,
  solvePuzzle,
  placeDomino,
  avoidConsecutiveSequences
};
