// Add this helper function to the server.js file before the hint endpoint
// Helper function to check if a placement creates consecutive sequences
function checkForConsecutiveNumbers(grid, row1, col1, num1, row2, col2, num2) {
  // Directions to check: up, right, down, left
  const dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]];
  
  // Check first number's adjacencies
  for (const [dr, dc] of dirs) {
    const r = row1 + dr;
    const c = col1 + dc;
    
    // Skip if this is the position of the second number
    if (r === row2 && c === col2) continue;
    
    // Skip if out of bounds
    if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) continue;
    
    // Skip empty cells
    if (grid[r][c] === null) continue;
    
    // Check if consecutive
    if (Math.abs(grid[r][c] - num1) === 1) {
      return true;
    }
  }
  
  // Check second number's adjacencies
  for (const [dr, dc] of dirs) {
    const r = row2 + dr;
    const c = col2 + dc;
    
    // Skip if this is the position of the first number
    if (r === row1 && c === col1) continue;
    
    // Skip if out of bounds
    if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) continue;
    
    // Skip empty cells
    if (grid[r][c] === null) continue;
    
    // Check if consecutive
    if (Math.abs(grid[r][c] - num2) === 1) {
      return true;
    }
  }
  
  return false;
}
