# Domino Sudoku Game

A vibe coded mashup game combining the logic of Sudoku with the mechanics of dominoes.

## Tech Stack

### Frontend
- **React**: For building the interactive user interface.
- **Redux**: For managing game state.
- **CSS/SCSS**: For styling the game interface.

### Backend
- **Node.js**: For server-side logic and API endpoints.
- **Express**: For handling HTTP requests and routing.
- **MongoDB**: For storing user data, scores, and puzzle configurations.

### Game Logic
- **JavaScript**: For implementing the game engine and puzzle generator.
- **WebSocket**: For real-time updates and multiplayer functionality.

### Deployment
- **Docker**: For containerizing the application.
- **Azure Container Apps**: For hosting and scaling the application.

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

3. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

4. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the game.

## Available Scripts

### Backend
- `npm start`: Starts the backend server.
- `npm test`: Runs the backend tests.

### Frontend
- `npm start`: Runs the app in development mode.
- `npm test`: Launches the test runner in interactive watch mode.
- `npm run build`: Builds the app for production.

## Learn More

- [React Documentation](https://reactjs.org/)
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [Node.js Documentation](https://nodejs.org/)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
