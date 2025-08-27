import { describe, it, expect } from 'vitest';
import { createGame, processAction, getValidActions, getNextPlayer } from '../game.js';
import { ActionType, WindType } from '../types.js';

describe('Game Engine', () => {
  describe('createGame', () => {
    it('should create a valid initial game state', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'David'];
      const game = createGame(players, 12345); // Use seed for deterministic test
      
      expect(game.players).toHaveLength(4);
      expect(game.players[0].name).toBe('Alice');
      expect(game.players[0].isDealer).toBe(true);
      expect(game.players[0].wind).toBe(WindType.East);
      
      // Dealer should have 14 tiles, others 13
      expect(game.players[0].hand.tiles).toHaveLength(14);
      expect(game.players[1].hand.tiles).toHaveLength(13);
      expect(game.players[2].hand.tiles).toHaveLength(13);
      expect(game.players[3].hand.tiles).toHaveLength(13);
      
      expect(game.currentPlayer).toBe('player-0'); // Dealer starts
      expect(game.phase).toBe('discarding'); // Dealer starts by discarding
      expect(game.roundWind).toBe(WindType.East);
    });

    it('should assign correct winds to players', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'David'];
      const game = createGame(players);
      
      expect(game.players[0].wind).toBe(WindType.East);
      expect(game.players[1].wind).toBe(WindType.South);
      expect(game.players[2].wind).toBe(WindType.West);
      expect(game.players[3].wind).toBe(WindType.North);
    });

    it('should mark non-first players as bots', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'David'];
      const game = createGame(players);
      
      expect(game.players[0].isBot).toBe(false);
      expect(game.players[1].isBot).toBe(true);
      expect(game.players[2].isBot).toBe(true);
      expect(game.players[3].isBot).toBe(true);
    });
  });

  describe('processAction', () => {
    it('should process valid discard action', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'David'];
      const game = createGame(players, 12345);
      
      // Dealer should start by discarding
      const tileToDiscard = game.players[0].hand.tiles[0];
      const action = {
        type: ActionType.Discard,
        playerId: 'player-0',
        tileId: tileToDiscard.id,
      };
      
      const result = processAction(game, action);
      
      expect(result.valid).toBe(true);
      expect(result.newState).toBeDefined();
      if (result.newState) {
        expect(result.newState.players[0].hand.tiles).toHaveLength(13);
        expect(result.newState.discards[0]).toHaveLength(1);
        expect(result.newState.currentPlayer).toBe('player-1'); // Next player
        expect(result.newState.phase).toBe('drawing');
      }
    });

    it('should reject discard when not in discarding phase', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'David'];
      const game = createGame(players, 12345);
      
      // Force game into drawing phase
      game.phase = 'drawing';
      
      const action = {
        type: ActionType.Discard,
        playerId: 'player-0',
        tileId: game.players[0].hand.tiles[0].id,
      };
      
      const result = processAction(game, action);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot discard in current phase');
    });

    it('should reject action from wrong player', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'David'];
      const game = createGame(players, 12345);
      
      const action = {
        type: ActionType.Discard,
        playerId: 'player-1', // Not current player
        tileId: game.players[1].hand.tiles[0].id,
      };
      
      const result = processAction(game, action);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Not your turn');
    });

    it('should process valid draw action', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'David'];
      const game = createGame(players, 12345);
      
      // Move to drawing phase with next player
      game.phase = 'drawing';
      game.currentPlayer = 'player-1';
      
      const initialTileCount = game.players[1].hand.tiles.length;
      const initialWallSize = game.wall.length;
      
      const action = {
        type: ActionType.Draw,
        playerId: 'player-1',
      };
      
      const result = processAction(game, action);
      
      expect(result.valid).toBe(true);
      expect(result.newState).toBeDefined();
      if (result.newState) {
        expect(result.newState.players[1].hand.tiles).toHaveLength(initialTileCount + 1);
        expect(result.newState.wall).toHaveLength(initialWallSize - 1);
        expect(result.newState.phase).toBe('discarding');
      }
    });
  });

  describe('getValidActions', () => {
    it('should return correct actions for discarding phase', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'David'];
      const game = createGame(players, 12345);
      
      // Game starts in discarding phase
      const actions = getValidActions(game);
      
      expect(actions).toContain(ActionType.Discard);
      expect(actions).toContain(ActionType.Pass);
    });

    it('should return correct actions for drawing phase', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'David'];
      const game = createGame(players, 12345);
      
      game.phase = 'drawing';
      const actions = getValidActions(game);
      
      expect(actions).toContain(ActionType.Draw);
      expect(actions).toContain(ActionType.Pass);
    });
  });

  describe('getNextPlayer', () => {
    it('should cycle through players correctly', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'David'];
      const game = createGame(players);
      
      expect(getNextPlayer(game, 'player-0')).toBe('player-1');
      expect(getNextPlayer(game, 'player-1')).toBe('player-2');
      expect(getNextPlayer(game, 'player-2')).toBe('player-3');
      expect(getNextPlayer(game, 'player-3')).toBe('player-0'); // Cycle back
    });
  });
});