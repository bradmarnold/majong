import React from 'react';
import { useGameStore } from '../state/game';
import Hand from './Hand';
import River from './River';
import Controls from './Controls';
import TeachingDrawer from './TeachingDrawer';

const Table: React.FC = () => {
  const { game } = useGameStore();

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to Majong</h2>
          <p className="text-felt-200 mb-6">Click "New Game" to start playing Hong Kong Mahjong</p>
        </div>
      </div>
    );
  }

  const [player0, player1, player2, player3] = game.players;
  const currentPlayerIndex = game.players.findIndex(p => p.id === game.currentPlayer);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Game Header */}
      <div className="bg-felt-900 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Majong</h1>
            <div className="text-sm text-felt-200">
              Round {game.round} • {game.roundWind.toUpperCase()} Wind
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm">
              Current: <span className="font-semibold">{game.players[currentPlayerIndex]?.name}</span>
            </div>
            <div className="text-sm">
              Phase: <span className="font-semibold capitalize">{game.phase}</span>
            </div>
            <div className="text-sm">
              Wall: <span className="font-semibold">{game.wall.length}</span> tiles
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 table-surface m-4">
        <div className="h-full grid grid-cols-12 grid-rows-12 gap-4">
          
          {/* Top Player (Opposite) */}
          <div className="col-span-6 col-start-4 row-start-1 row-span-2">
            <div className="text-center mb-2">
              <span className="text-white text-sm font-medium">{player2.name}</span>
              {player2.isDealer && <span className="ml-2 text-yellow-400">●</span>}
            </div>
            <Hand
              playerId={player2.id}
              tiles={player2.hand.tiles}
              isCurrentPlayer={game.currentPlayer === player2.id}
              position="top"
            />
          </div>

          {/* Top River */}
          <div className="col-span-6 col-start-4 row-start-3">
            <River
              tiles={game.discards[2]}
              position="top"
              isCurrentDiscard={game.lastAction?.playerId === player2.id}
            />
          </div>

          {/* Left Player */}
          <div className="col-span-2 row-start-4 row-span-6">
            <div className="text-center mb-2">
              <span className="text-white text-sm font-medium">{player1.name}</span>
              {player1.isDealer && <span className="ml-2 text-yellow-400">●</span>}
            </div>
            <Hand
              playerId={player1.id}
              tiles={player1.hand.tiles}
              isCurrentPlayer={game.currentPlayer === player1.id}
              position="left"
            />
          </div>

          {/* Left River */}
          <div className="col-span-2 col-start-3 row-start-4 row-span-6">
            <River
              tiles={game.discards[1]}
              position="left"
              isCurrentDiscard={game.lastAction?.playerId === player1.id}
            />
          </div>

          {/* Center Area */}
          <div className="col-span-4 col-start-5 row-start-5 row-span-4 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-felt-600 rounded-full flex items-center justify-center mb-2">
                <svg className="w-12 h-12 text-felt-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-felt-200">Wall: {game.wall.length}</div>
            </div>
          </div>

          {/* Right River */}
          <div className="col-span-2 col-start-9 row-start-4 row-span-6">
            <River
              tiles={game.discards[3]}
              position="right"
              isCurrentDiscard={game.lastAction?.playerId === player3.id}
            />
          </div>

          {/* Right Player */}
          <div className="col-span-2 col-start-11 row-start-4 row-span-6">
            <div className="text-center mb-2">
              <span className="text-white text-sm font-medium">{player3.name}</span>
              {player3.isDealer && <span className="ml-2 text-yellow-400">●</span>}
            </div>
            <Hand
              playerId={player3.id}
              tiles={player3.hand.tiles}
              isCurrentPlayer={game.currentPlayer === player3.id}
              position="right"
            />
          </div>

          {/* Bottom River */}
          <div className="col-span-6 col-start-4 row-start-10">
            <River
              tiles={game.discards[0]}
              position="bottom"
              isCurrentDiscard={game.lastAction?.playerId === player0.id}
            />
          </div>

          {/* Bottom Player (Human) */}
          <div className="col-span-6 col-start-4 row-start-11 row-span-2">
            <div className="text-center mb-2">
              <span className="text-white text-sm font-medium">{player0.name}</span>
              {player0.isDealer && <span className="ml-2 text-yellow-400">●</span>}
            </div>
            <Hand
              playerId={player0.id}
              tiles={player0.hand.tiles}
              isCurrentPlayer={game.currentPlayer === player0.id}
              position="bottom"
            />
          </div>

        </div>
      </div>

      {/* Controls */}
      <Controls />
      
      {/* Teaching Drawer */}
      <TeachingDrawer />
    </div>
  );
};

export default Table;