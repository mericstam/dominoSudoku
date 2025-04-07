const { grid, Domino, isValidPlacement, placeDomino } = require('./gameEngine');

describe('Game Engine Tests', () => {
  beforeEach(() => {
    // Reset the grid before each test
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
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
    expect(placeDomino(grid, 0, 8, domino, 'horizontal')).toBe(false);
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
});