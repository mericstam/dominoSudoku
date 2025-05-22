const { 
  generatePuzzle, 
  generateSolvedPuzzle 
} = require('./simplePuzzleGenerator');

const { 
  isValidPlacement, 
  GRID_ROWS, 
  GRID_COLS,
  SUBGRID_ROWS,
  SUBGRID_COLS
} = require('./gameEngine');

describe('Simple Puzzle Generator Tests', () => {
  
  describe('generateSolvedPuzzle', () => {
    test('should generate a valid solved 9x12 grid', () => {
      const solvedGrid = generateSolvedPuzzle();
      
      // Check dimensions
      expect(solvedGrid.length).toBe(GRID_ROWS);
      expect(solvedGrid[0].length).toBe(GRID_COLS);
      
      // Check that all cells are filled with values 1-12
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const value = solvedGrid[row][col];
          expect(value).toBeGreaterThanOrEqual(1);
          expect(value).toBeLessThanOrEqual(12);
        }
      }
    });    test('should have no repeated numbers in rows, columns, or subgrids', () => {
      const solvedGrid = generateSolvedPuzzle();
      
      // Check rows - each row should have unique numbers
      for (let row = 0; row < GRID_ROWS; row++) {
        const rowNumbers = new Set(solvedGrid[row]);
        expect(rowNumbers.size).toBe(GRID_COLS); // All values should be unique
      }
      
      // Check columns - each column should have unique numbers
      for (let col = 0; col < GRID_COLS; col++) {
        const colNumbers = new Set();
        for (let row = 0; row < GRID_ROWS; row++) {
          colNumbers.add(solvedGrid[row][col]);
        }
        expect(colNumbers.size).toBe(GRID_ROWS); // All values should be unique
      }
      
      // Check subgrids - each 3x4 subgrid should contain unique numbers
      for (let gridRow = 0; gridRow < 3; gridRow++) {
        for (let gridCol = 0; gridCol < 3; gridCol++) {
          const subgridNumbers = new Set();
          for (let row = 0; row < SUBGRID_ROWS; row++) {
            for (let col = 0; col < SUBGRID_COLS; col++) {
              subgridNumbers.add(solvedGrid[gridRow * SUBGRID_ROWS + row][gridCol * SUBGRID_COLS + col]);
            }
          }
          expect(subgridNumbers.size).toBe(SUBGRID_ROWS * SUBGRID_COLS); // All values should be unique
        }
      }
    });
  });
  
  describe('generatePuzzle', () => {
    test('should return a puzzle with a grid and domino queue', () => {
      const puzzle = generatePuzzle();
      
      // Check that puzzle object has the correct properties
      expect(puzzle).toHaveProperty('grid');
      expect(puzzle).toHaveProperty('dominoQueue');
      expect(puzzle).toHaveProperty('isSolvable');
      expect(puzzle.isSolvable).toBe(true);
    });
    
    test('should generate puzzles with the right number of pre-placed dominoes for each difficulty', () => {
      // Test easy difficulty (27 pre-placed dominoes)
      const easyPuzzle = generatePuzzle('easy');
      let easyFilledCells = 0;
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          if (easyPuzzle.grid[row][col] !== null) {
            easyFilledCells++;
          }
        }
      }
      // Each pre-placed domino covers 2 cells
      expect(easyFilledCells).toBe(27 * 2);
      
      // Test medium difficulty (20 pre-placed dominoes)
      const mediumPuzzle = generatePuzzle('medium');
      let mediumFilledCells = 0;
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          if (mediumPuzzle.grid[row][col] !== null) {
            mediumFilledCells++;
          }
        }
      }
      expect(mediumFilledCells).toBe(20 * 2);
      
      // Test hard difficulty (14 pre-placed dominoes)
      const hardPuzzle = generatePuzzle('hard');
      let hardFilledCells = 0;
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          if (hardPuzzle.grid[row][col] !== null) {
            hardFilledCells++;
          }
        }
      }
      expect(hardFilledCells).toBe(14 * 2);
    });
    
    test('pre-placed dominoes should follow Sudoku rules', () => {
      const puzzle = generatePuzzle();
      const grid = puzzle.grid;
      
      // Check that all pre-placed numbers respect Sudoku rules
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          if (grid[row][col] !== null) {
            // Temporarily remove the number to check if it's a valid placement
            const value = grid[row][col];
            grid[row][col] = null;
            
            expect(isValidPlacement(grid, row, col, value)).toBe(true);
            
            // Put the number back
            grid[row][col] = value;
          }
        }
      }
    });
    
    test('domino queue should have the correct length', () => {
      // Test different difficulties
      const easyPuzzle = generatePuzzle('easy');
      expect(easyPuzzle.dominoQueue.length).toBe(54 - 27); // 54 total dominoes, 27 pre-placed
      
      const mediumPuzzle = generatePuzzle('medium');
      expect(mediumPuzzle.dominoQueue.length).toBe(54 - 20); // 54 total dominoes, 20 pre-placed
      
      const hardPuzzle = generatePuzzle('hard');
      expect(hardPuzzle.dominoQueue.length).toBe(54 - 14); // 54 total dominoes, 14 pre-placed
    });
    
    test('dominoes in the queue should have solution hints', () => {
      const puzzle = generatePuzzle();
      
      // Check that each domino in the queue has solution hint properties
      puzzle.dominoQueue.forEach(domino => {
        expect(domino).toHaveProperty('_solutionRow');
        expect(domino).toHaveProperty('_solutionCol');
        expect(domino).toHaveProperty('_solutionOrientation');
        expect(['horizontal', 'vertical']).toContain(domino._solutionOrientation);
      });
    });
    
    test('total dominoes should always be 54 (9x12 grid / 2 cells per domino)', () => {
      const puzzle = generatePuzzle();
      
      // Count pre-placed dominoes (number of filled cells / 2)
      let prePlacedCells = 0;
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          if (puzzle.grid[row][col] !== null) {
            prePlacedCells++;
          }
        }
      }
      const prePlacedDominoes = prePlacedCells / 2;
      
      // Total dominoes should be 54
      expect(prePlacedDominoes + puzzle.dominoQueue.length).toBe(54);
    });
  });
});