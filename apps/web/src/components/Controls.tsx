import React from 'react';
import { ActionType } from '@majong/rules';
import { useGameStore } from '../state/game';

const Controls: React.FC = () => {
  const { game, validActions, ui, drawTile, discardSelectedTile, toggleTeachingDrawer } = useGameStore();

  if (!game || game.currentPlayer !== 'player-0') {
    return null;
  }

  const canDraw = validActions.includes(ActionType.Draw) && game.phase === 'drawing';
  const canDiscard = validActions.includes(ActionType.Discard) && game.phase === 'discarding' && ui.selectedTileId;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="flex items-center gap-4 bg-felt-900 bg-opacity-90 backdrop-blur-sm rounded-lg p-4 shadow-xl">
        {/* Draw Button */}
        <button
          onClick={drawTile}
          disabled={!canDraw}
          className={`
            px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200
            ${canDraw
              ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg'
              : 'bg-gray-600 cursor-not-allowed opacity-50'
            }
          `}
        >
          Draw
        </button>

        {/* Discard Button */}
        <button
          onClick={discardSelectedTile}
          disabled={!canDiscard}
          className={`
            px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200
            ${canDiscard
              ? 'bg-red-600 hover:bg-red-700 active:scale-95 shadow-lg'
              : 'bg-gray-600 cursor-not-allowed opacity-50'
            }
          `}
        >
          Discard
        </button>

        {/* Separator */}
        <div className="w-px h-8 bg-gray-600" />

        {/* Chi Button - Placeholder */}
        <button
          disabled
          className="px-4 py-2 rounded-lg font-semibold text-white bg-gray-600 cursor-not-allowed opacity-50"
        >
          Chi
        </button>

        {/* Pon Button - Placeholder */}
        <button
          disabled
          className="px-4 py-2 rounded-lg font-semibold text-white bg-gray-600 cursor-not-allowed opacity-50"
        >
          Pon
        </button>

        {/* Kong Button - Placeholder */}
        <button
          disabled
          className="px-4 py-2 rounded-lg font-semibold text-white bg-gray-600 cursor-not-allowed opacity-50"
        >
          Kong
        </button>

        {/* Pass Button - Placeholder */}
        <button
          disabled
          className="px-4 py-2 rounded-lg font-semibold text-white bg-gray-600 cursor-not-allowed opacity-50"
        >
          Pass
        </button>

        {/* Separator */}
        <div className="w-px h-8 bg-gray-600" />

        {/* Teach Me Button */}
        <button
          onClick={toggleTeachingDrawer}
          className={`
            px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200
            ${ui.isTeachingDrawerOpen
              ? 'bg-green-700 shadow-inner'
              : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-lg'
            }
          `}
        >
          Teach Me
        </button>
      </div>
    </div>
  );
};

export default Controls;