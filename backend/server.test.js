const request = require('supertest');
const { app, server } = require('./server');

// Ensure the server is closed after all tests
afterAll(() => {
  server.close();
});

describe('Server API Tests', () => {
  test('GET /api/puzzle - Fetch puzzle with default difficulty', async () => {
    const response = await request(app).get('/api/puzzle');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('grid');
    expect(response.body).toHaveProperty('dominoQueue');
  });

  test('GET /api/puzzle - Fetch puzzle with specific difficulty', async () => {
    const response = await request(app).get('/api/puzzle?difficulty=hard');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('grid');
    expect(response.body).toHaveProperty('dominoQueue');
  });

  test('POST /api/validate-placement - Validate valid placement', async () => {
    const payload = {
      grid: Array.from({ length: 9 }, () => Array(12).fill(null)),
      row: 0,
      col: 0,
      domino: { num1: 5, num2: 6 },
      orientation: 'horizontal',
    };
    const response = await request(app).post('/api/validate-placement').send(payload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('isValid', true);
  });

  test('POST /api/validate-placement - Validate invalid placement', async () => {
    const payload = {
      grid: Array.from({ length: 9 }, () => Array(12).fill(null)),
      row: 0,
      col: 11,
      domino: { num1: 5, num2: 6 },
      orientation: 'horizontal',
    };
    const response = await request(app).post('/api/validate-placement').send(payload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('isValid', false);
  });

  test('POST /api/solution - Submit valid solution', async () => {
    const payload = {
      solution: Array.from({ length: 9 }, () => Array(12).fill(1)),
    };
    const response = await request(app).post('/api/solution').send(payload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('POST /api/solution - Submit invalid solution', async () => {
    const payload = {
      solution: Array.from({ length: 9 }, () => Array(12).fill(null)),
    };
    const response = await request(app).post('/api/solution').send(payload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', false);
  });
});
