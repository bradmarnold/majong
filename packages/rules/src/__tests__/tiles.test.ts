import { describe, it, expect } from 'vitest';
import { createTileSet, shuffleTiles, dealHands, isValidMeld, tilesEqual, sortTiles } from '../tiles.js';
import { TileSuit, WindType, DragonType } from '../types.js';

describe('Tile System', () => {
  describe('createTileSet', () => {
    it('should create exactly 136 tiles', () => {
      const tiles = createTileSet();
      expect(tiles).toHaveLength(136);
    });

    it('should have 4 copies of each tile type', () => {
      const tiles = createTileSet();
      
      // Characters 1-9: 36 tiles
      const characters = tiles.filter(t => t.suit === TileSuit.Characters);
      expect(characters).toHaveLength(36);
      
      // Each rank should have 4 copies
      for (let rank = 1; rank <= 9; rank++) {
        const rankTiles = characters.filter(t => t.rank === rank);
        expect(rankTiles).toHaveLength(4);
      }
    });

    it('should create all wind and dragon tiles', () => {
      const tiles = createTileSet();
      
      // Winds: 16 tiles
      const winds = tiles.filter(t => t.suit === TileSuit.Winds);
      expect(winds).toHaveLength(16);
      
      // Dragons: 12 tiles
      const dragons = tiles.filter(t => t.suit === TileSuit.Dragons);
      expect(dragons).toHaveLength(12);
    });

    it('should have unique IDs for all tiles', () => {
      const tiles = createTileSet();
      const ids = tiles.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(tiles.length);
    });
  });

  describe('shuffleTiles', () => {
    it('should maintain same number of tiles', () => {
      const tiles = createTileSet();
      const shuffled = shuffleTiles(tiles);
      expect(shuffled).toHaveLength(tiles.length);
    });

    it('should produce different order (most of the time)', () => {
      const tiles = createTileSet();
      const shuffled = shuffleTiles(tiles);
      
      // Check if at least some positions changed
      let changedPositions = 0;
      for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].id !== shuffled[i].id) {
          changedPositions++;
        }
      }
      
      // Expect at least 50% positions to change
      expect(changedPositions).toBeGreaterThan(tiles.length * 0.5);
    });

    it('should be deterministic with seed', () => {
      const tiles = createTileSet();
      const shuffled1 = shuffleTiles(tiles, 12345);
      const shuffled2 = shuffleTiles(tiles, 12345);
      
      expect(shuffled1.map(t => t.id)).toEqual(shuffled2.map(t => t.id));
    });
  });

  describe('dealHands', () => {
    it('should deal 13 tiles to each player, 14 to dealer', () => {
      const tiles = createTileSet();
      const { hands } = dealHands(tiles);
      
      expect(hands).toHaveLength(4);
      expect(hands[0]).toHaveLength(14); // Dealer
      expect(hands[1]).toHaveLength(13);
      expect(hands[2]).toHaveLength(13);
      expect(hands[3]).toHaveLength(13);
    });

    it('should leave correct number of tiles in wall', () => {
      const tiles = createTileSet();
      const { remainingWall } = dealHands(tiles);
      
      // 136 - (14 + 13 + 13 + 13) = 83 tiles remaining
      expect(remainingWall).toHaveLength(83);
    });
  });

  describe('isValidMeld', () => {
    it('should recognize valid pongs', () => {
      const tiles = createTileSet();
      const pong = tiles.filter(t => t.suit === TileSuit.Characters && t.rank === 1).slice(0, 3);
      
      const result = isValidMeld(pong);
      expect(result.valid).toBe(true);
      expect(result.type).toBe('pon');
    });

    it('should recognize valid kongs', () => {
      const tiles = createTileSet();
      const kong = tiles.filter(t => t.suit === TileSuit.Characters && t.rank === 1);
      
      const result = isValidMeld(kong);
      expect(result.valid).toBe(true);
      expect(result.type).toBe('kong');
    });

    it('should recognize valid chis', () => {
      const tiles = createTileSet();
      const chi = [
        tiles.find(t => t.suit === TileSuit.Characters && t.rank === 1)!,
        tiles.find(t => t.suit === TileSuit.Characters && t.rank === 2)!,
        tiles.find(t => t.suit === TileSuit.Characters && t.rank === 3)!,
      ];
      
      const result = isValidMeld(chi);
      expect(result.valid).toBe(true);
      expect(result.type).toBe('chi');
    });

    it('should reject invalid melds', () => {
      const tiles = createTileSet();
      const invalid = [
        tiles.find(t => t.suit === TileSuit.Characters && t.rank === 1)!,
        tiles.find(t => t.suit === TileSuit.Bamboos && t.rank === 2)!,
        tiles.find(t => t.suit === TileSuit.Dots && t.rank === 3)!,
      ];
      
      const result = isValidMeld(invalid);
      expect(result.valid).toBe(false);
    });
  });

  describe('tilesEqual', () => {
    it('should correctly identify equal tiles', () => {
      const tiles = createTileSet();
      const tile1 = tiles[0];
      const tile2 = { ...tile1, id: 'different-id' }; // Same tile, different ID
      
      expect(tilesEqual(tile1, tile2)).toBe(true);
    });

    it('should correctly identify different tiles', () => {
      const tiles = createTileSet();
      const char1 = tiles.find(t => t.suit === TileSuit.Characters && t.rank === 1)!;
      const char2 = tiles.find(t => t.suit === TileSuit.Characters && t.rank === 2)!;
      
      expect(tilesEqual(char1, char2)).toBe(false);
    });
  });

  describe('sortTiles', () => {
    it('should sort tiles by suit and rank', () => {
      const tiles = createTileSet();
      const unsorted = [
        tiles.find(t => t.suit === TileSuit.Dragons && t.dragon === DragonType.Red)!,
        tiles.find(t => t.suit === TileSuit.Characters && t.rank === 1)!,
        tiles.find(t => t.suit === TileSuit.Winds && t.wind === WindType.East)!,
        tiles.find(t => t.suit === TileSuit.Characters && t.rank === 9)!,
      ];
      
      const sorted = sortTiles(unsorted);
      
      expect(sorted[0].suit).toBe(TileSuit.Characters);
      expect(sorted[0].rank).toBe(1);
      expect(sorted[1].suit).toBe(TileSuit.Characters);
      expect(sorted[1].rank).toBe(9);
      expect(sorted[2].suit).toBe(TileSuit.Winds);
      expect(sorted[3].suit).toBe(TileSuit.Dragons);
    });
  });
});