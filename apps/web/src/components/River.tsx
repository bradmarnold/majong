import React from 'react';
import { Tile as TileType } from '@majong/rules';
import Tile from './Tile';

interface RiverProps {
  tiles: TileType[];
  position: 'bottom' | 'top' | 'left' | 'right';
  isCurrentDiscard?: boolean;
}

const River: React.FC<RiverProps> = ({ tiles, position, isCurrentDiscard = false }) => {
  const getRiverClass = () => {
    const baseClass = 'discard-river';
    
    switch (position) {
      case 'bottom':
        return `${baseClass} mx-auto max-w-md`;
      case 'top':
        return `${baseClass} mx-auto max-w-md`;
      case 'left':
        return `${baseClass} grid-cols-3 max-w-[120px]`;
      case 'right':
        return `${baseClass} grid-cols-3 max-w-[120px]`;
    }
  };

  const getTileSize = () => {
    switch (position) {
      case 'bottom':
      case 'top':
        return 'md';
      case 'left':
      case 'right':
        return 'sm';
      default:
        return 'md';
    }
  };

  const lastTileIndex = tiles.length - 1;

  return (
    <div className={getRiverClass()}>
      {tiles.map((tile, index) => (
        <div
          key={tile.id}
          className={`
            relative
            ${index === lastTileIndex && isCurrentDiscard ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''}
          `}
        >
          <Tile
            tile={tile}
            size={getTileSize() as 'sm' | 'md' | 'lg'}
            isSelectable={false}
          />
          {index === lastTileIndex && isCurrentDiscard && (
            <div className="absolute inset-0 bg-yellow-400 bg-opacity-20 rounded-lg animate-pulse" />
          )}
        </div>
      ))}
      
      {/* Empty slots to maintain grid structure */}
      {tiles.length === 0 && (
        <div className="col-span-full text-center text-felt-200 text-sm opacity-60">
          No discards
        </div>
      )}
    </div>
  );
};

export default River;