const { generatePuzzle } = require('./puzzleGenerator');
const { grid } = require('./gameEngine');

describe('Puzzle Generator Tests', () => {
  test('Generate easy puzzle', () => {
    const puzzle = generatePuzzle('easy');
    expect(puzzle).toBeDefined();
    expect(countPlacedDominoes(puzzle)).toBeLessThanOrEqual(10);
    expect(puzzle.flat().every(num => num === null || (num >= 1 && num <= 12))).toBe(true);
  });

  test('Generate medium puzzle', () => {
    const puzzle = generatePuzzle('medium');
    expect(puzzle).toBeDefined();
    expect(countPlacedDominoes(puzzle)).toBeLessThanOrEqual(30);
    expect(puzzle.flat().every(num => num === null || (num >= 1 && num <= 12))).toBe(true);
  });

  test('Generate hard puzzle', () => {
    const puzzle = generatePuzzle('hard');
    expect(puzzle).toBeDefined();
    expect(countPlacedDominoes(puzzle)).toBeLessThanOrEqual(40);
    expect(puzzle.flat().every(num => num === null || (num >= 1 && num <= 12))).toBe(true);
  });

  function countPlacedDominoes(grid) {
    let count = 0;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] !== null) count++;
      }
    }
    return count / 2; // Each domino occupies two cells
  }
});