import thunk from 'redux-thunk';
import axios from 'axios';
import { configureStore } from '@reduxjs/toolkit'; // Corrected the import for configureStore
import { fetchPuzzle, setGrid, setDominoQueue } from './store';

jest.mock('axios');

describe('fetchPuzzle thunk', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        game: (state = { grid: [], dominoQueue: [] }, action) => {
          switch (action.type) {
            case 'game/setGrid':
              return { ...state, grid: action.payload };
            case 'game/setDominoQueue':
              return { ...state, dominoQueue: action.payload };
            default:
              return state;
          }
        },
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware(), // Removed explicit addition of thunk middleware
    });
  });

  it('should handle error when response data is undefined', async () => {
    axios.get.mockResolvedValueOnce({}); // Mock API response with no data

    console.error = jest.fn(); // Mock console.error

    await store.dispatch(fetchPuzzle('easy'));

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching puzzle:',
      expect.any(TypeError)
    );

    const state = store.getState();
    expect(state.game.grid).toEqual([]); // Grid should remain empty
    expect(state.game.dominoQueue).toEqual([]); // Domino queue should remain empty
  });
});