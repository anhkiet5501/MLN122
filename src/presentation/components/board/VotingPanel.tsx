import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import type { EventCard as EventCardType, VotingSession } from '../../../core/domain/types';

interface VotingPanelProps {
  card: EventCardType;
  votingSession: VotingSession;
}

export const VotingPanel: React.FC<VotingPanelProps> = ({ card, votingSession }) => {
  const { game, castVote, resolveVoting } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(0);

  const activeCorp = game?.corporations[game.activeCorporationIndex];
  
  useEffect(() => {
    if (!votingSession || votingSession.resolved) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((votingSession.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        resolveVoting();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [votingSession, resolveVoting]);

  const votes = votingSession?.votes || {};
  const ceo = activeCorp?.players.find(p => p.role === 'CEO');
  const ceoVoted = ceo && votes[ceo.id] !== undefined;

  // Auto-resolve if CEO voted
  useEffect(() => {
    if (ceoVoted && !votingSession?.resolved) {
      resolveVoting();
    }
  }, [ceoVoted, votingSession?.resolved, resolveVoting]);

  if (!activeCorp || votingSession?.resolved) return null;

  return (
    <div className="p-3 border-t border-[var(--vn-border)]">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-white font-bold text-xs uppercase tracking-wider">CEO Quyết Định</h4>
        <div className={`text-xs font-mono font-bold px-2 py-1 rounded ${timeLeft <= 10 ? 'bg-red-900/50 text-red-400 animate-pulse' : 'bg-white/10 text-white'}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      <div className="space-y-2">
        {card.choices.map((choice, index) => {
          const isSelectedByCeo = ceo && votes[ceo.id] === index;

          return (
            <div key={index} className="bg-black/20 rounded-lg p-2 border border-[var(--vn-border)]">
              <div className="flex justify-between items-start mb-2">
                <span className="text-white text-xs font-semibold">{String.fromCharCode(65 + index)}. {choice.label}</span>
                {isSelectedByCeo && (
                  <span className="text-[var(--vn-gold)] font-bold text-xs">CEO Đã Chọn</span>
                )}
              </div>

              <div className="mt-2">
                {ceo && (
                  <motion.button
                    onClick={() => castVote(ceo.id, index as 0 | 1)}
                    whileHover={!ceoVoted ? { scale: 1.02 } : {}}
                    whileTap={!ceoVoted ? { scale: 0.98 } : {}}
                    disabled={ceoVoted}
                    className={`w-full text-xs py-1.5 px-3 rounded font-medium transition-all ${
                      isSelectedByCeo
                        ? 'bg-[var(--vn-red)] text-white border border-transparent' 
                        : ceoVoted
                          ? 'bg-white/5 text-[var(--vn-muted)] opacity-50 cursor-not-allowed'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-[var(--vn-border)]'
                    }`}
                  >
                    CEO Chọn Đáp Án Này
                  </motion.button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 text-center text-[10px] text-[var(--vn-muted)]">
        {ceoVoted ? 'CEO đã đưa ra quyết định.' : 'Đang chờ CEO quyết định...'}
      </div>
    </div>
  );
};

