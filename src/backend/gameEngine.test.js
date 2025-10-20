const { 
  grid, 
  createEmptyGrid,
  Domino, 
  isValidPlacement, 
  placeDomino, 
  findValidMoves,
  placeDominoCheck,
  isSolved,
  GRID_ROWS,
  GRID_COLS 
} = require('./gameEngine');

describe('Game Engine Tests', () => {
  beforeEach(() => {
    // Reset the grid before each test
    for (let i = 0; i < GRID_ROWS; i++) {
      for (let j = 0; j < GRID_COLS; j++) {
        grid[i][j] = null;
      }
    }
  });

  // Updated test cases to validate numbers 1–12
  test('Valid placement of a single number', () => {
    expect(isValidPlacement(grid, 0, 0, 12)).toBe(true);
    grid[0][0] = 12;
    expect(isValidPlacement(grid, 0, 1, 12)).toBe(false); // Same row
    expect(isValidPlacement(grid, 1, 0, 12)).toBe(false); // Same column
    expect(isValidPlacement(grid, 1, 1, 12)).toBe(false); // Same subgrid
  });

  test('Valid horizontal domino placement', () => {
    const domino = new Domino(11, 12);
    expect(placeDomino(grid, 0, 0, domino, 'horizontal')).toBe(true);
    expect(grid[0][0]).toBe(11);
    expect(grid[0][1]).toBe(12);
  });

  test('Invalid horizontal domino placement (out of bounds)', () => {
    const domino = new Domino(3, 5);
    expect(placeDomino(grid, 0, 11, domino, 'horizontal')).toBe(false); // Adjusted to test actual out-of-bounds case
  });

  test('Valid vertical domino placement', () => {
    const domino = new Domino(10, 12);
    expect(placeDomino(grid, 0, 0, domino, 'vertical')).toBe(true);
    expect(grid[0][0]).toBe(10);
    expect(grid[1][0]).toBe(12);
  });

  test('Invalid vertical domino placement (out of bounds)', () => {
    const domino = new Domino(6, 7);
    expect(placeDomino(grid, 8, 0, domino, 'vertical')).toBe(false);
  });

  test('Invalid placement with out-of-range number', () => {
    expect(isValidPlacement(grid, 0, 0, 0)).toBe(false); // Number too low
    expect(isValidPlacement(grid, 0, 0, 13)).toBe(false); // Number too high
  });

  test('Invalid domino placement with overlapping cells', () => {
    const domino1 = new Domino(5, 6);
    const domino2 = new Domino(7, 8);
    placeDomino(grid, 0, 0, domino1, 'horizontal');
    expect(placeDomino(grid, 0, 1, domino2, 'horizontal')).toBe(false); // Overlaps with domino1
  });

  test('createEmptyGrid creates a grid of the correct size', () => {
    const newGrid = createEmptyGrid();
    expect(newGrid.length).toBe(GRID_ROWS);
    expect(newGrid[0].length).toBe(GRID_COLS);
    // Check that all cells are null
    for (let i = 0; i < GRID_ROWS; i++) {
      for (let j = 0; j < GRID_COLS; j++) {
        expect(newGrid[i][j]).toBeNull();
      }
    }
  });

  test('placeDominoCheck validates without modifying grid', () => {
    const domino = new Domino(3, 4);
    // Should be valid
    expect(placeDominoCheck(grid, 0, 0, domino, 'horizontal')).toBe(true);
    // Grid should remain unchanged
    expect(grid[0][0]).toBeNull();
    expect(grid[0][1]).toBeNull();
  });

  test('findValidMoves finds all possible placements', () => {
    const domino = new Domino(1, 2);
    // Place some numbers to restrict valid moves
    grid[0][0] = 1; // This blocks using 1 at this position
    
    const validMoves = findValidMoves(grid, domino);
    expect(validMoves.length).toBeGreaterThan(0);
    
    // Check the first valid move
    const firstMove = validMoves[0];
    expect(placeDomino(grid, firstMove.row, firstMove.col, domino, firstMove.orientation)).toBe(true);
  });

  test('isSolved returns false for incomplete grid', () => {
    expect(isSolved(grid)).toBe(false);
    
    // Fill most of the grid but leave one cell empty
    for (let i = 0; i < GRID_ROWS; i++) {
      for (let j = 0; j < GRID_COLS; j++) {
        if (i !== 0 || j !== 0) {
          grid[i][j] = ((i * GRID_COLS + j) % 12) + 1;
        }
      }
    }
    
    expect(isSolved(grid)).toBe(false);
    
    // Fill the last cell
    grid[0][0] = 1;
    expect(isSolved(grid)).toBe(true);
  });
});