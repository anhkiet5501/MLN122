import type { GameState } from '../domain/types';
import { shuffleCards } from '../data/eventCards';
import { LogService } from '../services/LogService';

export class EventEngine {
  /**
   * Draws an event card from the deck. Reshuffles if empty.
   */
  static drawEventCard(state: GameState): GameState {
    if (state.phase !== 'DRAW_EVENT') return state;

    let deck = [...state.eventDeck];
    let discarded = [...state.discardedEvents];

    if (deck.length === 0) {
      deck = shuffleCards([...discarded]);
      discarded = [];
    }

    const [card, ...remaining] = deck;
    
    const newState = LogService.addLog(
      state,
      state.corporations[state.activeCorporationIndex].id,
      `Đã rút thẻ sự kiện: "${card.title}"`,
      'EVENT'
    );


    // Determine timer. Default to 60s if not set.
    const timerSeconds = state.discussionTimer ?? 60;
    
    return {
      ...newState,
      eventDeck: remaining,
      discardedEvents: discarded,
      activeEvent: { 
        card, 
        resolved: false,
        votingSession: {
          expiresAt: Date.now() + timerSeconds * 1000,
          votes: {},
          resolved: false
        }
      },
      phase: 'RESOLVE_EVENT',
      actionDeadline: Date.now() + timerSeconds * 1000,
    };
  }

  /**
   * Casts a vote in the active voting session.
   */
  static castVote(state: GameState, playerId: string, choiceIndex: 0 | 1): GameState {
    if (state.phase !== 'RESOLVE_EVENT' || !state.activeEvent || !state.activeEvent.votingSession || state.activeEvent.votingSession.resolved) {
      return state;
    }

    const newVotes = { ...state.activeEvent.votingSession.votes, [playerId]: choiceIndex };
    
    return {
      ...state,
      activeEvent: {
        ...state.activeEvent,
        votingSession: {
          ...state.activeEvent.votingSession,
          votes: newVotes
        }
      }
    };
  }

  /**
   * Resolves the voting session using majority vote.
   * - Count votes per choice (0=A, 1=B)
   * - Whichever has more votes wins
   * - Tie → CEO/Leader vote wins
   * - No votes at all → random
   */
  static resolveVoting(state: GameState): GameState {
    if (state.phase !== 'RESOLVE_EVENT' || !state.activeEvent || !state.activeEvent.votingSession || state.activeEvent.votingSession.resolved) {
      return state;
    }

    const votes = state.activeEvent.votingSession.votes;
    const activeCorp = state.corporations[state.activeCorporationIndex];

    // Count votes by choice
    const voteValues = Object.values(votes);
    const countA = voteValues.filter(v => v === 0).length;
    const countB = voteValues.filter(v => v === 1).length;

    let finalChoice: 0 | 1;

    if (countA > countB) {
      // Majority chose A
      finalChoice = 0;
    } else if (countB > countA) {
      // Majority chose B
      finalChoice = 1;
    } else {
      // Tie or no votes: CEO/Leader breaks the tie
      const ceo = activeCorp.players.find(p => p.role === 'CEO');
      if (ceo && votes[ceo.id] !== undefined) {
        finalChoice = votes[ceo.id] as 0 | 1;
      } else {
        // No CEO vote either → random
        finalChoice = Math.random() > 0.5 ? 0 : 1;
      }
    }

    const stateWithResolvedVote = {
      ...state,
      activeEvent: {
        ...state.activeEvent,
        votingSession: {
          ...state.activeEvent.votingSession,
          resolved: true,
        }
      }
    };

    return this.resolveEventChoice(stateWithResolvedVote, finalChoice);
  }

  /**
   * Resolves the selected choice for an event card.
   * Returns a tuple of [updatedPlayer, isMonopolyCheckedLater] or handles the effect.
   * To keep it purely state-based:
   */
  static resolveEventChoice(state: GameState, choiceIndex: 0 | 1): GameState {
    if (!state.activeEvent) return state;

    const activeCorpIndex = state.activeCorporationIndex;
    const activeCorp = state.corporations[activeCorpIndex];
    const { card } = state.activeEvent;
    const choice = card.choices[choiceIndex];

    let moneyDelta = choice.moneyDelta;
    const missionDelta = choice.missionDelta;
    const efficiencyDelta = choice.efficiencyDelta;

    // Petrovietnam energy bonus
    if (activeCorp.corporation.id === 'PETROVIETNAM' && card.category === 'ECONOMIC') {
      moneyDelta += 20;
    }

    const clampScore = (v: number) => Math.max(0, Math.min(100, v));
    const clampMoney = (v: number) => Math.max(0, v);

    const updatedCorps = state.corporations.map((p, i) => {
      if (i !== activeCorpIndex) return p;
      return {
        ...p,
        money: clampMoney(p.money + moneyDelta),
        missionScore: clampScore(p.missionScore + missionDelta),
        efficiencyScore: clampScore(p.efficiencyScore + efficiencyDelta),
      };
    });

    const newState = LogService.addLog(
      { ...state, corporations: updatedCorps },
      activeCorp.id,
      `${activeCorp.corporation.name} đã chọn "${choice.label}" cho sự kiện "${card.title}".`,
      'EVENT'
    );

    return {
      ...newState,
      activeEvent: { ...state.activeEvent, resolved: true, chosenOption: choiceIndex },
    };
  }
}
