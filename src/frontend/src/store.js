import { configureStore, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Initial state for the game
const initialState = {
  grid: Array.from({ length: 9 }, () => Array(12).fill(null)), // 9x12 grid
  dominoQueue: Array.from({ length: 54 }, (_, i) => ({
    num1: (i % 12) + 1,
    num2: ((i + 1) % 12) + 1,
  })), // Generate 54 dominoes with numbers 1–12
  originalQueueLength: 0, // Store the original queue length to track loops
  firstDominoId: null, // Store the first domino's unique ID to detect loops
  skippedDominoCount: 0, // Count how many dominoes have been skipped
  selectedDomino: null, // Currently selected domino
  isGameComplete: false, // Flag to track game completion
  dominoPlacements: [], // Track where dominoes have been placed
  queueLoopCount: 0, // Track how many times we've looped through the queue
};

// Game slice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGrid(state, action) {
      state.grid = action.payload;
      state.isGameComplete = false; // Reset game completion when setting a new grid
      state.dominoPlacements = []; // Reset domino placements
      state.queueLoopCount = 0; // Reset queue loop counter
    },    setDominoQueue(state, action) {
      // Add unique IDs to each domino for tracking
      state.dominoQueue = action.payload.map((domino, index) => ({
        ...domino,
        id: `domino-${index}` // Add a unique ID to each domino
      }));
      
      // If we have dominoes, store the first one's ID for loop detection
      if (state.dominoQueue.length > 0) {
        state.firstDominoId = state.dominoQueue[0].id;
        state.originalQueueLength = state.dominoQueue.length;
      }
      
      state.isGameComplete = false; // Reset game completion when setting a new domino queue
      state.queueLoopCount = 0; // Reset queue loop counter
      state.skippedDominoCount = 0; // Reset skipped domino counter
    },
    selectDomino(state, action) {
      state.selectedDomino = action.payload;
    },      placeDomino(state, action) {
      const { row, col, domino, orientation } = action.payload;
      
      // Always place num1 in the first cell, num2 in the second cell
      // This ensures visual consistency with the queue display
      if (orientation === 'horizontal') {
        state.grid[row][col] = domino.num1;
        state.grid[row][col + 1] = domino.num2;
      } else if (orientation === 'vertical') {
        state.grid[row][col] = domino.num1;
        state.grid[row + 1][col] = domino.num2;
      }
        // Record this placement for visual styling
      state.dominoPlacements.push({
        row,
        col,
        orientation,
        domino: { ...domino }
      });      
      // Remove the placed domino from the queue
      state.dominoQueue.shift();
      
      // Check if we've looped back to the first domino after placing
      if (state.dominoQueue.length > 0 && state.dominoQueue[0].id === state.firstDominoId) {
        state.queueLoopCount += 1;
      }
      
      // We don't automatically mark the game as complete when the queue is empty
      // This ensures we only show completion when the grid is fully filled AND valid
      // Grid validation is handled by the server-side API call
    },
    
    // New reducer to manually set game completion status
    setGameCompletion(state, action) {
      state.isGameComplete = action.payload;
    },    // New reducer to skip the current domino and put it at the end of the queue
    skipDomino(state) {
      if (state.dominoQueue.length > 0) {
        // Take the first domino
        const skippedDomino = state.dominoQueue.shift();
        
        // Put it at the end of the queue
        state.dominoQueue.push(skippedDomino);
        
        // Increment the skipped domino counter
        state.skippedDominoCount += 1;
        
        // Check if we've looped back to the first domino
        if (state.dominoQueue[0].id === state.firstDominoId) {
          state.queueLoopCount += 1;
        }
      }
    }
  },
});

// Export actions
export const { setGrid, setDominoQueue, selectDomino, placeDomino, setGameCompletion, skipDomino } = gameSlice.actions;

// Thunk to fetch a new puzzle
export const fetchPuzzle = (difficulty) => async (dispatch) => {
  try {
    const response = await axios.get(`/api/puzzle?difficulty=${difficulty}`);
    const grid = response.data.grid || Array.from({ length: 9 }, () => Array(12).fill(null)); // Fallback to empty grid
    const dominoQueue = response.data.dominoQueue || []; // Fallback to empty domino queue

    dispatch(setGrid(grid));
    dispatch(setDominoQueue(dominoQueue));
    dispatch(setGameCompletion(false)); // Reset game completion status
  } catch (error) {
    console.error('Error fetching puzzle:', error);
  }
};

// Thunk to submit a solution
export const submitSolution = (solution) => async () => {
  try {
    const response = await axios.post('/api/solution', { solution });
    return response.data.success;
  } catch (error) {
    console.error('Error submitting solution:', error);
    return false;
  }
};

// Configure store
const store = configureStore({
  reducer: {
    game: gameSlice.reducer,
  },
});

export default store;