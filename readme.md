# Domino Sudoku Challenge

A unique puzzle game that combines elements of Sudoku and domino placement. This engaging brain teaser requires strategic thinking and careful planning.

## Game Overview

Domino Sudoku combines traditional Sudoku rules with domino placement mechanics:

1. The game is played on a 9×12 grid divided into 3×4 boxes.
2. You must place dominoes (pieces with two numbers) on the grid.
3. Each domino covers exactly two adjacent cells.
4. When completed, each row, column, and 3×4 box must contain the numbers 1-12 exactly once.

## Features

- Three difficulty levels:
  - Easy: More dominoes pre-placed on the board (easier to solve)
  - Medium: Moderate number of pre-placed dominoes
  - Hard: Fewer dominoes pre-placed (harder to solve)
- Interactive UI with visual cues for domino placement
- Hint system to help when you get stuck
- Timer to track your progress
- Victory celebration when you complete the puzzle

## Tech Stack

### Frontend
- **React**: For building the interactive user interface.
- **Redux**: For managing game state.
- **CSS**: For styling the game interface.

### Backend
- **Node.js**: For server-side logic and API endpoints.
- **Express**: For handling HTTP requests and routing.

### Game Logic
- **JavaScript**: For implementing the game engine and puzzle generator.

## How to Play

1. Select a difficulty level using the dropdown menu
2. The next domino to place is shown at the top of the screen
3. You can toggle between horizontal and vertical domino orientation using the button
4. Click on a cell to place the current domino (it will extend right or down based on orientation)
5. Valid placements follow Sudoku rules - no repeated numbers in rows, columns, or boxes
6. If you get stuck, use the hint button to get a suggestion
7. Complete the puzzle by placing all dominoes to fill the grid

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dominoSuduko
   ```

2. Install dependencies for both backend and frontend:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

### Using the Start Scripts (Recommended)

We provide several convenient start scripts that will automatically check for running servers, stop them if needed, and start both the backend and frontend servers:

#### On Windows

You can use one of these options:
- Double-click on `start.bat` to run the batch script
- Right-click on `start.ps1` and select "Run with PowerShell"
- Run the Node.js script: 
  ```
  node start.js
  ```

### Manual Start

If you prefer to start the servers manually:

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to view the game.

## Available Scripts

### Backend
- `npm start`: Starts the backend server.
- `npm test`: Runs the backend tests.

### Frontend
- `npm start`: Runs the app in development mode.
- `npm test`: Launches the test runner in interactive watch mode.
- `npm run build`: Builds the app for production.

## Implementation Details

- The puzzle generator creates valid Sudoku grids and then converts them into domino placements
- The game engine ensures all placements follow Sudoku rules
- The frontend provides visual cues for valid/invalid moves and domino orientations
- The hint system analyzes the current game state to suggest valid placements

## Future Enhancements

- Save game progress locally
- User accounts and leaderboards
- More puzzle variations
- Mobile-friendly responsive design