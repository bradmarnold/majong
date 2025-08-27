import React, { useEffect } from 'react';
import { useGameStore } from './state/game';
import Table from './components/Table';
import { assetLoader } from './lib/assets';

function App() {
  const { game, startNewGame, ui, toggleSettings } = useGameStore();

  const handleNewGame = () => {
    const playerNames = ['You', 'East Bot', 'West Bot', 'North Bot'];
    startNewGame(playerNames);
  };

  // Preload assets and set up keyboard shortcuts
  useEffect(() => {
    // Preload tile assets in background
    assetLoader.preloadTiles().catch(console.warn);

    // Keyboard shortcuts
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle shortcuts when typing in inputs
      }

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          toggleSettings();
          break;
        case 'h':
          e.preventDefault();
          // This will be handled by the game table component
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [toggleSettings]);

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
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg transform hover:scale-105 active:scale-95"
          >
            Start New Game
          </button>

          <div className="mt-6 text-felt-300 text-xs">
            <p>Click tiles to select, then discard. Use "Teach Me" for help!</p>
            <p className="mt-1">Press <kbd className="px-1 py-0.5 bg-felt-700 rounded text-xs">S</kbd> for settings</p>
          </div>
        </div>
      </div>
    );
  }

  return <Table />;
}

export default App;