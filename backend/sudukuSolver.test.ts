import { Sudoku } from './sudukuSolver';

describe('Sudoku Class Tests', () => {
    let sudoku: Sudoku;

    beforeEach(() => {
        sudoku = new Sudoku();
    });

    test('Grid should be initialized with 9x12 dimensions', () => {
        expect(sudoku.grid.length).toBe(9);
        expect(sudoku.grid[0].length).toBe(12);
    });

    test('Check grid should return false for incomplete grid', () => {
        expect(sudoku.checkGrid()).toBe(false);
    });

    test('Check grid should return true for fully filled grid', () => {
        sudoku.grid = Array.from({ length: 9 }, () => Array(12).fill(1));
        expect(sudoku.checkGrid()).toBe(true);
    });

    test('getSquare should return correct 3x4 subgrid', () => {
        sudoku.grid[0][0] = 1;
        sudoku.grid[0][1] = 2;
        sudoku.grid[1][0] = 3;
        sudoku.grid[1][1] = 4;

        const square = sudoku.getSquare(0, 0);
        expect(square).toEqual([
            [1, 2, 0, 0],
            [3, 4, 0, 0],
            [0, 0, 0, 0],
        ]);
    });

    test('fillGrid should populate the grid with valid numbers', () => {
        sudoku.fillGrid();
        expect(sudoku.checkGrid()).toBe(true);
    });

    test('solveGrid should solve an incomplete grid', () => {
        sudoku.grid[0][0] = 1;
        sudoku.grid[0][1] = 2;
        sudoku.grid[1][0] = 3;
        sudoku.grid[1][1] = 4;
        sudoku.solveGrid();
        expect(sudoku.checkGrid()).toBe(true);
    });

    test('generateSudoku should create a valid Sudoku puzzle', () => {
        sudoku.generateSudoku();
        expect(sudoku.checkGrid()).toBe(false); // Puzzle should have empty cells
    });
});