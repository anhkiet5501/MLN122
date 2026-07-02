import type { CorporationState, GameState } from '../domain/types';

export class ScoringEngine {
  /**
   * Calculates the final definitive score for a player based on the balancing formula.
   */
  static calculateFinalScore(corp: CorporationState): number {
    const { money, missionScore, efficiencyScore } = corp;
    const base = (money / 10) * missionScore * efficiencyScore;
    const penalty = Math.abs(missionScore - efficiencyScore);
    return Math.max(0, base - penalty * 100);
  }

  /**
   * Calculates a simplified display score useful for mid-game approximations.
   */
  static calculateDisplayScore(corp: CorporationState): number {
    const { money, missionScore, efficiencyScore } = corp;
    const balance = 100 - Math.abs(missionScore - efficiencyScore);
    return Math.round((money / 10) + missionScore * 0.5 + efficiencyScore * 0.5 + balance * 0.3);
  }

  /**
   * Returns the current balance status based on the discrepancy.
   */
  static getBalanceStatus(
    missionScore: number,
    efficiencyScore: number
  ): 'BALANCED' | 'MISSION_HEAVY' | 'EFFICIENCY_HEAVY' {
    const diff = missionScore - efficiencyScore;
    if (Math.abs(diff) <= 15) return 'BALANCED';
    if (diff > 0) return 'MISSION_HEAVY';
    return 'EFFICIENCY_HEAVY';
  }

  /**
   * Returns a value between -100 (full efficiency lean) and +100 (full mission lean).
   */
  static getBalancePercent(missionScore: number, efficiencyScore: number): number {
    return Math.max(-100, Math.min(100, missionScore - efficiencyScore));
  }

  /**
   * Sorts players by final score in descending order.
   */
  static rankPlayers(corps: CorporationState[]): CorporationState[] {
    return [...corps].sort((a, b) => this.calculateFinalScore(b) - this.calculateFinalScore(a));
  }

  /**
   * Determines the winner of the game.
   */
  static getWinner(gameState: GameState): CorporationState | null {
    if (gameState.corporations.length === 0) return null;
    const ranked = this.rankPlayers(gameState.corporations);
    return ranked[0];
  }
}
