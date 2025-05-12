// Test script for the improved puzzle generator
const { generatePuzzle } = require('./improvedPuzzleGenerator');

console.log('Testing improved puzzle generator...');

// Generate puzzles with different difficulties
console.log('\nGenerating easy puzzle:');
const easyPuzzle = generatePuzzle('easy');

console.log('\nGenerating medium puzzle:');
const mediumPuzzle = generatePuzzle('medium');

console.log('\nGenerating hard puzzle:');
const hardPuzzle = generatePuzzle('hard');

// Count filled cells for each difficulty
function countFilledCells(grid) {
  let count = 0;
  for (let row of grid) {
    for (let cell of row) {
      if (cell !== null) {
        count++;
      }
    }
  }
  return count;
}

console.log('\nSummary:');
console.log(`Easy puzzle: ${countFilledCells(easyPuzzle.grid)} filled cells, ${easyPuzzle.dominoQueue.length} dominoes in queue`);
console.log(`Medium puzzle: ${countFilledCells(mediumPuzzle.grid)} filled cells, ${mediumPuzzle.dominoQueue.length} dominoes in queue`);
console.log(`Hard puzzle: ${countFilledCells(hardPuzzle.grid)} filled cells, ${hardPuzzle.dominoQueue.length} dominoes in queue`);

console.log('\nTest completed!');
