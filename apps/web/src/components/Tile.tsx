import React, { useState, useEffect } from 'react';
import { Tile as TileType, TileSuit, WindType, DragonType } from '@majong/rules';
import { assetLoader } from '../lib/assets';

interface TileProps {
  tile: TileType;
  isSelected?: boolean;
  isSelectable?: boolean;
  isAnimating?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Tile: React.FC<TileProps> = ({
  tile,
  isSelected = false,
  isSelectable = false,
  isAnimating = false,
  size = 'md',
  onClick,
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-12 text-xs',
    md: 'w-12 h-18 text-sm',
    lg: 'w-16 h-24 text-base',
  };

  // Load tile image
  useEffect(() => {
    assetLoader.getTileImageUrl(
      tile.suit,
      tile.rank,
      tile.wind,
      tile.dragon
    ).then(setImageUrl).catch(() => setImageError(true));
  }, [tile]);

  const getTileDisplay = () => {
    // Try to use generated image first
    if (imageUrl && !imageError) {
      return (
        <img
          src={imageUrl}
          alt={getTileAltText()}
          className="w-full h-full object-contain"
          onError={() => setImageError(true)}
        />
      );
    }

    // Fallback to text/emoji representation
    if (tile.suit === TileSuit.Characters && tile.rank) {
      const characters = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-mahjong-blue font-chinese font-bold">{characters[tile.rank]}</span>
          <span className="text-xs text-mahjong-red font-chinese">萬</span>
        </div>
      );
    }

    if (tile.suit === TileSuit.Bamboos && tile.rank) {
      const bamboos = ['', '🎋', '🎋🎋', '🎋🎋🎋', '🎋🎋🎋🎋', '🎋🎋🎋🎋🎋', '🎋🎋🎋🎋🎋🎋', '🎋🎋🎋🎋🎋🎋🎋', '🎋🎋🎋🎋🎋🎋🎋🎋', '🎋🎋🎋🎋🎋🎋🎋🎋🎋'];
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-mahjong-teal text-xs leading-none">{bamboos[tile.rank]}</span>
        </div>
      );
    }

    if (tile.suit === TileSuit.Dots && tile.rank) {
      const dots = ['', '●', '●●', '●●●', '●●●●', '●●●●●', '●●●●●●', '●●●●●●●', '●●●●●●●●', '●●●●●●●●●'];
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-mahjong-navy font-mono text-xs leading-tight">{dots[tile.rank]}</span>
        </div>
      );
    }

    if (tile.suit === TileSuit.Winds && tile.wind) {
      const windChars = {
        [WindType.East]: '東',
        [WindType.South]: '南',
        [WindType.West]: '西',
        [WindType.North]: '北',
      };
      return (
        <div className="flex items-center justify-center h-full">
          <span className="text-mahjong-blue font-chinese font-bold">{windChars[tile.wind]}</span>
        </div>
      );
    }

    if (tile.suit === TileSuit.Dragons && tile.dragon) {
      const dragonChars = {
        [DragonType.Red]: '中',
        [DragonType.Green]: '發',
        [DragonType.White]: '白',
      };
      const dragonColors = {
        [DragonType.Red]: 'text-mahjong-red',
        [DragonType.Green]: 'text-mahjong-green',
        [DragonType.White]: 'text-mahjong-blue',
      };
      return (
        <div className="flex items-center justify-center h-full">
          <span className={`font-chinese font-bold ${dragonColors[tile.dragon]}`}>
            {dragonChars[tile.dragon]}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-xs text-gray-500">?</span>
      </div>
    );
  };

  const getTileAltText = () => {
    if (tile.suit === TileSuit.Characters && tile.rank) {
      return `${tile.rank} Characters`;
    }
    if (tile.suit === TileSuit.Bamboos && tile.rank) {
      return `${tile.rank} Bamboos`;
    }
    if (tile.suit === TileSuit.Dots && tile.rank) {
      return `${tile.rank} Dots`;
    }
    if (tile.suit === TileSuit.Winds && tile.wind) {
      return `${tile.wind} Wind`;
    }
    if (tile.suit === TileSuit.Dragons && tile.dragon) {
      return `${tile.dragon} Dragon`;
    }
    return 'Mahjong tile';
  };

  return (
    <div
      className={`
        mahjong-tile
        ${sizeClasses[size]}
        ${isSelected ? 'selected ring-2 ring-blue-500 ring-opacity-75' : ''}
        ${!isSelectable ? 'disabled' : ''}
        ${isAnimating ? 'animate-pulse' : ''}
        transform transition-all duration-200 ease-in-out
        ${isSelectable ? 'hover:scale-105 hover:shadow-xl hover:-translate-y-1' : ''}
        ${isSelected ? 'scale-105 -translate-y-2' : ''}
      `}
      onClick={isSelectable ? onClick : undefined}
      role={isSelectable ? 'button' : undefined}
      tabIndex={isSelectable ? 0 : -1}
      onKeyDown={isSelectable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      title={getTileAltText()}
    >
      {getTileDisplay()}
    </div>
  );
};

export default Tile;