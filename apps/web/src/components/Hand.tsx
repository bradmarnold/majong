import React from 'react';
import { Tile as TileType } from '@majong/rules';
import { useGameStore } from '../state/game';
import Tile from './Tile';

interface HandProps {
  playerId: string;
  tiles: TileType[];
  isCurrentPlayer: boolean;
  position: 'bottom' | 'top' | 'left' | 'right';
}

const Hand: React.FC<HandProps> = ({ playerId, tiles, isCurrentPlayer, position }) => {
  const { ui, selectTile, game } = useGameStore();
  const isHumanPlayer = playerId === 'player-0';

  const handleTileClick = (tile: TileType) => {
    if (!isHumanPlayer || !isCurrentPlayer || game?.phase !== 'discarding') return;
    
    const newSelection = ui.selectedTileId === tile.id ? null : tile.id;
    selectTile(newSelection);
  };

  const getHandClass = () => {
    const baseClass = 'hand-area';
    
    switch (position) {
      case 'bottom':
        return `${baseClass} flex-row justify-center`;
      case 'top':
        return `${baseClass} flex-row justify-center`;
      case 'left':
        return `${baseClass} flex-col items-center max-w-[80px]`;
      case 'right':
        return `${baseClass} flex-col items-center max-w-[80px]`;
    }
  };

  const getTileSize = () => {
    switch (position) {
      case 'bottom':
        return 'lg';
      case 'top':
        return 'md';
      case 'left':
      case 'right':
        return 'sm';
      default:
        return 'md';
    }
  };

  const sortedTiles = [...tiles].sort((a, b) => {
    // Sort by suit, then rank
    if (a.suit !== b.suit) {
      const suitOrder = ['characters', 'bamboos', 'dots', 'winds', 'dragons'];
      return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    }
    return (a.rank || 0) - (b.rank || 0);
  });

  return (
    <div className={getHandClass()}>
      {sortedTiles.map((tile) => (
        <Tile
          key={tile.id}
          tile={tile}
          size={getTileSize() as 'sm' | 'md' | 'lg'}
          isSelected={ui.selectedTileId === tile.id}
          isSelectable={isHumanPlayer && isCurrentPlayer && game?.phase === 'discarding'}
          isAnimating={ui.animatingTile === tile.id}
          onClick={() => handleTileClick(tile)}
        />
      ))}
      
      {/* Show tile count for non-human players */}
      {!isHumanPlayer && (
        <div className="flex items-center justify-center min-w-[40px] text-white text-sm">
          {tiles.length}
        </div>
      )}
    </div>
  );
};

export default Hand;