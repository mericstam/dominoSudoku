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
      <header className="App-header">
        <h1>Domino Sudoku Challenge</h1>
        <p className="App-subtitle">Place dominoes to complete the grid following Sudoku rules</p>
      </header>
      <div className="game-container">
        <Grid />
      </div>
      <footer className="App-footer">
        <p>Domino Sudoku combines traditional Sudoku rules with domino placement</p>
        <p className="rules">
          Rules: Place all dominoes such that each row, column, and 3×4 box contains the numbers 1-12 exactly once.
        </p>
      </footer>
    </div>
  );
}

export default App;
