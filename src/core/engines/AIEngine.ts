import type { CorporationState, GameState, ActionType } from '../domain/types';
import { ScoringEngine } from './ScoringEngine';
import { GAME_ACTIONS } from '../data/actions';

export class AIEngine {
  static decideAction(corp: CorporationState, state: GameState, difficulty: 'EASY' | 'HARD'): ActionType {
    if (difficulty === 'EASY') return this.easyAIAction(corp);
    return this.hardAIAction(corp);
  }

  static chooseCardOption(corp: CorporationState, state: GameState, difficulty: 'EASY' | 'HARD'): 0 | 1 {
    if (difficulty === 'EASY') {
      return Math.random() > 0.5 ? 0 : 1;
    }
    
    if (!state.activeEvent) return 0;
    const card = state.activeEvent.card;
    
    let bestChoice: 0 | 1 = 0;
    let bestScore = -Infinity;

    for (const choiceIdx of [0, 1] as const) {
      const choice = card.choices[choiceIdx];
      let moneyDelta = choice.moneyDelta;
      
      if (corp.corporation.id === 'PETROVIETNAM' && card.category === 'ECONOMIC') {
        moneyDelta += 20;
      }

      const clampScore = (v: number) => Math.max(0, Math.min(100, v));
      const clampMoney = (v: number) => Math.max(0, v);

      const simulatedCorp: CorporationState = {
        ...corp,
        money: clampMoney(corp.money + moneyDelta),
        missionScore: clampScore(corp.missionScore + choice.missionDelta),
        efficiencyScore: clampScore(corp.efficiencyScore + choice.efficiencyDelta),
      };

      const score = ScoringEngine.calculateFinalScore(simulatedCorp);
      if (score > bestScore) {
        bestScore = score;
        bestChoice = choiceIdx;
      }
    }
    return bestChoice;
  }

  private static getActionCost(corp: CorporationState, actionType: ActionType): number {
    const action = GAME_ACTIONS.find((a) => a.type === actionType);
    if (!action) return Infinity;

    let cost = action.moneyCost;
    if (corp.corporation.id === 'EVN' && actionType === 'BUILD_INFRASTRUCTURE') {
      cost = Math.floor(cost * 0.8);
    }
    return cost;
  }

  private static simulateAction(corp: CorporationState, actionType: ActionType): number {
    const action = GAME_ACTIONS.find((a) => a.type === actionType);
    if (!action) return -Infinity;

    const cost = this.getActionCost(corp, actionType);
    if (corp.money < cost) return -Infinity;

    let efficiencyDelta = action.efficiencyDelta;
    if (corp.corporation.id === 'VIETTEL' &&
        (actionType === 'OPTIMIZE_OPERATIONS' || actionType === 'BUILD_INFRASTRUCTURE')) {
      efficiencyDelta += 10;
    }

    const clampScore = (v: number) => Math.max(0, Math.min(100, v));
    const clampMoney = (v: number) => Math.max(0, v);

    const simulatedCorp: CorporationState = {
      ...corp,
      money: clampMoney(corp.money - cost),
      missionScore: clampScore(corp.missionScore + action.missionDelta),
      efficiencyScore: clampScore(corp.efficiencyScore + efficiencyDelta),
    };

    return ScoringEngine.calculateFinalScore(simulatedCorp);
  }

  private static getPriorityIndex(corp: CorporationState, actionType: ActionType): number {
    const idx = corp.corporation.actionPriorities.indexOf(actionType);
    return idx === -1 ? corp.corporation.actionPriorities.length : idx;
  }

  private static easyAIAction(corp: CorporationState): ActionType {
    const priorities = corp.corporation.actionPriorities;
    const weights = priorities.map((actionType, i) => {
      const cost = this.getActionCost(corp, actionType);
      if (corp.money < cost) return 0;
      return priorities.length - i;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    if (totalWeight === 0) return priorities[priorities.length - 1];

    let rand = Math.random() * totalWeight;
    for (let i = 0; i < priorities.length; i++) {
      rand -= weights[i];
      if (rand <= 0) return priorities[i];
    }
    return priorities[0];
  }

  private static hardAIAction(corp: CorporationState): ActionType {
    const priorities = corp.corporation.actionPriorities;
    let bestAction: ActionType = priorities[0];
    let bestScore = -Infinity;

    for (const actionType of priorities) {
      const score = this.simulateAction(corp, actionType);
      const priorityIndex = this.getPriorityIndex(corp, actionType);

      if (score > bestScore) {
        bestScore = score;
        bestAction = actionType;
      } else if (score !== -Infinity && score >= bestScore * 0.98) {
        if (priorityIndex < this.getPriorityIndex(corp, bestAction)) {
          bestAction = actionType;
        }
      }
    }

    return bestAction;
  }
}
