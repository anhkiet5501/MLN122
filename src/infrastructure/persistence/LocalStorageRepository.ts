import type { GameState, LeaderboardEntry } from '../../core/domain/types';

const GAME_SAVE_KEY = 'national_balance_save';
const LEADERBOARD_KEY = 'national_balance_leaderboard';

export const saveGame = (state: GameState): void => {
  try {
    const serialized = JSON.stringify({ ...state, lastSavedAt: Date.now() });
    localStorage.setItem(GAME_SAVE_KEY, serialized);
  } catch (e) {
    console.error('Failed to save game:', e);
  }
};

export const loadGame = (): GameState | null => {
  try {
    const raw = localStorage.getItem(GAME_SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch (e) {
    console.error('Failed to load game:', e);
    return null;
  }
};

export const clearSavedGame = (): void => {
  localStorage.removeItem(GAME_SAVE_KEY);
};

export const hasSavedGame = (): boolean => {
  return localStorage.getItem(GAME_SAVE_KEY) !== null;
};

export const saveLeaderboardEntry = (entry: LeaderboardEntry): void => {
  try {
    const existing = getLeaderboard();
    const updated = [entry, ...existing].slice(0, 50); // keep top 50
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save leaderboard:', e);
  }
};

export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
};

export const clearLeaderboard = (): void => {
  localStorage.removeItem(LEADERBOARD_KEY);
};
