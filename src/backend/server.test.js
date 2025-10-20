const request = require('supertest');
const { app } = require('./server');

describe('Server API Tests', () => {
  test('GET /api/puzzle - Fetch puzzle with default difficulty', async () => {
    const response = await request(app).get('/api/puzzle');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('grid');
    expect(response.body).toHaveProperty('dominoQueue');
    expect(Array.isArray(response.body.grid)).toBe(true);
    expect(response.body.grid.length).toBe(9); // 9 rows
    expect(response.body.grid[0].length).toBe(12); // 12 columns
    expect(Array.isArray(response.body.dominoQueue)).toBe(true);
  });
  
  test('GET /api/puzzle - Fetch puzzle with easy difficulty', async () => {
    const response = await request(app).get('/api/puzzle?difficulty=easy');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('grid');
    expect(response.body).toHaveProperty('dominoQueue');
  });
  
  test('GET /api/puzzle - Fetch puzzle with medium difficulty', async () => {
    const response = await request(app).get('/api/puzzle?difficulty=medium');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('grid');
    expect(response.body).toHaveProperty('dominoQueue');
  });
  
  test('GET /api/puzzle - Fetch puzzle with hard difficulty', async () => {
    const response = await request(app).get('/api/puzzle?difficulty=hard');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('grid');
    expect(response.body).toHaveProperty('dominoQueue');
  });
  
  test('POST /api/validate-placement - Valid placement', async () => {
    const payload = {
      grid: Array(9).fill().map(() => Array(12).fill(null)),
      row: 0,
      col: 0,
      domino: { num1: 1, num2: 2 },
      orientation: 'horizontal',
    };
    const response = await request(app).post('/api/validate-placement').send(payload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('isValid', true);
  });
  test('POST /api/validate-placement - Invalid placement', async () => {
    // Set up a grid with number 5 at position (0,0)
    const grid = Array(9).fill().map(() => Array(12).fill(null));
    grid[0][0] = 5; // Put a 5 at (0,0)
    
    // Try to place a domino with the same number (5) elsewhere in the same row
    // This violates Sudoku rules (no repeated numbers in a row)
    const payload = {
      grid,
      row: 0,
      col: 2, // Different column in same row
      domino: { num1: 5, num2: 6 }, // First number is already in this row
      orientation: 'horizontal',
    };
    const response = await request(app).post('/api/validate-placement').send(payload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('isValid', false);
    expect(response.body).toHaveProperty('invalidCells');
    expect(Array.isArray(response.body.invalidCells)).toBe(true);
  });
    test('POST /api/solution - Submit valid solution', async () => {
    // Generate a valid solution grid using the same method as simplePuzzleGenerator
    const { generateSolvedPuzzle } = require('./simplePuzzleGenerator');
    const validGrid = generateSolvedPuzzle(); 
    
    const payload = { solution: validGrid };
    const response = await request(app).post('/api/solution').send(payload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
  
  test('POST /api/solution - Submit invalid solution', async () => {
    // Create an invalid solution with duplicate values in a row
    const invalidGrid = [
      [1, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Duplicate 1 in first row
      [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1],
      [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2],
      [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3],
      [5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4],
      [6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5],
      [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6],
      [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7],
      [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8]
    ];
    
    const payload = { solution: invalidGrid };
    const response = await request(app).post('/api/solution').send(payload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('invalidPositions');
    expect(Array.isArray(response.body.invalidPositions)).toBe(true);
  });
  
  test('POST /api/hint - Get valid hint', async () => {
    // Grid with some values but space for valid placements
    const grid = Array(9).fill().map(() => Array(12).fill(null));
    const dominoQueue = [{ num1: 1, num2: 2 }];
    
    const payload = { grid, dominoQueue };
    const response = await request(app).post('/api/hint').send(payload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('hint');
    expect(response.body.hint).toHaveProperty('row');
    expect(response.body.hint).toHaveProperty('col');
    expect(response.body.hint).toHaveProperty('orientation');
  });
});
