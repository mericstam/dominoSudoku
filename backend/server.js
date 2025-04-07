const express = require('express');
const { grid, Domino, isValidPlacement, placeDomino } = require('../frontend/src/shared/gameEngine');
const { generatePuzzle } = require('./puzzleGenerator');

const app = express();
const PORT = 3001;

// Middleware to parse JSON
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});