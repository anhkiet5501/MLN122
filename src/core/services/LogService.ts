import { v4 as uuid } from '../utils/uuid';
import type { GameState, LogEntry, CorporationId } from '../domain/types';

export class LogService {
  /**
   * Generates a new log entry and appends it to the game state.
   */
  static addLog(
    state: GameState,
    playerId: string,
    message: string,
    type: LogEntry['type'] = 'ACTION'
  ): GameState {
    const corp = state.corporations.find((p) => p.id === playerId);
    
    const newEntry: LogEntry = {
      id: uuid(),
      turn: state.turn,
      playerId,
      playerName: corp ? corp.corporation.name : 'System',
      corporationId: (corp?.corporation.id ?? 'EVN') as CorporationId,
      message,
      type,
      timestamp: Date.now(),
    };

    return {
      ...state,
      log: [newEntry, ...state.log],
    };
  }
}
