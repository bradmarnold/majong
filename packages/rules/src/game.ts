import { GameState, Player, Action, ActionType, ActionResult, WindType, HandState, Tile } from './types.js';
import { createTileSet, shuffleTiles, dealHands, sortTiles } from './tiles.js';

/**
 * Create a new game with 4 players
 */
export function createGame(playerNames: string[], seed?: number): GameState {
  const tileSet = createTileSet();
  const shuffledWall = shuffleTiles(tileSet, seed);
  const { hands, remainingWall } = dealHands(shuffledWall);

  const winds = [WindType.East, WindType.South, WindType.West, WindType.North];
  
  const players: Player[] = playerNames.map((name, index) => ({
    id: `player-${index}`,
    name,
    isDealer: index === 0,
    wind: winds[index],
    isBot: index > 0, // Only first player is human
    hand: {
      tiles: sortTiles(hands[index]),
      melds: [],
      flowers: [],
      canWin: false,
    },
  }));

  return {
    players,
    currentPlayer: players[0].id, // Dealer starts
    wall: remainingWall,
    discards: [[], [], [], []],
    round: 1,
    roundWind: WindType.East,
    phase: 'discarding', // Dealer starts with 14 tiles, should discard
  };
}

/**
 * Process a game action and return the result
 */
export function processAction(state: GameState, action: Action): ActionResult {
  try {
    switch (action.type) {
      case ActionType.Draw:
        return processDraw(state, action);
      case ActionType.Discard:
        return processDiscard(state, action);
      case ActionType.Chi:
      case ActionType.Pon:
      case ActionType.Kong:
        return processClaim(state, action);
      case ActionType.Pass:
        return processPass(state, action);
      default:
        return { valid: false, error: 'Unknown action type' };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function processDraw(state: GameState, action: Action): ActionResult {
  if (state.phase !== 'drawing') {
    return { valid: false, error: 'Cannot draw in current phase' };
  }

  if (action.playerId !== state.currentPlayer) {
    return { valid: false, error: 'Not your turn to draw' };
  }

  if (state.wall.length === 0) {
    return { valid: false, error: 'Wall is empty' };
  }

  const newState = { ...state };
  const player = newState.players.find(p => p.id === action.playerId);
  if (!player) {
    return { valid: false, error: 'Player not found' };
  }

  // Draw a tile from the wall
  const drawnTile = newState.wall.shift()!;
  player.hand.tiles.push(drawnTile);
  player.hand.tiles = sortTiles(player.hand.tiles);

  newState.phase = 'discarding';
  
  return { valid: true, newState };
}

function processDiscard(state: GameState, action: Action): ActionResult {
  if (state.phase !== 'discarding') {
    return { valid: false, error: 'Cannot discard in current phase' };
  }

  if (action.playerId !== state.currentPlayer) {
    return { valid: false, error: 'Not your turn to discard' };
  }

  if (!action.tileId) {
    return { valid: false, error: 'No tile specified for discard' };
  }

  const newState = { ...state };
  const player = newState.players.find(p => p.id === action.playerId);
  if (!player) {
    return { valid: false, error: 'Player not found' };
  }

  const tileIndex = player.hand.tiles.findIndex(t => t.id === action.tileId);
  if (tileIndex === -1) {
    return { valid: false, error: 'Tile not in hand' };
  }

  // Remove tile from hand and add to discard pile
  const discardedTile = player.hand.tiles.splice(tileIndex, 1)[0];
  const playerIndex = newState.players.findIndex(p => p.id === action.playerId);
  newState.discards[playerIndex].push(discardedTile);

  // Move to next player
  newState.currentPlayer = getNextPlayer(newState, action.playerId);
  newState.phase = 'drawing';
  newState.lastAction = action;

  return { valid: true, newState };
}

function processClaim(state: GameState, action: Action): ActionResult {
  // Placeholder for meld claiming logic
  return { valid: false, error: 'Claiming not implemented yet' };
}

function processPass(state: GameState, action: Action): ActionResult {
  // Continue to next action or player
  const newState = { ...state };
  newState.phase = 'drawing';
  return { valid: true, newState };
}

/**
 * Get the next player in turn order
 */
export function getNextPlayer(state: GameState, currentPlayerId: string): string {
  const currentIndex = state.players.findIndex(p => p.id === currentPlayerId);
  const nextIndex = (currentIndex + 1) % state.players.length;
  return state.players[nextIndex].id;
}

/**
 * Get valid actions for the current game state
 */
export function getValidActions(state: GameState): ActionType[] {
  const actions: ActionType[] = [];

  if (state.phase === 'drawing' && state.wall.length > 0) {
    actions.push(ActionType.Draw);
  }

  if (state.phase === 'discarding') {
    actions.push(ActionType.Discard);
  }

  // TODO: Add claiming actions based on last discard
  actions.push(ActionType.Pass);

  return actions;
}

/**
 * Check if a player can win with their current hand
 */
export function canWin(hand: HandState): boolean {
  // Simplified win condition: 14 tiles = 4 melds + 1 pair
  // This is a stub - real implementation would check for valid winning patterns
  const totalTiles = hand.tiles.length + (hand.melds.length * 3);
  return totalTiles === 14;
}