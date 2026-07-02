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

  // Identify the current user by name stored in sessionStorage
  const myName = sessionStorage.getItem('mln122_name');
  const myPlayer = activeCorp?.players.find(
    p => p.name.trim().toLowerCase() === myName?.trim().toLowerCase()
  );

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
  const myVote = myPlayer ? votes[myPlayer.id] : undefined;
  const myVoted = myVote !== undefined;

  const voteCountA = Object.values(votes).filter(v => v === 0).length;
  const voteCountB = Object.values(votes).filter(v => v === 1).length;
  const totalPlayers = activeCorp?.players.length ?? 1;
  const totalVoted = voteCountA + voteCountB;

  // Auto-resolve when ALL players have voted
  useEffect(() => {
    if (totalVoted >= totalPlayers && totalPlayers > 0 && !votingSession?.resolved) {
      resolveVoting();
    }
  }, [totalVoted, totalPlayers, votingSession?.resolved, resolveVoting]);

  if (!activeCorp || votingSession?.resolved) return null;

  return (
    <div className="p-3 border-t border-[var(--vn-border)]">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Bop Phieu Nhom</h4>
          <p className="text-[var(--vn-muted)] text-[10px] mt-0.5">{totalVoted}/{totalPlayers} nguoi da bop phieu</p>
        </div>
        <div className={`text-xs font-mono font-bold px-2 py-1 rounded ${timeLeft <= 10 ? 'bg-red-900/50 text-red-400 animate-pulse' : 'bg-white/10 text-white'}`}>
          {timeLeft}s
        </div>
      </div>

      <div className="space-y-3">
        {card.choices.map((choice, index) => {
          const isMyChoice = myVote === index;
          const voteCount = index === 0 ? voteCountA : voteCountB;
          const otherCount = index === 0 ? voteCountB : voteCountA;
          const votePercent = totalVoted > 0 ? Math.round((voteCount / totalVoted) * 100) : 0;
          const isLeading = voteCount > otherCount;
          const voterNames = activeCorp.players.filter(p => votes[p.id] === index).map(p => p.name);

          return (
            <div key={index} className={`rounded-xl border transition-all overflow-hidden ${isMyChoice ? 'border-[var(--vn-gold)] bg-[var(--vn-gold)]/10' : 'border-[var(--vn-border)] bg-black/20'}`}>
              <div className="p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white text-xs font-semibold">{String.fromCharCode(65 + index)}. {choice.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${isLeading && voteCount > 0 ? 'bg-green-900/60 text-green-400' : 'bg-white/10 text-[var(--vn-muted)]'}`}>
                    {voteCount} phieu {isLeading && voteCount > 0 ? '★' : ''}
                  </span>
                </div>

                <div className="w-full h-2 bg-white/10 rounded-full mb-2 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${index === 0 ? 'bg-[var(--vn-gold)]' : 'bg-[var(--vn-red)]'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${votePercent}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>

                {voterNames.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {voterNames.map(name => (
                      <span key={name} className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded-full text-[var(--vn-muted)]">v {name}</span>
                    ))}
                  </div>
                )}

                {myPlayer && (
                  <motion.button
                    onClick={() => !myVoted && castVote(myPlayer.id, index as 0 | 1)}
                    whileHover={!myVoted ? { scale: 1.02 } : {}}
                    whileTap={!myVoted ? { scale: 0.98 } : {}}
                    disabled={myVoted}
                    className={`w-full text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${isMyChoice ? 'bg-[var(--vn-gold)] text-black font-black border border-transparent' : myVoted ? 'bg-white/5 text-[var(--vn-muted)] opacity-40 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white border border-[var(--vn-border)]'}`}
                  >
                    {isMyChoice ? 'Ban da chon' : myVoted ? 'Da bop phieu' : 'Chon dap an nay'}
                  </motion.button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-center text-[10px] text-[var(--vn-muted)]">
        {totalVoted >= totalPlayers ? 'Tat ca da bop phieu - dang tong ket...' : myVoted ? `Ban da bop phieu. Cho ${totalPlayers - totalVoted} nguoi con lai...` : myPlayer ? 'Hay bop phieu cho dap an cua ban!' : 'Dang cho nhom bop phieu...'}
      </div>
    </div>
  );
};
