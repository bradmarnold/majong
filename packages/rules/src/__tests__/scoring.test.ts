import { describe, it, expect } from 'vitest';
import { calculateScore, checkSpecialPatterns, meetsMinimumFan, getMinimumFan } from '../scoring.js';
import { HandState, TileSuit, WindType, DragonType, MeldType } from '../types.js';

describe('Scoring System', () => {
  describe('calculateScore', () => {
    it('should award basic win fan', () => {
      const hand: HandState = {
        tiles: [],
        melds: [],
        flowers: [],
        canWin: true,
      };
      
      const score = calculateScore(hand, WindType.East, WindType.East);
      
      expect(score.fan).toBeGreaterThanOrEqual(1);
      expect(score.description).toContain('Basic win');
    });

    it('should award concealed hand fan', () => {
      const hand: HandState = {
        tiles: [],
        melds: [
          {
            type: MeldType.Pon,
            tiles: [
              { id: 'char-1-0', suit: TileSuit.Characters, rank: 1 },
              { id: 'char-1-1', suit: TileSuit.Characters, rank: 1 },
              { id: 'char-1-2', suit: TileSuit.Characters, rank: 1 },
            ],
            isConcealed: true,
          },
        ],
        flowers: [],
        canWin: true,
      };
      
      const score = calculateScore(hand, WindType.East, WindType.East);
      
      expect(score.description).toContain('Concealed hand');
    });

    it('should not award concealed hand fan with exposed melds', () => {
      const hand: HandState = {
        tiles: [],
        melds: [
          {
            type: MeldType.Pon,
            tiles: [
              { id: 'char-1-0', suit: TileSuit.Characters, rank: 1 },
              { id: 'char-1-1', suit: TileSuit.Characters, rank: 1 },
              { id: 'char-1-2', suit: TileSuit.Characters, rank: 1 },
            ],
            isConcealed: false, // Exposed
          },
        ],
        flowers: [],
        canWin: true,
      };
      
      const score = calculateScore(hand, WindType.East, WindType.East);
      
      expect(score.description).not.toContain('Concealed hand');
    });

    it('should award dragon pung/kong fans', () => {
      const hand: HandState = {
        tiles: [],
        melds: [
          {
            type: MeldType.Pon,
            tiles: [
              { id: 'dragon-red-0', suit: TileSuit.Dragons, dragon: DragonType.Red },
              { id: 'dragon-red-1', suit: TileSuit.Dragons, dragon: DragonType.Red },
              { id: 'dragon-red-2', suit: TileSuit.Dragons, dragon: DragonType.Red },
            ],
            isConcealed: true,
          },
        ],
        flowers: [],
        canWin: true,
      };
      
      const score = calculateScore(hand, WindType.East, WindType.East);
      
      expect(score.description.some(desc => desc.includes('Dragon red pon'))).toBe(true);
    });

    it('should award wind pung/kong fans', () => {
      const hand: HandState = {
        tiles: [],
        melds: [
          {
            type: MeldType.Pon,
            tiles: [
              { id: 'wind-east-0', suit: TileSuit.Winds, wind: WindType.East },
              { id: 'wind-east-1', suit: TileSuit.Winds, wind: WindType.East },
              { id: 'wind-east-2', suit: TileSuit.Winds, wind: WindType.East },
            ],
            isConcealed: true,
          },
        ],
        flowers: [],
        canWin: true,
      };
      
      const score = calculateScore(hand, WindType.East, WindType.East);
      
      expect(score.description.some(desc => desc.includes('east wind pon'))).toBe(true);
    });

    it('should award flower fans', () => {
      const hand: HandState = {
        tiles: [],
        melds: [],
        flowers: [
          { id: 'flower-1', suit: TileSuit.Characters, isFlower: true },
          { id: 'flower-2', suit: TileSuit.Characters, isFlower: true },
        ],
        canWin: true,
      };
      
      const score = calculateScore(hand, WindType.East, WindType.East);
      
      expect(score.description.some(desc => desc.includes('2 flower(s)'))).toBe(true);
    });

    it('should calculate points based on fan', () => {
      const hand: HandState = {
        tiles: [],
        melds: [],
        flowers: [],
        canWin: true,
      };
      
      const score = calculateScore(hand, WindType.East, WindType.East);
      
      expect(score.points).toBeGreaterThan(0);
      expect(score.points).toBe(8 * Math.pow(2, Math.min(score.fan, 10)));
    });
  });

  describe('checkSpecialPatterns', () => {
    it('should detect all one suit', () => {
      const hand: HandState = {
        tiles: [
          { id: 'char-1-0', suit: TileSuit.Characters, rank: 1 },
          { id: 'char-2-0', suit: TileSuit.Characters, rank: 2 },
          { id: 'char-3-0', suit: TileSuit.Characters, rank: 3 },
        ],
        melds: [],
        flowers: [],
        canWin: false,
      };
      
      const patterns = checkSpecialPatterns(hand);
      
      expect(patterns.some(p => p.pattern === 'All one suit')).toBe(true);
    });

    it('should detect mixed one suit', () => {
      const hand: HandState = {
        tiles: [
          { id: 'char-1-0', suit: TileSuit.Characters, rank: 1 },
          { id: 'wind-east-0', suit: TileSuit.Winds, wind: WindType.East },
        ],
        melds: [],
        flowers: [],
        canWin: false,
      };
      
      const patterns = checkSpecialPatterns(hand);
      
      expect(patterns.some(p => p.pattern === 'Mixed one suit')).toBe(true);
    });

    it('should detect all terminals and honors', () => {
      const hand: HandState = {
        tiles: [
          { id: 'char-1-0', suit: TileSuit.Characters, rank: 1 },
          { id: 'char-9-0', suit: TileSuit.Characters, rank: 9 },
          { id: 'wind-east-0', suit: TileSuit.Winds, wind: WindType.East },
          { id: 'dragon-red-0', suit: TileSuit.Dragons, dragon: DragonType.Red },
        ],
        melds: [],
        flowers: [],
        canWin: false,
      };
      
      const patterns = checkSpecialPatterns(hand);
      
      expect(patterns.some(p => p.pattern === 'All terminals and honors')).toBe(true);
    });
  });

  describe('minimum fan requirements', () => {
    it('should return correct minimum fan', () => {
      expect(getMinimumFan()).toBe(3);
    });

    it('should check if score meets minimum fan', () => {
      const lowScore = { fan: 2, points: 16, description: ['Basic win'] };
      const highScore = { fan: 4, points: 64, description: ['Basic win', 'Concealed hand'] };
      
      expect(meetsMinimumFan(lowScore)).toBe(false);
      expect(meetsMinimumFan(highScore)).toBe(true);
    });
  });
});