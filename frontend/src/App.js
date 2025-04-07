import React, { useEffect } from 'react';
import './App.css';
import Grid from './Grid';
import { useDispatch } from 'react-redux';
import { fetchPuzzle } from './store';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch a medium difficulty puzzle on load
    dispatch(fetchPuzzle('medium'));
  }, [dispatch]);

  return (
    <div className="App">
      <h1>Domino Sudoku</h1>
      <Grid />
    </div>
  );
}

export default App;
