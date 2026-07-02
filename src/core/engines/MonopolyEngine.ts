import type { GameState, RegionId, CorporationState, ActiveMonopoly } from '../domain/types';

export class MonopolyEngine {
  private static readonly MONOPOLY_THRESHOLD = 0.4; // 40%

  /**
   * Checks if a player has crossed the monopoly threshold.
   */
  static checkMonopolyRisk(state: GameState, corpId: string): boolean {
    const totalRegions = Object.keys(state.regions).length;
    const corp = state.corporations.find((p) => p.id === corpId);
    if (!corp) return false;
    const ownedCount = corp.ownedRegions.length;
    return ownedCount / totalRegions > this.MONOPOLY_THRESHOLD;
  }

  /**
   * Gets the percentage of regions owned by a player.
   */
  static getOwnershipPercent(state: GameState, corpId: string): number {
    const totalRegions = Object.keys(state.regions).length;
    const corp = state.corporations.find((p) => p.id === corpId);
    if (!corp) return 0;
    return (corp.ownedRegions.length / totalRegions) * 100;
  }

  /**
   * Gets a map of region IDs to their owner's ID.
   */
  static getRegionOwnershipMap(state: GameState): Record<RegionId, string | null> {
    const map: Partial<Record<RegionId, string | null>> = {};
    for (const [id, region] of Object.entries(state.regions)) {
      map[id as RegionId] = region.owner;
    }
    return map as Record<RegionId, string | null>;
  }

  /**
   * Applies the effect of the active monopoly card to the given player.
   * Note: This returns a new Player object, leaving state management to GameEngine/GameService.
   */
  static applyMonopolyEffect(corp: CorporationState, activeMonopoly: ActiveMonopoly | null): CorporationState {
    if (!activeMonopoly) return corp;
    const effect = activeMonopoly.card.effect;

    const newCorp = { ...corp };

    switch (effect.type) {
      case 'MONEY_DELTA':
        newCorp.money = Math.max(0, newCorp.money + effect.value);
        break;
      case 'MONEY_PERCENT':
        newCorp.money = Math.max(0, newCorp.money + Math.floor(newCorp.money * effect.value));
        break;
      case 'MISSION_DELTA':
        newCorp.missionScore = Math.max(0, Math.min(100, newCorp.missionScore + effect.value));
        break;
      case 'EFFICIENCY_DELTA':
        newCorp.efficiencyScore = Math.max(0, Math.min(100, newCorp.efficiencyScore + effect.value));
        break;
      case 'SKIP_TURN':
        newCorp.skipTurns += effect.value;
        break;
      case 'UPGRADE_DELAY':
        newCorp.upgradeDelay += effect.value;
        break;
    }

    return newCorp;
  }
}
