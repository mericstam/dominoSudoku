import { configureStore, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Initial state for the game
const initialState = {
  grid: Array.from({ length: 9 }, () => Array(12).fill(null)), // 9x12 grid
  dominoQueue: Array.from({ length: 54 }, (_, i) => ({
    num1: (i % 12) + 1,
    num2: ((i + 1) % 12) + 1,
  })), // Generate 54 dominoes with numbers 1–12
  selectedDomino: null, // Currently selected domino
};

// Game slice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGrid(state, action) {
      state.grid = action.payload;
    },
    setDominoQueue(state, action) {
      state.dominoQueue = action.payload;
    },
    selectDomino(state, action) {
      state.selectedDomino = action.payload;
    },
    placeDomino(state, action) {
      const { row, col, domino, orientation } = action.payload;
      if (orientation === 'horizontal') {
        state.grid[row][col] = domino.num1;
        state.grid[row][col + 1] = domino.num2;
      } else if (orientation === 'vertical') {
        state.grid[row][col] = domino.num1;
        state.grid[row + 1][col] = domino.num2;
      }
      // Remove the placed domino from the queue
      state.dominoQueue.shift();
    },
  },
});

// Export actions
export const { setGrid, setDominoQueue, selectDomino, placeDomino } = gameSlice.actions;

// Thunk to fetch a new puzzle
export const fetchPuzzle = (difficulty) => async (dispatch) => {
  try {
    const response = await axios.get(`/api/puzzle?difficulty=${difficulty}`);
    const grid = response.data.grid || Array.from({ length: 9 }, () => Array(12).fill(null)); // Fallback to empty grid
    const dominoQueue = response.data.dominoQueue || []; // Fallback to empty domino queue

    dispatch(setGrid(grid));
    dispatch(setDominoQueue(dominoQueue));
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