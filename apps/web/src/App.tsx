import React from 'react';
import { useGameStore } from './state/game';
import Table from './components/Table';

function App() {
  const { game, startNewGame } = useGameStore();

  const handleNewGame = () => {
    const playerNames = ['You', 'East Bot', 'West Bot', 'North Bot'];
    startNewGame(playerNames);
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-felt-600 to-felt-800 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Majong</h1>
            <p className="text-felt-100 text-lg mb-2">Hong Kong Mahjong</p>
            <p className="text-felt-200 text-sm">
              Learn and play the classic tile game with AI teaching assistant
            </p>
          </div>

          <div className="bg-felt-800 rounded-lg p-6 mb-8 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Game Features</h2>
            <ul className="text-felt-200 text-sm space-y-2 text-left">
              <li>• 4-player Hong Kong Mahjong (13 tiles)</li>
              <li>• Chi, Pon, Kong mechanics</li>
              <li>• Fan-based scoring system</li>
              <li>• Smart bot opponents</li>
              <li>• Built-in teaching assistant</li>
              <li>• Mobile-friendly responsive design</li>
            </ul>
          </div>

          <button
            onClick={handleNewGame}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-200 shadow-lg transform hover:scale-105"
          >
            Start New Game
          </button>

          <div className="mt-6 text-felt-300 text-xs">
            <p>Click tiles to select, then discard. Use "Teach Me" for help!</p>
          </div>
        </div>
      </div>
    );
  }

  return <Table />;
}

export default App;