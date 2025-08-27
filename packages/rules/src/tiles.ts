import { Tile, TileSuit, WindType, DragonType } from './types.js';

/**
 * Generate deterministic tile set for Hong Kong Mahjong (136 tiles)
 */
export function createTileSet(): Tile[] {
  const tiles: Tile[] = [];
  let id = 0;

  // Characters 1-9 (4 of each) = 36 tiles
  for (let rank = 1; rank <= 9; rank++) {
    for (let copy = 0; copy < 4; copy++) {
      tiles.push({
        id: `char-${rank}-${copy}`,
        suit: TileSuit.Characters,
        rank,
      });
    }
  }

  // Bamboos 1-9 (4 of each) = 36 tiles
  for (let rank = 1; rank <= 9; rank++) {
    for (let copy = 0; copy < 4; copy++) {
      tiles.push({
        id: `bamboo-${rank}-${copy}`,
        suit: TileSuit.Bamboos,
        rank,
      });
    }
  }

  // Dots 1-9 (4 of each) = 36 tiles
  for (let rank = 1; rank <= 9; rank++) {
    for (let copy = 0; copy < 4; copy++) {
      tiles.push({
        id: `dots-${rank}-${copy}`,
        suit: TileSuit.Dots,
        rank,
      });
    }
  }

  // Winds (4 of each) = 16 tiles
  const winds = [WindType.East, WindType.South, WindType.West, WindType.North];
  for (const wind of winds) {
    for (let copy = 0; copy < 4; copy++) {
      tiles.push({
        id: `wind-${wind}-${copy}`,
        suit: TileSuit.Winds,
        wind,
      });
    }
  }

  // Dragons (4 of each) = 12 tiles
  const dragons = [DragonType.Red, DragonType.Green, DragonType.White];
  for (const dragon of dragons) {
    for (let copy = 0; copy < 4; copy++) {
      tiles.push({
        id: `dragon-${dragon}-${copy}`,
        suit: TileSuit.Dragons,
        dragon,
      });
    }
  }

  return tiles;
}

/**
 * Shuffle tiles using Fisher-Yates algorithm with optional seed for deterministic results
 */
export function shuffleTiles(tiles: Tile[], seed?: number): Tile[] {
  const shuffled = [...tiles];
  const rng = seed ? seededRandom(seed) : Math.random;
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Simple seeded random number generator for deterministic shuffling
 */
function seededRandom(seed: number): () => number {
  let x = Math.sin(seed) * 10000;
  return () => {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
}

/**
 * Deal initial hands to 4 players (13 tiles each, dealer gets 14)
 */
export function dealHands(wall: Tile[]): { hands: Tile[][], remainingWall: Tile[] } {
  const hands: Tile[][] = [[], [], [], []];
  let dealIndex = 0;

  // Deal 13 tiles to each player
  for (let round = 0; round < 13; round++) {
    for (let player = 0; player < 4; player++) {
      if (dealIndex < wall.length) {
        hands[player].push(wall[dealIndex++]);
      }
    }
  }

  // Dealer (player 0) gets one extra tile
  if (dealIndex < wall.length) {
    hands[0].push(wall[dealIndex++]);
  }

  return {
    hands,
    remainingWall: wall.slice(dealIndex),
  };
}

/**
 * Check if tiles form a valid meld
 */
export function isValidMeld(tiles: Tile[]): { valid: boolean; type?: string } {
  if (tiles.length < 3 || tiles.length > 4) {
    return { valid: false };
  }

  // Check for Kong (4 identical)
  if (tiles.length === 4 && tiles.every(tile => tilesEqual(tile, tiles[0]))) {
    return { valid: true, type: 'kong' };
  }

  // Check for Pon (3 identical)
  if (tiles.length === 3 && tiles.every(tile => tilesEqual(tile, tiles[0]))) {
    return { valid: true, type: 'pon' };
  }

  // Check for Chi (3 consecutive same suit)
  if (tiles.length === 3) {
    const sorted = [...tiles].sort((a, b) => (a.rank || 0) - (b.rank || 0));
    const sameSuit = sorted.every(tile => tile.suit === sorted[0].suit);
    const consecutive = sorted[0].rank && sorted[1].rank && sorted[2].rank &&
      sorted[1].rank === sorted[0].rank + 1 &&
      sorted[2].rank === sorted[1].rank + 1;
    
    if (sameSuit && consecutive) {
      return { valid: true, type: 'chi' };
    }
  }

  return { valid: false };
}

/**
 * Check if two tiles are identical (same suit, rank, wind, or dragon)
 */
export function tilesEqual(a: Tile, b: Tile): boolean {
  return a.suit === b.suit &&
         a.rank === b.rank &&
         a.wind === b.wind &&
         a.dragon === b.dragon;
}

/**
 * Sort tiles for display (by suit, then rank)
 */
export function sortTiles(tiles: Tile[]): Tile[] {
  return [...tiles].sort((a, b) => {
    // Sort by suit first
    const suitOrder = [TileSuit.Characters, TileSuit.Bamboos, TileSuit.Dots, TileSuit.Winds, TileSuit.Dragons];
    const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;

    // Then by rank/wind/dragon
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.wind && b.wind) {
      const windOrder = [WindType.East, WindType.South, WindType.West, WindType.North];
      return windOrder.indexOf(a.wind) - windOrder.indexOf(b.wind);
    }
    if (a.dragon && b.dragon) {
      const dragonOrder = [DragonType.Red, DragonType.Green, DragonType.White];
      return dragonOrder.indexOf(a.dragon) - dragonOrder.indexOf(b.dragon);
    }

    return 0;
  });
}