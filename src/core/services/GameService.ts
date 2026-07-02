import type { GameState, ActionType, RegionId, TurnPhase, IncomeSummary, RegionIncomeLine } from '../domain/types';
import { GameEngine } from '../engines/GameEngine';
import { EventEngine } from '../engines/EventEngine';
import { MonopolyEngine } from '../engines/MonopolyEngine';
import { ScoringEngine } from '../engines/ScoringEngine';
import { LogService } from './LogService';
import { shuffleCards } from '../data/eventCards';
import { GOVERNMENT_POLICIES, shufflePolicies } from '../data/policies';

export class GameService {
  private static isPlayable(state: GameState): boolean {
    return state.status === 'PLAYING' && state.turn <= state.maxTurns;
  }

  static checkGameOver(state: GameState): GameState {
    if (state.status !== 'PLAYING') return state;
    if (state.turn > state.maxTurns) {
      return this.handleGameOver(state);
    }
    return state;
  }

  /**
   * Delegates to GameEngine to process a dice roll.
   */
  static rollDice(state: GameState): GameState {
    if (!this.isPlayable(state)) return this.checkGameOver(state);
    const diceValue = Math.floor(Math.random() * 6) + 1;
    return this.checkGameOver(GameEngine.processDiceRoll(state, diceValue));
  }

  /**
   * Delegates to GameEngine to process an action.
   */
  static selectAction(state: GameState, actionType: ActionType, regionId?: RegionId, targetId?: string): GameState {
    if (!this.isPlayable(state)) return this.checkGameOver(state);
    return this.checkGameOver(GameEngine.processAction(state, actionType, regionId, targetId));
  }

  /**
   * Delegates to EventEngine to draw a card.
   */
  static drawEventCard(state: GameState): GameState {
    if (!this.isPlayable(state)) return this.checkGameOver(state);
    return this.checkGameOver(EventEngine.drawEventCard(state));
  }

  /**
   * Delegates to EventEngine to resolve a card, then checks MonopolyEngine.
   */
  static resolveEventCard(state: GameState, choiceIndex: 0 | 1): GameState {
    if (!this.isPlayable(state)) return this.checkGameOver(state);
    const activeCorpId = state.corporations[state.activeCorporationIndex].id;
    const nextState = EventEngine.resolveEventChoice(state, choiceIndex);

    return this.postResolveEvent(nextState, activeCorpId);
  }

  static castVote(state: GameState, playerId: string, choiceIndex: 0 | 1): GameState {
    if (!this.isPlayable(state)) return this.checkGameOver(state);
    return EventEngine.castVote(state, playerId, choiceIndex);
  }

  static resolveVoting(state: GameState): GameState {
    if (!this.isPlayable(state)) return this.checkGameOver(state);
    const activeCorpId = state.corporations[state.activeCorporationIndex].id;
    const nextState = EventEngine.resolveVoting(state);

    return this.postResolveEvent(nextState, activeCorpId);
  }

  private static postResolveEvent(nextState: GameState, activeCorpId: string): GameState {

    // Check monopoly risk
    const hasMonopoly = MonopolyEngine.checkMonopolyRisk(nextState, activeCorpId);

    if (hasMonopoly) {
      let deck = [...nextState.monopolyDeck];
      let discard = [...nextState.discardedMonopoly];
      if (deck.length === 0) {
        deck = shuffleCards([...discard]);
        discard = [];
      }
      const [mCard, ...mRemaining] = deck;
      const activeCorp = nextState.corporations[nextState.activeCorporationIndex];

      nextState = LogService.addLog(
        nextState,
        activeCorpId,
        `⚠️ NGUY CƠ ĐỘC QUYỀN! ${activeCorp.corporation.name} sở hữu ${Math.round((activeCorp.ownedRegions.length / 8) * 100)}% khu vực!`,
        'MONOPOLY'
      );

      return {
        ...nextState,
        activeMonopoly: { card: mCard, resolved: false },
        monopolyDeck: mRemaining,
        discardedMonopoly: discard,
        phase: 'RESOLVE_MONOPOLY',
      };
    }

    return {
      ...nextState,
      phase: 'END_TURN',
    };
  }

  /**
   * Resolves an active monopoly card.
   */
  static resolveMonopolyCard(state: GameState): GameState {
    if (!this.isPlayable(state)) return this.checkGameOver(state);
    if (!state.activeMonopoly) return state;

    const activeCorpIndex = state.activeCorporationIndex;
    const activeCorp = state.corporations[activeCorpIndex];
    
    const updatedCorp = MonopolyEngine.applyMonopolyEffect(activeCorp, state.activeMonopoly);

    const updatedCorps = state.corporations.map((p, i) => 
      i === activeCorpIndex ? updatedCorp : p
    );

    const newState = LogService.addLog(
      { ...state, corporations: updatedCorps },
      activeCorp.id,
      `Nguy Cơ Độc Quyền: "${state.activeMonopoly.card.title}" — ${state.activeMonopoly.card.description}`,
      'MONOPOLY'
    );

    return {
      ...newState,
      activeMonopoly: { ...state.activeMonopoly, resolved: true },
      phase: 'END_TURN',
    };
  }

  /**
   * Ends the turn, checks for game over, applies skip turns, and advances player index.
   */
  static endTurn(state: GameState): GameState {
    if (state.status !== 'PLAYING') return state;

    const currentCorp = state.corporations[state.activeCorporationIndex];

    const updatedCorps = state.corporations.map((p, i) => {
      if (i !== state.activeCorporationIndex) return p;
      const finalScore = ScoringEngine.calculateFinalScore(p);
      return {
        ...p,
        scoreHistory: [
          ...p.scoreHistory,
          {
            turn: state.turn,
            money: p.money,
            missionScore: p.missionScore,
            efficiencyScore: p.efficiencyScore,
            finalScore,
          },
        ],
      };
    });

    let nextCorpIndex = (state.activeCorporationIndex + 1) % state.corporations.length;
    let nextTurn = state.turn;
    let nextPolicies = [...state.activePolicies];
    let finalCorps = [...updatedCorps];
    let incomeSummaries: import('../domain/types').IncomeSummary[] = [];

    if (nextCorpIndex === 0) {
      nextTurn = state.turn + 1;

      // ─── Collect recurring income for all corporations ────────
      const incomeResult = this.collectTurnIncome({ ...state, corporations: finalCorps });
      finalCorps = incomeResult.corporations;
      incomeSummaries = incomeResult.summaries;
      // ────────────────────────────────────────────────────────

      // Apply fixed bonuses from active policies
      nextPolicies.forEach(policy => {
        policy.effects.forEach(effect => {
          if (effect.type === 'FIXED_BONUS') {
            finalCorps = finalCorps.map(c => {
              if (effect.target === 'MONEY') return { ...c, money: Math.max(0, c.money + effect.value) };
              if (effect.target === 'MISSION') return { ...c, missionScore: Math.max(0, Math.min(100, c.missionScore + effect.value)) };
              if (effect.target === 'EFFICIENCY') return { ...c, efficiencyScore: Math.max(0, Math.min(100, c.efficiencyScore + effect.value)) };
              return c;
            });
          }
        });
      });

      // Decrement active policy timers
      nextPolicies = nextPolicies
        .map(p => ({ ...p, activeForTurns: p.activeForTurns - 1 }))
        .filter(p => p.activeForTurns > 0);

      // Generate new policy every 3 rounds
      if (nextTurn > 1 && nextTurn % 3 === 0) {
        const availablePolicies = GOVERNMENT_POLICIES.filter(gp => !nextPolicies.some(p => p.id === gp.id));
        if (availablePolicies.length > 0) {
          const newPolicy = { ...shufflePolicies(availablePolicies)[0] };
          nextPolicies.push(newPolicy);
          
          LogService.addLog(
            state,
            currentCorp.id,
            `🏛️ Chính Sách Mới Của Chính Phủ: ${newPolicy.title}`,
            'SYSTEM'
          );
        }
      }
    }

    const nextCorp = finalCorps[nextCorpIndex];
    if (nextCorp.skipTurns > 0) {
      const skippedCorps = finalCorps.map((p, i) =>
        i === nextCorpIndex ? { ...p, skipTurns: Math.max(0, p.skipTurns - 1) } : p
      );

      const skippedState = LogService.addLog(
        { ...state, corporations: skippedCorps },
        nextCorp.id,
        `${nextCorp.corporation.name} mất lượt này (Điều Tra Tham Nhũng).`,
        'SYSTEM'
      );

      nextCorpIndex = (nextCorpIndex + 1) % state.corporations.length;
      if (nextCorpIndex <= state.activeCorporationIndex) nextTurn++;

      const updatedGame: GameState = {
        ...skippedState,
        activeCorporationIndex: nextCorpIndex,
        turn: nextTurn,
        phase: 'ROLL_DICE',
        diceValue: null,
        activeEvent: null,
        activeMonopoly: null,
        activePolicies: nextPolicies,
      };

      if (nextTurn > state.maxTurns) {
        return this.handleGameOver(updatedGame);
      }
      return updatedGame;
    }

    const newState = LogService.addLog(
      { ...state, corporations: finalCorps },
      currentCorp.id,
      `${currentCorp.corporation.name} kết thúc lượt. Lượt ${nextTurn} bắt đầu.`,
      'SYSTEM'
    );

    // Only show income modal when a full round is complete
    const activeIncomeSummary = (nextCorpIndex === 0 && incomeSummaries.length > 0)
      ? incomeSummaries
      : null;

    const updatedGame: GameState = {
      ...newState,
      activeCorporationIndex: nextCorpIndex,
      turn: nextTurn,
      phase: 'ROLL_DICE',
      diceValue: null,
      activeEvent: null,
      activeMonopoly: null,
      activePolicies: nextPolicies,
      activeIncomeSummary,
    };

    if (nextTurn > state.maxTurns) {
      return this.handleGameOver(updatedGame);
    }
    return updatedGame;
  }

  private static handleGameOver(state: GameState): GameState {
    const winner = ScoringEngine.getWinner(state);
    const finalScores = state.corporations.map((p) => ({
      corporationId: p.id,
      score: ScoringEngine.calculateFinalScore(p),
    }));
    return {
      ...state,
      turn: Math.min(state.turn, state.maxTurns),
      status: 'ENDED',
      phase: 'GAME_OVER',
      winner,
      finalScores,
      activeIncomeSummary: null,
    };
  }

  /**
   * Computes end-of-round income for all corporations that own regions.
   * Formula:
   *   Multiplier: L1=1.0, L2=1.25, L3=1.5
   *   Gross = baseRevenue * multiplier
   *   Maintenance: L1=10, L2=15, L3=20
   *   Net = Gross - Maintenance
   *   Mission gain per region = missionValue * 0.1
   *   Efficiency gain per region = baseRevenue * 0.05
   */
  static collectTurnIncome(state: GameState): {
    corporations: typeof state.corporations;
    summaries: IncomeSummary[];
  } {
    const MULTIPLIERS = [0, 1.0, 1.25, 1.5] as const;
    const MAINTENANCE = [0, 10, 15, 20] as const;

    const summaries: IncomeSummary[] = [];
    const updatedCorps = state.corporations.map((corp) => {
      if (corp.ownedRegions.length === 0) return corp;

      const lines: RegionIncomeLine[] = [];
      let totalNet = 0;
      let totalMission = 0;
      let totalEfficiency = 0;

      for (const regionId of corp.ownedRegions) {
        const region = state.regions[regionId];
        if (!region) continue;

        const level = Math.max(1, Math.min(3, region.developmentLevel || 1)) as 1 | 2 | 3;
        const multiplier = MULTIPLIERS[level];
        const maintenance = MAINTENANCE[level];
        const gross = Math.floor(region.revenueValue * multiplier);
        const net = gross - maintenance;
        const missionGain = parseFloat((region.missionValue * 0.1).toFixed(2));
        const efficiencyGain = parseFloat((region.revenueValue * 0.05).toFixed(2));

        lines.push({
          regionId,
          regionName: region.name,
          baseRevenue: region.revenueValue,
          developmentLevel: level,
          grossIncome: gross,
          maintenance,
          netIncome: net,
          missionGain,
          efficiencyGain,
        });

        totalNet += net;
        totalMission += missionGain;
        totalEfficiency += efficiencyGain;
      }

      summaries.push({
        corporationId: corp.id,
        corporationName: corp.corporation.name,
        lines,
        totalNet,
        totalMissionGain: parseFloat(totalMission.toFixed(2)),
        totalEfficiencyGain: parseFloat(totalEfficiency.toFixed(2)),
      });

      return {
        ...corp,
        money: Math.max(0, corp.money + totalNet),
        missionScore: Math.min(100, corp.missionScore + totalMission),
        efficiencyScore: Math.min(100, corp.efficiencyScore + totalEfficiency),
      };
    });

    return { corporations: updatedCorps, summaries };
  }

  /**
   * Helper to skip to next phase safely.
   */
  static skipToNextPhase(state: GameState): GameState {
    if (!this.isPlayable(state)) return this.checkGameOver(state);
    const phase = state.phase;
    let nextPhase: TurnPhase = 'END_TURN';
    if (phase === 'SELECT_ACTION') nextPhase = 'DRAW_EVENT';
    else if (phase === 'DRAW_EVENT') nextPhase = 'END_TURN';
    return { ...state, phase: nextPhase };
  }
}
