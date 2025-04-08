const { generatePuzzle } = require('./puzzleGenerator');
const { grid } = require('./gameEngine');

describe('Puzzle Generator Tests', () => {
  test('Generate easy puzzle', () => {
    const puzzle = generatePuzzle('easy');
    expect(puzzle).toBeDefined();
    expect(countPlacedDominoes(puzzle.grid)).toBeLessThanOrEqual(10);
    expect(puzzle.grid.flat().every(num => num === null || (num >= 1 && num <= 12))).toBe(true);
  });

  test('Generate medium puzzle', () => {
    const puzzle = generatePuzzle('medium');
    expect(puzzle).toBeDefined();
    expect(countPlacedDominoes(puzzle.grid)).toBeLessThanOrEqual(30);
    expect(puzzle.grid.flat().every(num => num === null || (num >= 1 && num <= 12))).toBe(true);
  });

  test('Generate hard puzzle', () => {
    const puzzle = generatePuzzle('hard');
    expect(puzzle).toBeDefined();
    expect(countPlacedDominoes(puzzle.grid)).toBeLessThanOrEqual(40);
    expect(puzzle.grid.flat().every(num => num === null || (num >= 1 && num <= 12))).toBe(true);
  });

  test('Generate puzzle with invalid difficulty', () => {
    const puzzle = generatePuzzle('invalid');
    expect(puzzle).toBeDefined();
    expect(puzzle.grid).toBeDefined();
    expect(puzzle.dominoQueue).toBeDefined();
  });

  function countPlacedDominoes(grid) {
    let count = 0;
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j] !== null) count++;
      }
    }
    return count / 2; // Each domino occupies two cells
  }
});