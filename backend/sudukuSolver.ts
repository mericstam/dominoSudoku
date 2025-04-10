class Sudoku {
    grid: number[][];
    numberList: number[];
    attempts: number;
    counter: number;

    constructor() {
        this.grid = Array.from({ length: 9 }, () => Array(12).fill(0)); // Updated to 9x12 grid
        this.numberList = [1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12]; // Updated to include numbers 1-12
        this.attempts = 5;
        this.counter = 1;
    }

    drawGrid() {
        // Drawing logic can be implemented using a library like p5.js or similar
    }

    checkGrid(): boolean {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 12; col++) {
                if (this.grid[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    solveGrid(): boolean {
        for (let i = 0; i < 108; i++) {
            let row = Math.floor(i / 12);
            let col = i % 12;
            if (this.grid[row][col] === 0) {
                for (let value of this.numberList) {
                    if (!this.grid[row].includes(value) && !this.grid.map(r => r[col]).includes(value)) {
                        let square = this.getSquare(row, col);
                        if (!square.flat().includes(value)) {
                            this.grid[row][col] = value;
                            if (this.solveGrid()) {
                                return true;
                            }
                            this.grid[row][col] = 0; // Backtrack
                        }
                    }
                }
                return false; // If no value fits, backtrack
            }
        }
        return this.checkGrid(); // Ensure the grid is fully solved
    }

    fillGrid() {
        for (let i = 0; i < 108; i++) {
            let row = Math.floor(i / 12);
            let col = i % 12;
            if (this.grid[row][col] === 0) {
                this.shuffle(this.numberList);
                for (let value of this.numberList) {
                    if (!this.grid[row].includes(value) && !this.grid.map(r => r[col]).includes(value)) {
                        let square = this.getSquare(row, col);
                        if (!square.flat().includes(value)) {
                            this.grid[row][col] = value;
                            if (this.fillGrid()) {
                                return true;
                            }
                            this.grid[row][col] = 0; // Backtrack
                        }
                    }
                }
                return false; // If no value fits, backtrack
            }
        }
        return true; // Grid is successfully filled
    }

    getSquare(row: number, col: number): number[][] {
        let square: number[][] = [];
        let rowStart = Math.floor(row / 3) * 3;
        let colStart = Math.floor(col / 4) * 4; // Adjusted for 3x4 subgrids
        for (let r = rowStart; r < rowStart + 3; r++) {
            square.push(this.grid[r].slice(colStart, colStart + 4)); // Adjusted for 3x4 subgrids
        }
        return square;
    }

    shuffle(array: number[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    generateSudoku() {
        this.fillGrid();
        let attempts = this.attempts;
        while (attempts > 0) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 12);
            while (this.grid[row][col] === 0) {
                row = Math.floor(Math.random() * 9);
                col = Math.floor(Math.random() * 12);
            }
            let backup = this.grid[row][col];
            this.grid[row][col] = 0;

            let copyGrid = this.grid.map(row => row.slice());
            this.counter = 0;
            if (!this.solveGrid()) {
                this.grid[row][col] = backup;
            } else {
                attempts--;
            }
        }

        // Ensure the grid has empty cells
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 12; col++) {
                if (Math.random() < 0.5) {
                    this.grid[row][col] = 0;
                }
            }
        }
    }
}

let sudoku = new Sudoku();
sudoku.generateSudoku();

export { Sudoku };
