// ============================================================
// NATIONAL BALANCE — Game Type Definitions
// ============================================================

export type CorporationId = 'EVN' | 'PETROVIETNAM' | 'VIETTEL' | 'VINACOMIN';

export type RegionId =
  | 'RED_RIVER_DELTA'
  | 'NORTHERN_MIDLANDS'
  | 'NORTH_CENTRAL'
  | 'SOUTH_CENTRAL'
  | 'CENTRAL_HIGHLANDS'
  | 'SOUTHEAST'
  | 'MEKONG_DELTA';

export type TurnPhase =
  | 'WAITING'
  | 'ROLL_DICE'
  | 'MOVE'
  | 'SELECT_ACTION'
  | 'DRAW_EVENT'
  | 'RESOLVE_EVENT'
  | 'RESOLVE_MONOPOLY'
  | 'END_TURN'
  | 'GAME_OVER';

export type ActionType =
  | 'UPGRADE_REGION'
  | 'BUILD_INFRASTRUCTURE'
  | 'SUPPORT_REMOTE_AREA'
  | 'OPTIMIZE_OPERATIONS'
  | 'ACQUIRE_RESOURCE';

export type GameMode = 'HOTSEAT' | 'VS_AI';
export type AIDifficulty = 'EASY' | 'HARD';
export type GameStatus = 'LOBBY' | 'PLAYING' | 'ENDED';

// ─── Corporation ────────────────────────────────────────────
export interface Corporation {
  id: CorporationId;
  name: string;
  fullName: string;
  description: string;
  strategyFocus: string;
  actionPriorities: ActionType[];
  ability: string;
  abilityDescription: string;
  color: string;
  bgGradient: string;
  icon: string;
}

// ─── Region ─────────────────────────────────────────────────
export interface Region {
  id: RegionId;
  name: string;
  revenueValue: number;
  missionValue: number;
  developmentLevel: number; // 0–3
  owner: string | null; // player id or null
  svgPath: string;
  svgCenter: { x: number; y: number };
  type: 'URBAN' | 'RURAL' | 'COASTAL' | 'HIGHLAND' | 'ISLAND';
  description: string;
}

// ─── Event Card ──────────────────────────────────────────────
export interface CardChoice {
  label: string;
  description: string;
  moneyDelta: number;
  missionDelta: number;
  efficiencyDelta: number;
}

export interface EventCard {
  id: string;
  title: string;
  description: string;
  category: 'ECONOMIC' | 'SOCIAL' | 'NATURAL' | 'POLITICAL' | 'TECHNOLOGY';
  icon: string;
  choices: [CardChoice, CardChoice];
}

// ─── Monopoly Risk Card ──────────────────────────────────────
export type MonopolyEffect =
  | { type: 'MONEY_DELTA'; value: number }
  | { type: 'MONEY_PERCENT'; value: number }
  | { type: 'MISSION_DELTA'; value: number }
  | { type: 'EFFICIENCY_DELTA'; value: number }
  | { type: 'SKIP_TURN'; value: number }
  | { type: 'UPGRADE_DELAY'; value: number };

export interface MonopolyCard {
  id: string;
  title: string;
  description: string;
  effect: MonopolyEffect;
  icon: string;
}

// ─── Team Roles & KPIs ───────────────────────────────────────
export type TeamRole = 'CEO' | 'CFO' | 'COO' | 'CSR Director' | 'Strategy Director';

export interface Player {
  id: string;
  name: string;
  role: TeamRole;
  corporationId: CorporationId;
  hiddenKpi: string;
}

// ─── Corporation State (Formerly Player) ─────────────────────
export interface CorporationState {
  id: string;
  corporation: Corporation;
  money: number;
  missionScore: number;
  efficiencyScore: number;
  ownedRegions: RegionId[];
  position: number; // board position 0–7
  isAI: boolean;
  skipTurns: number;
  upgradeDelay: number;
  scoreHistory: Array<{
    turn: number;
    money: number;
    missionScore: number;
    efficiencyScore: number;
    finalScore: number;
  }>;
  achievements: string[];
  color: string;
  players: Player[];
}

// ─── Game Actions ────────────────────────────────────────────
export interface GameAction {
  type: ActionType;
  label: string;
  description: string;
  icon: string;
  moneyCost: number;
  missionDelta: number;
  efficiencyDelta: number;
  requiresRegion?: boolean;
}

// ─── Event Log Entry ─────────────────────────────────────────
export interface LogEntry {
  id: string;
  turn: number;
  playerId: string;
  playerName: string;
  corporationId: CorporationId;
  message: string;
  type: 'ACTION' | 'EVENT' | 'MONOPOLY' | 'SYSTEM' | 'ACHIEVEMENT';
  timestamp: number;
}

// ─── Achievement ─────────────────────────────────────────────
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (corp: CorporationState, gameState: GameState) => boolean;
}

// ─── Government Policy ───────────────────────────────────────
export type PolicyEffectType = 'COST_MODIFIER' | 'SCORE_MULTIPLIER' | 'FIXED_BONUS';

export interface GovernmentPolicy {
  id: string;
  title: string;
  description: string;
  icon: string;
  activeForTurns: number;
  effects: {
    type: PolicyEffectType;
    target: 'MISSION' | 'EFFICIENCY' | 'MONEY' | 'BUILD_COST';
    value: number;
  }[];
}

// ─── Active Event Modal & Voting ─────────────────────────────
export interface VotingSession {
  expiresAt: number;
  votes: Record<string, number>; // playerId -> choiceIndex (0 or 1)
  resolved: boolean;
}

export interface ActiveEvent {
  card: EventCard;
  resolved: boolean;
  chosenOption?: 0 | 1;
  votingSession?: VotingSession;
}

export interface ActiveMonopoly {
  card: MonopolyCard;
  resolved: boolean;
}

// ─── Game State ──────────────────────────────────────────────
export interface GameState {
  id: string;
  status: GameStatus;
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  corporations: CorporationState[];
  activeCorporationIndex: number;
  turn: number;
  maxTurns: number;
  phase: TurnPhase;
  regions: Record<RegionId, Region>;
  eventDeck: EventCard[];
  monopolyDeck: MonopolyCard[];
  discardedEvents: EventCard[];
  discardedMonopoly: MonopolyCard[];
  activeEvent: ActiveEvent | null;
  activeMonopoly: ActiveMonopoly | null;
  activePolicies: GovernmentPolicy[];
  activeIncomeSummary: IncomeSummary[] | null;
  diceValue: number | null;
  log: LogEntry[];
  winner: CorporationState | null;
  finalScores: Array<{ corporationId: string; score: number }>;
  createdAt: number;
  lastSavedAt: number;
  discussionTimer: number;
}

// ─── Leaderboard ─────────────────────────────────────────────
export interface LeaderboardEntry {
  id: string;
  gameId: string;
  playerName: string;
  corporationId: CorporationId;
  corporationName: string;
  finalScore: number;
  money: number;
  missionScore: number;
  efficiencyScore: number;
  turnsPlayed: number;
  date: number;
  won: boolean;
}

// ─── Income Summary ──────────────────────────────────────────
export interface RegionIncomeLine {
  regionId: string;
  regionName: string;
  baseRevenue: number;
  developmentLevel: number;
  grossIncome: number;
  maintenance: number;
  netIncome: number;
  missionGain: number;
  efficiencyGain: number;
}

export interface IncomeSummary {
  corporationId: string;
  corporationName: string;
  lines: RegionIncomeLine[];
  totalNet: number;
  totalMissionGain: number;
  totalEfficiencyGain: number;
}

// ─── Create Game Config ──────────────────────────────────────
export interface CreateGameConfig {
  corporations: Array<{
    corporationId: CorporationId;
    isAI: boolean;
    players: Array<{
      name: string;
      role: TeamRole;
    }>;
  }>;
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  maxTurns: number;
  discussionTimer: number; // 30, 60, 90, 120
}
