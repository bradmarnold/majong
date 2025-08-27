export enum TileSuit {
  Characters = 'characters',
  Bamboos = 'bamboos',
  Dots = 'dots',
  Winds = 'winds',
  Dragons = 'dragons',
}

export enum WindType {
  East = 'east',
  South = 'south',
  West = 'west',
  North = 'north',
}

export enum DragonType {
  Red = 'red',
  Green = 'green',
  White = 'white',
}

export interface Tile {
  id: string;
  suit: TileSuit;
  rank?: number; // 1-9 for suits
  wind?: WindType;
  dragon?: DragonType;
  isFlower?: boolean;
}

export enum MeldType {
  Chi = 'chi',     // 3 consecutive same suit
  Pon = 'pon',     // 3 identical tiles
  Kong = 'kong',   // 4 identical tiles
}

export interface Meld {
  type: MeldType;
  tiles: Tile[];
  isConcealed: boolean;
}

export interface HandState {
  tiles: Tile[];
  melds: Meld[];
  flowers: Tile[];
  canWin: boolean;
  winningTile?: Tile;
}

export enum ActionType {
  Draw = 'draw',
  Discard = 'discard',
  Chi = 'chi',
  Pon = 'pon',
  Kong = 'kong',
  Win = 'win',
  Pass = 'pass',
}

export interface Action {
  type: ActionType;
  playerId: string;
  tileId?: string;
  meld?: Meld;
}

export interface ActionResult {
  valid: boolean;
  error?: string;
  newState?: GameState;
}

export interface Player {
  id: string;
  name: string;
  hand: HandState;
  isDealer: boolean;
  wind: WindType;
  isBot: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayer: string;
  wall: Tile[];
  discards: Tile[][];
  round: number;
  roundWind: WindType;
  phase: 'drawing' | 'discarding' | 'claiming' | 'ended';
  lastAction?: Action;
}

export interface ScoreResult {
  fan: number;
  points: number;
  description: string[];
}