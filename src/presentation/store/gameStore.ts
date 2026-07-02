import { create } from 'zustand';
import { createClient } from '@liveblocks/client';
import { liveblocks } from '@liveblocks/zustand';
import { v4 as uuid } from '../../core/utils/uuid';
import type {
  GameState,
  CorporationState,
  ActionType,
  RegionId,
  CreateGameConfig,
} from '../../core/domain/types';
import { CORPORATIONS } from '../../core/data/corporations';
import { INITIAL_REGIONS } from '../../core/data/regions';
import { EVENT_CARDS, shuffleCards } from '../../core/data/eventCards';
import { GameService } from '../../core/services/GameService';
import { AIEngine } from '../../core/engines/AIEngine';

const PLAYER_COLORS = ['#E63946', '#F4D03F', '#22C55E', '#3B82F6'];

// Initialize Liveblocks Client
const LIVEBLOCKS_KEY = import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY as string;

if (!LIVEBLOCKS_KEY) {
  console.error(
    '[MLN122] Missing VITE_LIVEBLOCKS_PUBLIC_KEY environment variable.\n' +
    'Add it to your .env file (local) or Vercel Environment Variables (production).'
  );
}

export const client = createClient({
  publicApiKey: LIVEBLOCKS_KEY ?? 'MISSING_KEY',
});

interface GameStore {
  game: GameState | null;
  isLoading: boolean;
  liveblocks: {
    enterRoom: (roomId: string) => () => void;
    leaveRoom: () => void;
  };

  // Game lifecycle
  createGame: (config: CreateGameConfig) => void;
  loadSavedGame: () => boolean;
  clearGame: () => void;
  saveCurrentGame: () => void;

  // Turn flow
  rollDice: () => void;
  selectAction: (actionType: ActionType, regionId?: RegionId, targetId?: string) => void;
  drawEventCard: () => void;
  resolveEventCard: (choiceIndex: 0 | 1) => void;
  endTurn: () => void;
  skipToNextPhase: () => void;
  dismissIncomeSummary: () => void;
  
  // Voting
  castVote: (playerId: string, choiceIndex: 0 | 1) => void;
  resolveVoting: () => void;

  // AI
  executeAITurn: () => void;
}

export const useGameStore = create<GameStore>()(
  liveblocks(
    (set, get) => ({
      game: null,
      isLoading: false,

      createGame: (config) => {
        const eventDeck = shuffleCards([...EVENT_CARDS]);

        const corporations: CorporationState[] = config.corporations.map((cc, i) => {
          const corpId = uuid();
          return {
            id: corpId,
            corporation: CORPORATIONS.find((c) => c.id === cc.corporationId)!,
            money: 500,
            missionScore: 50,
            efficiencyScore: 50,
            ownedRegions: [],
            position: i * 2, // Spread starting positions
            isAI: cc.isAI,
            skipTurns: 0,
            upgradeDelay: 0,
            scoreHistory: [],
            achievements: [],
            color: PLAYER_COLORS[i % PLAYER_COLORS.length],
            players: cc.players.map((p) => ({
              id: uuid(),
              name: p.name,
              role: p.role,
              corporationId: cc.corporationId,
              hiddenKpi: '',
            })),
          };
        });

        const game: GameState = {
          id: uuid(), // This will be the game id / room id theoretically
          status: 'PLAYING',
          mode: config.mode,
          aiDifficulty: config.aiDifficulty,
          corporations,
          activeCorporationIndex: 0,
          turn: 1,
          maxTurns: config.maxTurns,
          discussionTimer: config.discussionTimer,
          phase: 'ROLL_DICE',
          actionDeadline: Date.now() + 30000,
          regions: { ...INITIAL_REGIONS },
          eventDeck,
          discardedEvents: [],
          activeEvent: null,
          activePolicies: [],
          activeIncomeSummary: null,
          diceValue: null,

          log: [
            {
              id: uuid(),
              turn: 1,
              playerId: 'SYSTEM',
              playerName: 'Hệ thống',
              corporationId: 'EVN',
              message: 'Trò chơi Cán Cân Vĩ Mô bắt đầu! Chúc các CEO may mắn.',
              type: 'SYSTEM',
              timestamp: Date.now(),
            },
          ],
          winner: null,
          finalScores: [],
          createdAt: Date.now(),
          lastSavedAt: Date.now(),
        };

        set({ game });
      },

      loadSavedGame: () => {
        // Disabled local storage loading, as state is now synced via Liveblocks.
        // The room enter logic will handle pulling the initial state.
        return false; 
      },

      clearGame: () => {
        set({ game: null });
      },

      saveCurrentGame: () => {
        // Auto-handled by liveblocks middleware mapping
      },

      rollDice: () => {
        set((state) => {
          if (!state.game || state.game.status !== 'PLAYING') return state;
          return { game: GameService.rollDice(state.game) };
        });
      },

      selectAction: (actionType, regionId?, targetId?) => {
        set((state) => {
          if (!state.game || state.game.status !== 'PLAYING') return state;
          return { game: GameService.selectAction(state.game, actionType, regionId, targetId) };
        });
      },

      drawEventCard: () => {
        set((state) => {
          if (!state.game || state.game.status !== 'PLAYING') return state;
          return { game: GameService.drawEventCard(state.game) };
        });
      },

      resolveEventCard: (choiceIndex) => {
        set((state) => {
          if (!state.game || state.game.status !== 'PLAYING') return state;
          return { game: GameService.resolveEventCard(state.game, choiceIndex) };
        });
      },

      castVote: (playerId, choiceIndex) => {
        set((state) => {
          if (!state.game || state.game.status !== 'PLAYING') return state;
          return { game: GameService.castVote(state.game, playerId, choiceIndex) };
        });
      },

      resolveVoting: () => {
        set((state) => {
          if (!state.game || state.game.status !== 'PLAYING') return state;
          return { game: GameService.resolveVoting(state.game) };
        });
      },



      endTurn: () => {
        set((state) => {
          if (!state.game || state.game.status !== 'PLAYING') return state;
          const nextGame = GameService.endTurn(state.game);
          return { game: GameService.checkGameOver(nextGame) };
        });

        // AI Check
        setTimeout(() => {
          const { game, executeAITurn } = get();
          if (game?.status === 'PLAYING') {
            const nextCorp = game.corporations[game.activeCorporationIndex];
            if (nextCorp?.isAI) {
              executeAITurn();
            }
          }
        }, 500);
      },

      skipToNextPhase: () => {
        set((state) => {
          if (!state.game || state.game.status !== 'PLAYING') return state;
          return { game: GameService.skipToNextPhase(state.game) };
        });
      },

      dismissIncomeSummary: () => {
        set((state) => {
          if (!state.game) return state;
          return { game: { ...state.game, activeIncomeSummary: null } };
        });
      },

      executeAITurn: () => {
        const { game } = get();
        if (!game) return;

        const corp = game.corporations[game.activeCorporationIndex];
        if (!corp.isAI) return;

        const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

        const runAI = async () => {
          get().rollDice();
          await delay(2500);

          const currentActionState = get().game;
          if (!currentActionState) return;
          const action = AIEngine.decideAction(corp, currentActionState, currentActionState.aiDifficulty);
          get().selectAction(action);
          await delay(1500);

          get().drawEventCard();
          await delay(2000);

          const currentEventState = get().game;
          if (currentEventState?.activeEvent) {
            const choice = AIEngine.chooseCardOption(corp, currentEventState, currentEventState.aiDifficulty);
            get().resolveEventCard(choice);
            await delay(1500);
          }

          const afterEvent = get().game;
          if (afterEvent?.phase === 'END_TURN') {
            await delay(1000);
            get().endTurn();
          };
        };

        runAI();
      },
    }),
    {
      client,
      storageMapping: { game: true },
    }
  )
);

