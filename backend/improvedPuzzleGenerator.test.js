// Tests for the improved puzzle generator
const { 
  generatePuzzle, 
  generateSolvedPuzzle, 
  createDominoPlacements,
  avoidConsecutiveSequences
} = require('./improvedPuzzleGenerator');

const {
  GRID_ROWS,
  GRID_COLS,
  isValidPlacement,
  createEmptyGrid,
  Domino
} = require('./gameEngine');

describe('Improved Puzzle Generator', () => {
  describe('generateSolvedPuzzle', () => {
    test('should generate a valid solved puzzle grid', () => {
      const grid = generateSolvedPuzzle();
      
      // Check dimensions
      expect(grid.length).toBe(GRID_ROWS);
      expect(grid[0].length).toBe(GRID_COLS);
      
      // Check that all cells are filled
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          expect(grid[row][col]).toBeGreaterThanOrEqual(1);
          expect(grid[row][col]).toBeLessThanOrEqual(12);
        }
      }
      
      // Check rows for uniqueness
      for (let row = 0; row < GRID_ROWS; row++) {
        const set = new Set();
        for (let col = 0; col < GRID_COLS; col++) {
          set.add(grid[row][col]);
        }
        expect(set.size).toBe(GRID_COLS);
      }
      
      // Check columns for uniqueness
      for (let col = 0; col < GRID_COLS; col++) {
        const set = new Set();
        for (let row = 0; row < GRID_ROWS; row++) {
          set.add(grid[row][col]);
        }
        expect(set.size).toBe(GRID_ROWS);
      }
      
      // Check subgrids for uniqueness
      const SUBGRID_ROWS = 3;
      const SUBGRID_COLS = 4;
      
      for (let startRow = 0; startRow < GRID_ROWS; startRow += SUBGRID_ROWS) {
        for (let startCol = 0; startCol < GRID_COLS; startCol += SUBGRID_COLS) {
          const set = new Set();
          for (let i = 0; i < SUBGRID_ROWS; i++) {
            for (let j = 0; j < SUBGRID_COLS; j++) {
              set.add(grid[startRow + i][startCol + j]);
            }
          }
          expect(set.size).toBe(SUBGRID_ROWS * SUBGRID_COLS);
        }
      }
    });
  });
  
  describe('createDominoPlacements', () => {
    test('should create balanced domino placements from a solved puzzle', () => {
      const grid = generateSolvedPuzzle();
      const placements = createDominoPlacements(grid);
      
      // Check that we have placements
      expect(placements.length).toBeGreaterThan(0);
      
      // Check that all placements have the required properties
      placements.forEach(placement => {
        expect(placement).toHaveProperty('domino');
        expect(placement).toHaveProperty('row');
        expect(placement).toHaveProperty('col');
        expect(placement).toHaveProperty('orientation');
        expect(['horizontal', 'vertical']).toContain(placement.orientation);
      });
      
      // Check balance - difference should not be too extreme
      const horizontal = placements.filter(p => p.orientation === 'horizontal').length;
      const vertical = placements.filter(p => p.orientation === 'vertical').length;
      
      // Allow for some imbalance but not extreme
      expect(Math.abs(horizontal - vertical)).toBeLessThanOrEqual(10);
      
      // Check that each cell is used exactly once
      const usedCells = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
      let overlaps = 0;
      
      placements.forEach(placement => {
        const { row, col, orientation } = placement;
        
        if (orientation === 'horizontal') {
          if (usedCells[row][col] || usedCells[row][col + 1]) {
            overlaps++;
          }
          usedCells[row][col] = true;
          usedCells[row][col + 1] = true;
        } else { // vertical
          if (usedCells[row][col] || usedCells[row + 1][col]) {
            overlaps++;
          }
          usedCells[row][col] = true;
          usedCells[row + 1][col] = true;
        }
      });
      
      // No cells should be used in multiple dominoes
      expect(overlaps).toBe(0);
      
      // Check that all cells are used exactly once
      let unusedCells = 0;
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          if (!usedCells[row][col]) {
            unusedCells++;
          }
        }
      }
      expect(unusedCells).toBe(0);
    });
  });
  
  describe('generatePuzzle', () => {
    test('should generate a valid puzzle with easy difficulty', () => {
      const puzzle = generatePuzzle('easy');
      
      expect(puzzle).toHaveProperty('grid');
      expect(puzzle).toHaveProperty('dominoQueue');
      expect(puzzle).toHaveProperty('isSolvable');
      
      const { grid, dominoQueue } = puzzle;
      
      // Count non-null cells in the grid (should be about double the number of easy pre-placed dominoes)
      let nonNullCells = 0;
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          if (grid[row][col] !== null) {
            nonNullCells++;
          }
        }
      }
      
      // For easy, expect around 27 dominoes (54 cells) to be filled
      expect(nonNullCells).toBeGreaterThanOrEqual(50);
      
      // Check that queue dominoes have solution info
      dominoQueue.forEach(domino => {
        expect(domino).toHaveProperty('_solutionRow');
        expect(domino).toHaveProperty('_solutionCol');
        expect(domino).toHaveProperty('_solutionOrientation');
      });
    });
    
    test('should generate a valid puzzle with medium difficulty', () => {
      const puzzle = generatePuzzle('medium');
      
      const { grid } = puzzle;
      
      // Count non-null cells in the grid
      let nonNullCells = 0;
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          if (grid[row][col] !== null) {
            nonNullCells++;
          }
        }
      }
      
      // For medium, expect around 20 dominoes (40 cells) to be filled
      expect(nonNullCells).toBeGreaterThanOrEqual(35);
      expect(nonNullCells).toBeLessThanOrEqual(45);
    });
    
    test('should generate a valid puzzle with hard difficulty', () => {
      const puzzle = generatePuzzle('hard');
      
      const { grid } = puzzle;
      
      // Count non-null cells in the grid
      let nonNullCells = 0;
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          if (grid[row][col] !== null) {
            nonNullCells++;
          }
        }
      }
      
      // For hard, expect around 14 dominoes (28 cells) to be filled
      expect(nonNullCells).toBeGreaterThanOrEqual(24);
      expect(nonNullCells).toBeLessThanOrEqual(32);
    });
  });
  
  describe('avoidConsecutiveSequences', () => {
    test('should reorganize queue to avoid consecutive sequences where possible', () => {
      // Create some sample dominoes
      const dominoes = [
        new Domino(1, 2),
        new Domino(3, 4),
        new Domino(5, 6),
        new Domino(7, 8),
        new Domino(9, 10),
        new Domino(11, 12),
      ];
      
      const reorganized = avoidConsecutiveSequences(dominoes);
      
      // Check that the length is preserved
      expect(reorganized.length).toBe(dominoes.length);
      
      // Count consecutive sequences
      let consecutiveCount = 0;
      for (let i = 0; i < reorganized.length - 1; i++) {
        const d1 = reorganized[i];
        const d2 = reorganized[i + 1];
        
        const nums1 = [d1.num1, d1.num2];
        const nums2 = [d2.num1, d2.num2];
        
        for (const n1 of nums1) {
          for (const n2 of nums2) {
            if (Math.abs(n1 - n2) === 1) {
              consecutiveCount++;
              break;
            }
          }
        }
      }
      
      // For our sample, it's possible to arrange with 0 consecutive sequences
      expect(consecutiveCount).toBeLessThanOrEqual(2);
    });
  });
});
