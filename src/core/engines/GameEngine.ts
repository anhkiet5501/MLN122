import type { GameState, ActionType, RegionId } from '../domain/types';
import { GAME_ACTIONS } from '../data/actions';
import { getRegionByIndex, REGION_ORDER } from '../data/regions';
import { LogService } from '../services/LogService';
import { v4 as uuid } from '../utils/uuid';

export class GameEngine {
  /**
   * Processes dice roll and updates player position.
   */
  static processDiceRoll(state: GameState, diceValue: number): GameState {
    if (state.phase !== 'ROLL_DICE') return state;

    const activeCorpIndex = state.activeCorporationIndex;
    const activeCorp = state.corporations[activeCorpIndex];
    const newPos = (activeCorp.position + diceValue) % REGION_ORDER.length;
    
    const updatedCorps = state.corporations.map((p, i) =>
      i === activeCorpIndex ? { ...p, position: newPos } : p
    );

    const movedTo = getRegionByIndex(newPos);
    
    const newState = LogService.addLog(
      { ...state, corporations: updatedCorps },
      activeCorp.id,
      `${activeCorp.corporation.name} đã đổ xúc xắc được ${diceValue} và di chuyển đến ${state.regions[movedTo].name}.`,
      'ACTION'
    );

    return {
      ...newState,
      diceValue,
      phase: 'SELECT_ACTION',
      actionDeadline: Date.now() + (state.discussionTimer || 30) * 1000,
    };
  }

  /**
   * Processes the selected action and applies costs/benefits.
   */
  static processAction(state: GameState, actionType: ActionType, regionId?: RegionId, targetId?: string): GameState {
    if (state.phase !== 'SELECT_ACTION') return state;

    const activeCorp = state.corporations[state.activeCorporationIndex];
    const action = GAME_ACTIONS.find((a) => a.type === actionType);
    if (!action) return state;

    let cost = action.moneyCost;
    if (activeCorp.corporation.id === 'EVN' && actionType === 'BUILD_INFRASTRUCTURE') {
      cost = Math.floor(cost * 0.8);
    }

    if (activeCorp.money < cost) return state;

    const missionDelta = action.missionDelta;
    let efficiencyDelta = action.efficiencyDelta;

    if (activeCorp.corporation.id === 'VIETTEL' && 
        (actionType === 'OPTIMIZE_OPERATIONS' || actionType === 'BUILD_INFRASTRUCTURE')) {
      efficiencyDelta += 10;
    }

    const targetRegionId = regionId ?? getRegionByIndex(activeCorp.position);
    
    const updatedRegions = { ...state.regions };
    const newOwnedRegions = [...activeCorp.ownedRegions];
    let moneyGain = 0;

    if (action.requiresRegion) {
      const region = updatedRegions[targetRegionId];

      if (activeCorp.corporation.id === 'VINACOMIN' && 
          (region.type === 'HIGHLAND' || region.type === 'RURAL')) {
        moneyGain = Math.floor(region.revenueValue * 0.3);
      }

      if (actionType === 'ACQUIRE_RESOURCE' || actionType === 'BUILD_INFRASTRUCTURE') {
        updatedRegions[targetRegionId] = { ...region, owner: activeCorp.id };
        if (!newOwnedRegions.includes(targetRegionId)) {
          newOwnedRegions.push(targetRegionId);
        }
      } else if (actionType === 'UPGRADE_REGION' && region.owner === activeCorp.id) {
        const delay = activeCorp.upgradeDelay > 0 ? activeCorp.upgradeDelay : 0;
        if (delay === 0) {
          updatedRegions[targetRegionId] = {
            ...region,
            developmentLevel: Math.min(3, region.developmentLevel + 1),
          };
        }
      }
    }
    

    const clampScore = (v: number) => Math.max(0, Math.min(100, v));
    const clampMoney = (v: number) => Math.max(0, v);

    const updatedCorps = state.corporations.map((p, i) => {
      if (i !== state.activeCorporationIndex) return p;
      return {
        ...p,
        money: clampMoney(p.money - cost + moneyGain),
        missionScore: clampScore(p.missionScore + missionDelta),
        efficiencyScore: clampScore(p.efficiencyScore + efficiencyDelta),
        ownedRegions: newOwnedRegions,
        upgradeDelay: Math.max(0, p.upgradeDelay - 1),
      };
    });

    let actionLabel = action.label;

    const newState = LogService.addLog(
      { ...state, corporations: updatedCorps, regions: updatedRegions },
      `${activeCorp.corporation.name} đã thực hiện "${actionLabel}"${moneyGain > 0 ? ` (+${moneyGain}$ thưởng)` : ''}.`,
      'ACTION'
    );

    return {
      ...newState,
      phase: 'DRAW_EVENT',
    };
  }
}
