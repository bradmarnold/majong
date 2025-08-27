import { HandState, ScoreResult, Tile, TileSuit, WindType, DragonType, Meld, MeldType } from './types.js';

/**
 * Calculate score for a winning hand
 */
export function calculateScore(hand: HandState, roundWind: WindType, seatWind: WindType): ScoreResult {
  const fans: string[] = [];
  let totalFan = 0;

  // Basic win = 1 fan
  totalFan += 1;
  fans.push('Basic win');

  // Check for concealed hand (no exposed melds)
  const hasExposedMelds = hand.melds.some(meld => !meld.isConcealed);
  if (!hasExposedMelds) {
    totalFan += 1;
    fans.push('Concealed hand');
  }

  // Check for all simples (no terminals or honors)
  const allSimples = hand.tiles.every(tile => 
    tile.rank && tile.rank >= 2 && tile.rank <= 8 &&
    (tile.suit === TileSuit.Characters || tile.suit === TileSuit.Bamboos || tile.suit === TileSuit.Dots)
  );
  if (allSimples) {
    totalFan += 1;
    fans.push('All simples');
  }

  // Check for dragon pungs/kongs
  const dragonMelds = hand.melds.filter(meld => 
    meld.tiles[0].suit === TileSuit.Dragons &&
    (meld.type === MeldType.Pon || meld.type === MeldType.Kong)
  );
  totalFan += dragonMelds.length;
  dragonMelds.forEach(meld => {
    fans.push(`Dragon ${meld.tiles[0].dragon} ${meld.type}`);
  });

  // Check for wind pungs/kongs
  const windMelds = hand.melds.filter(meld => 
    meld.tiles[0].suit === TileSuit.Winds &&
    (meld.type === MeldType.Pon || meld.type === MeldType.Kong)
  );
  
  // Seat wind and round wind are worth more
  windMelds.forEach(meld => {
    const windType = meld.tiles[0].wind;
    if (windType === seatWind || windType === roundWind) {
      totalFan += 1;
      fans.push(`${windType} wind ${meld.type} (seat/round wind)`);
    } else {
      totalFan += 1;
      fans.push(`${windType} wind ${meld.type}`);
    }
  });

  // Check for kongs (worth extra)
  const kongs = hand.melds.filter(meld => meld.type === MeldType.Kong);
  kongs.forEach(kong => {
    totalFan += 1;
    fans.push(`Kong bonus`);
  });

  // Check for flowers
  if (hand.flowers.length > 0) {
    totalFan += hand.flowers.length;
    fans.push(`${hand.flowers.length} flower(s)`);
  }

  // Calculate points (simplified Hong Kong style)
  const basePoints = 8; // Minimum points
  const points = basePoints * Math.pow(2, Math.min(totalFan, 10)); // Cap at reasonable level

  return {
    fan: totalFan,
    points,
    description: fans,
  };
}

/**
 * Check if hand contains specific patterns for advanced scoring
 */
export function checkSpecialPatterns(hand: HandState): { pattern: string; fan: number }[] {
  const patterns: { pattern: string; fan: number }[] = [];

  // All one suit
  const suits = new Set(hand.tiles.map(tile => tile.suit));
  if (suits.size === 1 && !suits.has(TileSuit.Winds) && !suits.has(TileSuit.Dragons)) {
    patterns.push({ pattern: 'All one suit', fan: 6 });
  }

  // Mixed one suit (one suit + honors)
  if (suits.size === 2 && 
      (suits.has(TileSuit.Winds) || suits.has(TileSuit.Dragons)) &&
      (suits.has(TileSuit.Characters) || suits.has(TileSuit.Bamboos) || suits.has(TileSuit.Dots))) {
    patterns.push({ pattern: 'Mixed one suit', fan: 3 });
  }

  // All terminals and honors
  const allTerminalsAndHonors = hand.tiles.every(tile => 
    tile.suit === TileSuit.Winds || 
    tile.suit === TileSuit.Dragons ||
    tile.rank === 1 || 
    tile.rank === 9
  );
  if (allTerminalsAndHonors) {
    patterns.push({ pattern: 'All terminals and honors', fan: 13 });
  }

  return patterns;
}

/**
 * Get minimum fan required to win (Hong Kong rules)
 */
export function getMinimumFan(): number {
  return 3; // 3 fan minimum in Hong Kong Mahjong
}

/**
 * Check if a hand meets minimum fan requirement
 */
export function meetsMinimumFan(score: ScoreResult): boolean {
  return score.fan >= getMinimumFan();
}