import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { placeDomino, setDominoQueue, setGrid, setGameCompletion } from './store';
import './Grid.css';

const Grid = () => {
  const grid = useSelector((state) => state.game.grid) || Array.from({ length: 9 }, () => Array(12).fill(null)); // Fallback to empty grid
  const dominoQueue = useSelector((state) => state.game.dominoQueue) || []; // Fallback to empty domino queue
  const isGameComplete = useSelector((state) => state.game.isGameComplete);
  const dominoPlacements = useSelector((state) => state.game.dominoPlacements) || [];
  const dispatch = useDispatch();
  const [orientation, setOrientation] = useState('horizontal');
  const [gameMode, setGameMode] = useState('easy'); // Add game mode state
  const [hoverCell, setHoverCell] = useState(null); // Track mouse hover for domino placement preview
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hint, setHint] = useState(null);
  const [hintUsed, setHintUsed] = useState(0);
  const [lastPlacedCells, setLastPlacedCells] = useState([]);
  const currentDomino = dominoQueue[0]; // Get the current domino from the queue

  // Game timer
  useEffect(() => {
    let interval = null;
    
    if (gameStarted && !isGameComplete && dominoQueue.length > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else if (isGameComplete) {
      clearInterval(interval);
      if (dominoQueue.length === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
      }
    }
    
    return () => clearInterval(interval);
  }, [gameStarted, isGameComplete, dominoQueue.length]);
  // Format timer to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Check if the grid is completely filled
  const checkGridCompletion = useCallback(() => {
    if (dominoQueue.length === 0) {
      // First check if there are any empty cells
      const hasEmptyCells = grid.some(row => row.some(cell => cell === null));
      
      if (hasEmptyCells) {
        console.log("Cannot complete puzzle - grid has empty cells");
        // Show an alert to inform the user that they need to fill all cells
        alert("The puzzle cannot be completed with empty cells. Please place all dominoes correctly to fill the grid.");
        return;
      }
      
      // Make API call to verify the solution is correct
      fetch('http://localhost:3001/api/solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solution: grid }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            dispatch(setGameCompletion(true));
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
          } else {
            console.log("Solution validation failed:", data.message);
            alert("This solution does not follow Sudoku rules. Please check your domino placements and try again.");
              // If there are specific invalid positions, highlight them
            if (data.invalidPositions && data.invalidPositions.length > 0) {
              data.invalidPositions.forEach(([r, c]) => {
                const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
                if (cell) {
                  cell.classList.add('invalid');
                  setTimeout(() => cell.classList.remove('invalid'), 3000);
                }
              });
            }
          }
        })
        .catch(error => console.error('Error checking solution:', error));
    }
  }, [grid, dominoQueue.length, dispatch]);

  useEffect(() => {
    // Check for game completion whenever the grid changes
    if (dominoQueue.length === 0 && !isGameComplete) {
      checkGridCompletion();
    }
  }, [dominoQueue.length, isGameComplete, checkGridCompletion]);

  useEffect(() => {
    // Fetch the initial puzzle based on the default game mode
    fetch(`http://localhost:3001/api/puzzle?difficulty=${gameMode}`)
      .then((response) => response.json())
      .then((data) => {
        dispatch(setGrid(data.grid));
        dispatch(setDominoQueue(data.dominoQueue));
        setGameStarted(true);
        setTimer(0); // Reset timer
        setHintUsed(0); // Reset hint counter
        setHint(null); // Clear any hints
      })
      .catch((error) => console.error('Error fetching initial puzzle:', error));  
  }, [gameMode, dispatch]); // Added 'dispatch' to the dependency array

  // Clear the "newly-placed" animation after a short delay
  useEffect(() => {
    if (lastPlacedCells.length > 0) {
      const timer = setTimeout(() => {
        setLastPlacedCells([]);
      }, 500); // Match animation duration in CSS
      return () => clearTimeout(timer);
    }
  }, [lastPlacedCells]);

  const handleCellClick = async (row, col) => {
    if (!currentDomino || isGameComplete) return;

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
        // Set last placed cells for animation
        if (orientation === 'horizontal') {
          setLastPlacedCells([[row, col], [row, col + 1]]);
        } else {
          setLastPlacedCells([[row, col], [row + 1, col]]);
        }
          dispatch(placeDomino({ row, col, domino: currentDomino, orientation }));
        
        // Clear any active hint
        setHint(null);
          // Check if this was the last domino
        if (dominoQueue.length === 1) {
          // Use a timeout to ensure the state is updated before checking completion
          setTimeout(() => checkGridCompletion(), 300);
        }
      } else {
        // More user-friendly message
        console.log('Invalid placement attempt');
        
        // Highlight invalid cells temporarily
        invalidCells?.forEach(([r, c]) => {
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
  
  // Show preview of domino placement on hover
  const handleCellHover = (row, col) => {
    if (currentDomino && !isGameComplete) {
      setHoverCell({ row, col });
    }
  };
  
  const handleCellLeave = () => {
    setHoverCell(null);
  };

  const toggleOrientation = () => {
    // Only toggle the orientation without changing domino values
    setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
    
    // Clear hint when changing orientation
    setHint(null);
  };

  const handleGameModeChange = (event) => {
    const selectedMode = event.target.value;
    setGameMode(selectedMode);

    // Fetch a new puzzle based on the selected game mode
    fetch(`http://localhost:3001/api/puzzle?difficulty=${selectedMode}`)
      .then((response) => response.json())
      .then((data) => {
        dispatch(setGrid(data.grid));
        dispatch(setDominoQueue(data.dominoQueue));
        setGameStarted(true);
        setTimer(0); // Reset timer
        setHintUsed(0); // Reset hint counter
        setHint(null); // Clear any hints
        dispatch(setGameCompletion(false)); // Reset game completion status
      })
      .catch((error) => console.error('Error fetching puzzle:', error));
  };

  const startNewGame = () => {
    // Fetch a new puzzle with the current game mode
    fetch(`http://localhost:3001/api/puzzle?difficulty=${gameMode}`)
      .then((response) => response.json())
      .then((data) => {
        dispatch(setGrid(data.grid));
        dispatch(setDominoQueue(data.dominoQueue));
        setGameStarted(true);
        setTimer(0); // Reset timer
        setHintUsed(0); // Reset hint counter
        setHint(null); // Clear any hints
        dispatch(setGameCompletion(false)); // Reset game completion status
        setShowConfetti(false);
      })
      .catch((error) => console.error('Error fetching new puzzle:', error));
  };

  // Get a hint for where to place the current domino

  const getHint = () => {
    if (!currentDomino || isGameComplete) return;
    
    fetch('http://localhost:3001/api/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grid, dominoQueue }),
    })
      .then(response => response.json())
      .then(data => {
        // Increment hint count only if a valid hint was provided
        if (data.success) {
          setHintUsed(prev => prev + 1);
          setHint(data.hint);
          // Set orientation to match the hint
          setOrientation(data.hint.orientation);
          
          // If the hint suggests flipping the domino, handle that
          if (data.hint.flipped) {
            // We don't need to modify the domino in the queue
            // Just visually show it flipped in the hint
            console.log("Hint suggests flipping the domino");
          }
        } else {          // Handle unsolvable puzzle
          if (data.deadEnd) {
            alert("The puzzle appears to be unsolvable. Please start a new game.");
            // We don't increment hint count for unsolvable situations
          } else {
            alert(data.message || "No valid placement found for the current domino");
            // We don't increment hint count for unsuccessful hints
          }
        }
      })
      .catch(error => console.error('Error getting hint:', error));
  };

  // Determine if a cell is part of a placed domino and in what direction
  const getDominoDirection = (rowIndex, colIndex) => {
    // Find if this cell is part of any placed domino
    const placement = dominoPlacements.find(p => 
      (p.row === rowIndex && p.col === colIndex) || // First cell
      (p.orientation === 'horizontal' && p.row === rowIndex && p.col + 1 === colIndex) || // Second cell horizontal
      (p.orientation === 'vertical' && p.row + 1 === rowIndex && p.col === colIndex)  // Second cell vertical
    );
    
    if (!placement) return null;
    
    if (placement.row === rowIndex && placement.col === colIndex) {
      // This is the first cell of the domino
      return placement.orientation === 'horizontal' ? 'start-horizontal' : 'start-vertical';
    } else {
      // This is the second cell of the domino
      return placement.orientation === 'horizontal' ? 'end-horizontal' : 'end-vertical';
    }
  };

  return (
    <div className="domino-game-container">
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i} 
              className="confetti" 
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
              }}
            />
          ))}
        </div>
      )}
      
      <div className="game-header">
        <div className="game-mode-selector">
          <label htmlFor="game-mode">Select Game Mode: </label>
          <select id="game-mode" value={gameMode} onChange={handleGameModeChange} disabled={isGameComplete}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        <div className="timer">Time: {formatTime(timer)}</div>
      </div>

      {isGameComplete ? (
        <div className="game-complete">
          <h2>Puzzle Completed! 🎉</h2>
          <p>You completed the puzzle in {formatTime(timer)}!</p>
          {hintUsed > 0 && (
            <p>Hints used: {hintUsed}</p>
          )}
          <button className="new-game-button" onClick={startNewGame}>Start New Game</button>
        </div>
      ) : (
        <>
          <div className="queue-container">
            <div className="queue-title">Next Domino to Place</div>
            {currentDomino && (
              <>
                <div className={`domino ${orientation === 'vertical' ? 'vertical' : ''}`}>
                  <div className="domino-half">{currentDomino.num1}</div>
                  <div className="domino-half">{currentDomino.num2}</div>
                </div>
                <div className="orientation-indicator">
                  <span className="orientation-label">Placement direction:</span>
                  <span className="orientation-arrow">
                    {orientation === 'horizontal' ? '→' : '↓'}
                  </span>
                  <span className="orientation-text">
                    {orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
                  </span>
                </div>
              </>
            )}
          </div>
          
          <div className="button-container">
            <button onClick={toggleOrientation} className="toggle-button">
              Change to {orientation === 'horizontal' ? 'Vertical' : 'Horizontal'} Orientation
            </button>
              <button onClick={getHint} className="hint-button" disabled={!currentDomino}>
              Get Hint {hintUsed > 0 ? `(${hintUsed} used)` : ''}
            </button>
          </div>
          
          <div className="dominoes-remaining">
            Dominoes remaining: {dominoQueue.length}
          </div>
        </>
      )}
      
      <div className="grid" style={{ gridTemplateColumns: 'repeat(12, 40px)', gridTemplateRows: 'repeat(9, 40px)' }}>
        {grid.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((cell, colIndex) => {
              // Determine if this is part of the hover preview
              const isHoveredMain = hoverCell && hoverCell.row === rowIndex && hoverCell.col === colIndex;
              const isHoveredSecond = hoverCell && 
                ((orientation === 'horizontal' && hoverCell.row === rowIndex && hoverCell.col + 1 === colIndex) || 
                 (orientation === 'vertical' && hoverCell.row + 1 === rowIndex && hoverCell.col === colIndex));
              
              // Determine if this cell is part of a hint
              const isHintMain = hint && hint.row === rowIndex && hint.col === colIndex;
              const isHintSecond = hint && 
                ((hint.orientation === 'horizontal' && hint.row === rowIndex && hint.col + 1 === colIndex) || 
                 (hint.orientation === 'vertical' && hint.row + 1 === rowIndex && hint.col === colIndex));
              
              // Determine if this cell was just placed (for animation)
              const isNewlyPlaced = lastPlacedCells.some(([r, c]) => r === rowIndex && c === colIndex);
              
              // Hover class with directional indicators
              let hoverClass = '';
              if ((isHoveredMain || isHoveredSecond) && !cell) {
                hoverClass = 'hovered';
                if (isHoveredMain) { // Only add direction class to the first cell
                  hoverClass += orientation === 'horizontal' ? ' horizontal-placement' : ' vertical-placement';
                }
              }
              
              const hintClass = (isHintMain || isHintSecond) && !cell ? 'hint' : '';
              const newlyPlacedClass = isNewlyPlaced ? 'newly-placed' : '';
              
              // Get domino direction for visual styling
              const dominoDirection = getDominoDirection(rowIndex, colIndex);
              const dominoClass = dominoDirection ? `domino-${dominoDirection}` : '';
              
              // Set custom property for color based on the cell value
              const style = cell ? { '--cell-value': cell } : {};
                // Add subgrid border classes
              const subgridBorderClass = [];
              
              // Bottom border for rows 2 and 5 (end of subgrids)
              if (rowIndex === 2 || rowIndex === 5) {
                subgridBorderClass.push('subgrid-border-bottom');
              }
              
              // Right border for columns 3, 7, and 11 (end of subgrids)
              if (colIndex === 3 || colIndex === 7 || colIndex === 11) {
                subgridBorderClass.push('subgrid-border-right');
              }
              
              return (
                <div
                  key={colIndex}
                  className={`cell ${cell ? 'filled' : ''} ${hoverClass} ${hintClass} ${dominoClass} ${newlyPlacedClass} ${subgridBorderClass.join(' ')}`}
                  data-row={rowIndex}
                  data-col={colIndex}
                  style={style}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                  onMouseLeave={handleCellLeave}
                >
                  {cell}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      
      <div className="game-controls">
        {!isGameComplete && (
          <button className="reset-button" onClick={startNewGame}>
            Restart Game
          </button>
        )}
      </div>
    </div>
  );
};

export default Grid;