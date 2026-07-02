import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { DiceRoller } from './DiceRoller';
import { ActionPanel } from './ActionPanel';
import { VotingPanel } from './VotingPanel';
import { BalanceMeter } from '../player/BalanceMeter';
import { ScoringEngine } from '../../../core/engines/ScoringEngine';

export const PlayerBoard: React.FC = () => {
  const game = useGameStore((s) => s.game);
  
  // Get player identity from session
  const myCorpId = sessionStorage.getItem('mln122_corp') ?? '';
  const myName = sessionStorage.getItem('mln122_name');

  if (!game) return null;

  if (game.status !== 'PLAYING') return null;

  const myCorpById = game.corporations.find(c => c.corporation.id === myCorpId);
  const myCorpByName = myName
    ? game.corporations.find(c =>
        c.players.some(p => p.name.trim().toLowerCase() === myName.trim().toLowerCase())
      )
    : undefined;
  const myCorp = myCorpById ?? myCorpByName;

  useEffect(() => {
    // Recover from stale/missing session corp id by inferring from joined player name.
    if (myCorp && myCorp.corporation.id !== myCorpId) {
      sessionStorage.setItem('mln122_corp', myCorp.corporation.id);
    }
  }, [myCorp, myCorpId]);

  if (!myCorp) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[calc(100vh-56px)] text-center text-white px-4">
        <p className="text-base font-semibold">Không tìm thấy tập đoàn của bạn trong trận hiện tại.</p>
        <p className="text-sm text-[var(--vn-muted)]">
          Bạn có thể đã chọn tập đoàn khác với cấu hình host khi bắt đầu trận. Hãy vào lại phòng và chọn lại.
        </p>
      </div>
    );
  }

  const activeCorp = game.corporations[game.activeCorporationIndex];
  const isMyTurn = activeCorp.id === myCorp.id;
  const finalScore = ScoringEngine.calculateFinalScore(myCorp);

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] bg-[#0a0f18] p-4 gap-4">
      
      {/* Player Header / Stats */}
      <div className="glass rounded-2xl p-4 border border-[var(--vn-border)] relative overflow-hidden">
        {/* Background glow based on turn */}
        {isMyTurn && (
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--vn-red)]/10 to-transparent pointer-events-none" />
        )}

        <div className="relative z-10 flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2"
            style={{ background: myCorp.color + '33', borderColor: myCorp.color }}
          >
            {myCorp.corporation.icon}
          </div>
          
          <div className="flex-1">
            <h2 className="text-white font-black text-xl mb-1">{myCorp.corporation.name}</h2>
            <div className="flex gap-4 text-xs font-bold">
              <span className="text-[var(--vn-gold)] text-lg">${myCorp.money}</span>
              <div className="flex flex-col text-[10px] text-[var(--vn-muted)]">
                <span>Sứ mệnh: <span className="text-green-400">{myCorp.missionScore}</span></span>
                <span>Hiệu quả: <span className="text-blue-400">{myCorp.efficiencyScore}</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <BalanceMeter corp={myCorp} compact />
        </div>
      </div>

      {/* Main Control Area */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          
          {/* Active Event / Voting */}
          {game.phase === 'RESOLVE_EVENT' && game.activeEvent && isMyTurn && (
            <motion.div
              key="voting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md mx-auto glass rounded-2xl border border-[var(--vn-gold)] p-4 shadow-[0_0_30px_rgba(244,208,63,0.15)]"
            >
              <h3 className="text-center text-white font-bold mb-4 uppercase tracking-wider text-sm">
                Đưa ra quyết định
              </h3>
              {game.activeEvent.votingSession ? (
                <VotingPanel card={game.activeEvent.card} votingSession={game.activeEvent.votingSession} />
              ) : (
                <div className="text-center text-[var(--vn-muted)]">Sự kiện này không yêu cầu biểu quyết.</div>
              )}
            </motion.div>
          )}


          {/* Regular Turn Actions */}
          {game.phase !== 'RESOLVE_EVENT' && (
            <>
              {isMyTurn ? (
                <motion.div
                  key="my-turn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-sm flex flex-col gap-4"
                >
                  <div className="text-center mb-2">
                    <span className="inline-block bg-[var(--vn-red)] text-white text-xs font-black px-3 py-1 rounded-full animate-pulse">
                      LƯỢT CỦA BẠN
                    </span>
                  </div>

                  {game.phase === 'ROLL_DICE' && (
                    <div className="glass rounded-2xl p-6 border border-[var(--vn-border)] flex flex-col items-center">
                      <DiceRoller />
                    </div>
                  )}

                  {game.phase === 'SELECT_ACTION' && (
                    <div className="w-full glass rounded-2xl border border-[var(--vn-border)] shadow-xl overflow-hidden h-[60vh] flex flex-col">
                      <ActionPanel selectedRegion={null} />
                    </div>
                  )}

                  {(game.phase === 'DRAW_EVENT' || game.phase === 'END_TURN' || game.phase === 'RESOLVE_MONOPOLY') && (
                    <div className="w-full glass rounded-2xl border border-[var(--vn-border)] shadow-xl overflow-hidden">
                      <ActionPanel selectedRegion={null} />
                    </div>
                  )}

                  {game.phase === 'MOVE' && (
                    <div className="glass rounded-2xl p-6 border border-[var(--vn-border)] flex flex-col items-center text-center">
                      <div className="w-12 h-12 border-4 border-[var(--vn-gold)] border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-white font-bold">
                        {game.phase === 'MOVE' && 'Đang di chuyển...'}
                      </p>
                    </div>
                  )}

                  {game.phase === 'SELECT_ACTION' && game.diceValue && (
                    <p className="text-center text-xs text-[var(--vn-muted)]">
                      Kết quả xúc xắc: <span className="text-[var(--vn-gold)] font-bold">{game.diceValue}</span>
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <span className="text-2xl opacity-50">⏳</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">Chờ đến lượt</h3>
                  <p className="text-[var(--vn-muted)] text-sm">
                    Đang là lượt của <strong className="text-[var(--vn-gold)]">{activeCorp.corporation.name}</strong>
                  </p>
                </motion.div>
              )}
            </>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};
