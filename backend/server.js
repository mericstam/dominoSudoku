const express = require('express');
const path = require('path');
const cors = require('cors');
const { grid, Domino, isValidPlacement, placeDomino } = require('./gameEngine');
const { generatePuzzle } = require('./puzzleGenerator');

const app = express();
const PORT = 3001;

// Middleware to parse JSON
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Endpoint to fetch a new puzzle
app.get('/api/puzzle', (req, res) => {
  const { difficulty } = req.query;
  const puzzle = generatePuzzle(difficulty || 'medium');
  console.log('Generated puzzle grid:', puzzle.grid);
  res.json({
    grid: puzzle.grid || Array.from({ length: 9 }, () => Array(12).fill(null)), // Fallback to empty grid
    dominoQueue: puzzle.dominoQueue || [], // Fallback to empty domino queue
  });
});

// Endpoint to submit a solution
app.post('/api/solution', (req, res) => {
  const { solution } = req.body;
  // Placeholder logic to validate the solution
  const isValid = solution.every((row) => row.every((cell) => cell !== null));
  res.json({ success: isValid });
});

// Endpoint to validate domino placement
app.post('/api/validate-placement', (req, res) => {
  const { grid, row, col, domino, orientation } = req.body;
  const { num1, num2 } = domino;

  const isValid = orientation === 'horizontal'
    ? col + 1 < 12 && isValidPlacement(grid, row, col, num1) && isValidPlacement(grid, row, col + 1, num2)
    : row + 1 < 9 && isValidPlacement(grid, row, col, num1) && isValidPlacement(grid, row + 1, col, num2);

  const invalidCells = [];
  if (!isValid) {
    if (orientation === 'horizontal') {
      if (!isValidPlacement(grid, row, col, num1)) invalidCells.push([row, col]);
      if (!isValidPlacement(grid, row, col + 1, num2)) invalidCells.push([row, col + 1]);
    } else {
      if (!isValidPlacement(grid, row, col, num1)) invalidCells.push([row, col]);
      if (!isValidPlacement(grid, row + 1, col, num2)) invalidCells.push([row + 1, col]);
    }
  }

  res.json({ isValid, invalidCells });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Catch-all handler to serve the React app for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

module.exports = { app, server };