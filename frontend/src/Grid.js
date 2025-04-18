import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { placeDomino, setDominoQueue, setGrid } from './store';
import './Grid.css';

const Grid = () => {
  const grid = useSelector((state) => state.game.grid) || Array.from({ length: 9 }, () => Array(12).fill(null)); // Fallback to empty grid
  const dominoQueue = useSelector((state) => state.game.dominoQueue) || []; // Fallback to empty domino queue
  const dispatch = useDispatch();
  const [orientation, setOrientation] = useState('horizontal');
  const [gameMode, setGameMode] = useState('easy'); // Add game mode state

  const currentDomino = dominoQueue[0]; // Get the current domino from the queue

  useEffect(() => {
    // Fetch the initial puzzle based on the default game mode
    fetch(`http://localhost:3001/api/puzzle?difficulty=${gameMode}`)
      .then((response) => response.json())
      .then((data) => {
        dispatch(setGrid(data.grid));
        dispatch(setDominoQueue(data.dominoQueue));
      })
      .catch((error) => console.error('Error fetching initial puzzle:', error));
  }, [gameMode, dispatch]); // Added 'dispatch' to the dependency array

  const handleCellClick = async (row, col) => {
    if (!currentDomino) return;

    const isHorizontal = orientation === 'horizontal';

    try {
      const response = await fetch('http://localhost:3001/api/validate-placement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grid,
          row,
          col,
          domino: currentDomino,
          orientation,
        }),
      });

      const { isValid, invalidCells } = await response.json();

      if (isValid) {
        dispatch(placeDomino({ row, col, domino: currentDomino, orientation }));
      } else {
        alert('Cannot place domino here! The cells are either occupied or violate Sudoku rules.');

        // Highlight invalid cells temporarily
        invalidCells.forEach(([r, c]) => {
          const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
          if (cell) {
            cell.classList.add('invalid');
            setTimeout(() => cell.classList.remove('invalid'), 1000); // Remove highlight after 1 second
          }
        });
      }
    } catch (error) {
      console.error('Error validating placement:', error);
    }
  };

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));

    // Reverse the numbers in the current domino every other toggle
    if (currentDomino) {
      const isReversed = currentDomino.isReversed || false;

      const updatedDomino = isReversed
        ? { ...currentDomino, num1: currentDomino.num2, num2: currentDomino.num1, isReversed: false }
        : { ...currentDomino, isReversed: true };

      dispatch(setDominoQueue([updatedDomino, ...dominoQueue.slice(1)]));
    }
  };

  const handleGameModeChange = (event) => {
    const selectedMode = event.target.value;
    setGameMode(selectedMode);

    // Fetch a new puzzle based on the selected game mode
    fetch(`http://localhost:3001/api/puzzle?difficulty=${selectedMode}`)
      .then((response) => response.json())
      .then((data) => {
        dispatch(setGrid(data.puzzle));
        dispatch(setDominoQueue(data.dominoQueue));
      })
      .catch((error) => console.error('Error fetching puzzle:', error));
  };

  return (
    <div>
      <div className="game-mode-selector">
        <label htmlFor="game-mode">Select Game Mode: </label>
        <select id="game-mode" value={gameMode} onChange={handleGameModeChange}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
        </select>
      </div>

      <div className="queue-container">
        <div className="queue-title">Next Domino</div>
        {currentDomino && (
          <div className={`domino ${orientation === 'vertical' ? 'vertical' : ''}`}>
            <div className="domino-half">{orientation === 'vertical' ? currentDomino.num1 : currentDomino.num2}</div>
            <div className="domino-half">{orientation === 'vertical' ? currentDomino.num2 : currentDomino.num1}</div>
          </div>
        )}
      </div>
      <button onClick={toggleOrientation} className="toggle-button">
        Toggle Orientation ({orientation})
      </button>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(12, 40px)', gridTemplateRows: 'repeat(9, 40px)' }}>
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${cell ? 'filled' : ''}`}
                data-row={rowIndex}
                data-col={colIndex}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Grid;