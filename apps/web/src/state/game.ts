import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GameState, ActionType, Action, Tile } from '@majong/rules';
import { createGame, processAction, getValidActions } from '@majong/rules';

interface UIState {
  selectedTileId: string | null;
  isTeachingDrawerOpen: boolean;
  currentTip: string | null;
  showControls: boolean;
  animatingTile: string | null;
}

interface GameStore {
  // Game state
  game: GameState | null;
  validActions: ActionType[];
  
  // UI state
  ui: UIState;
  
  // Actions
  startNewGame: (playerNames: string[]) => void;
  performAction: (action: Action) => void;
  selectTile: (tileId: string | null) => void;
  discardSelectedTile: () => void;
  drawTile: () => void;
  toggleTeachingDrawer: () => void;
  requestTeachingTip: () => void;
  
  // Bot actions
  performBotAction: (playerId: string) => void;
}

const initialUIState: UIState = {
  selectedTileId: null,
  isTeachingDrawerOpen: false,
  currentTip: null,
  showControls: true,
  animatingTile: null,
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    game: null,
    validActions: [],
    ui: initialUIState,

    startNewGame: (playerNames: string[]) => {
      const game = createGame(playerNames, Date.now());
      const validActions = getValidActions(game);
      
      set({
        game,
        validActions,
        ui: { ...initialUIState },
      });
    },

    performAction: (action: Action) => {
      const { game } = get();
      if (!game) return;

      const result = processAction(game, action);
      if (result.valid && result.newState) {
        const validActions = getValidActions(result.newState);
        
        set({
          game: result.newState,
          validActions,
          ui: {
            ...get().ui,
            selectedTileId: null,
            animatingTile: action.tileId || null,
          },
        });

        // Clear animation after delay
        setTimeout(() => {
          set(state => ({
            ui: { ...state.ui, animatingTile: null }
          }));
        }, 300);

        // Handle bot turns
        setTimeout(() => {
          const currentGame = get().game;
          if (currentGame && currentGame.currentPlayer !== 'player-0') {
            get().performBotAction(currentGame.currentPlayer);
          }
        }, 1000);
      }
    },

    selectTile: (tileId: string | null) => {
      set(state => ({
        ui: { ...state.ui, selectedTileId: tileId }
      }));
    },

    discardSelectedTile: () => {
      const { game, ui } = get();
      if (!game || !ui.selectedTileId || game.currentPlayer !== 'player-0') return;

      const action: Action = {
        type: ActionType.Discard,
        playerId: 'player-0',
        tileId: ui.selectedTileId,
      };

      get().performAction(action);
    },

    drawTile: () => {
      const { game } = get();
      if (!game || game.currentPlayer !== 'player-0') return;

      const action: Action = {
        type: ActionType.Draw,
        playerId: 'player-0',
      };

      get().performAction(action);
    },

    toggleTeachingDrawer: () => {
      set(state => ({
        ui: {
          ...state.ui,
          isTeachingDrawerOpen: !state.ui.isTeachingDrawerOpen,
        }
      }));
    },

    requestTeachingTip: async () => {
      const { game } = get();
      if (!game) return;

      try {
        // Call the API for a real teaching tip
        const response = await fetch('/api/help', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            state: {
              phase: game.phase,
              players: game.players.length,
              wall: game.wall.length,
              currentPlayer: game.currentPlayer,
            },
            context: `Player has ${game.players[0]?.hand?.tiles?.length || 0} tiles in hand.`,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          set(state => ({
            ui: { ...state.ui, currentTip: data.tip }
          }));
        } else {
          throw new Error('API request failed');
        }
      } catch (error) {
        console.error('Failed to get teaching tip:', error);
        
        // Fallback tip
        const tip = "Focus on completing simple sets like pungs (3 identical tiles) and chis (3 consecutive tiles of the same suit). Keep your hand organized and watch what other players discard!";
        
        set(state => ({
          ui: { ...state.ui, currentTip: tip }
        }));
      }
    },

    performBotAction: (playerId: string) => {
      const { game, validActions } = get();
      if (!game || game.currentPlayer !== playerId) return;

      // Simple bot logic - randomly pick a valid action
      if (validActions.includes(ActionType.Draw) && game.phase === 'drawing') {
        const action: Action = {
          type: ActionType.Draw,
          playerId,
        };
        get().performAction(action);
      } else if (validActions.includes(ActionType.Discard) && game.phase === 'discarding') {
        const player = game.players.find(p => p.id === playerId);
        if (player && player.hand.tiles.length > 0) {
          // Bot discards a random tile (simple strategy)
          const randomTile = player.hand.tiles[Math.floor(Math.random() * player.hand.tiles.length)];
          const action: Action = {
            type: ActionType.Discard,
            playerId,
            tileId: randomTile.id,
          };
          get().performAction(action);
        }
      }
    },
  }))
);