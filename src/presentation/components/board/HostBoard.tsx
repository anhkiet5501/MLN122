import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TurnPanel } from '../board/TurnPanel';
import { VietnamMap } from '../map/VietnamMap';
import { EventCardDisplay } from '../board/EventCard';
import { PlayerStats } from '../player/PlayerStats';
import { EventLog } from '../game/EventLog';
import { ActivePoliciesPanel } from '../board/ActivePoliciesPanel';
import { IncomeSummaryModal } from '../board/IncomeSummaryModal';
import { useGameStore } from '../../store/gameStore';

export const HostBoard: React.FC = () => {
  const game = useGameStore((s) => s.game);
  const dismissIncomeSummary = useGameStore((s) => s.dismissIncomeSummary);

  React.useEffect(() => {
    if (!game?.actionDeadline) return;

    const checkTimer = setInterval(() => {
      const { game: latestGame, rollDice, skipToNextPhase, resolveVoting } = useGameStore.getState();
      if (!latestGame?.actionDeadline) return;
      
      const isExpired = Date.now() >= latestGame.actionDeadline;
      if (isExpired && latestGame.status === 'PLAYING') {
        const activeCorp = latestGame.corporations[latestGame.activeCorporationIndex];
        // AI turns are handled by GameStore's executeAITurn
        if (activeCorp?.isAI) return;

        if (latestGame.phase === 'ROLL_DICE') {
          rollDice();
        } else if (latestGame.phase === 'SELECT_ACTION') {
          skipToNextPhase();
        } else if (latestGame.phase === 'RESOLVE_EVENT') {
          resolveVoting();
        }
      }
    }, 1000);

    return () => clearInterval(checkTimer);
  }, [game?.actionDeadline]);

  if (!game) return null;

  return (
    <div className="relative w-full h-[calc(100vh-56px)] overflow-hidden bg-[#0a0f18]">
      {/* Income Summary Modal — shown after every full round */}
      {game.activeIncomeSummary && game.activeIncomeSummary.length > 0 && (
        <div className="pointer-events-auto">
          <IncomeSummaryModal
            summaries={game.activeIncomeSummary}
            onDismiss={dismissIncomeSummary}
          />
        </div>
      )}
      
      {/* Background Map Layer */}
      <div className="absolute inset-0 z-0">
        <VietnamMap />
      </div>

      {/* Top Turn Panel */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-4 pointer-events-none">
        <div className="max-w-4xl mx-auto drop-shadow-2xl">
          <TurnPanel />
        </div>
      </div>

      {/* Floating UI Container */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 pt-24 pb-6">
        <div className="flex justify-between items-start flex-1 overflow-hidden">
          {/* Left Side: Map Legend */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4 w-[280px] h-full"
          >
            {/* Map Legend */}
            <div className="glass rounded-lg p-4 border border-[var(--vn-border)] shadow-2xl backdrop-blur-md bg-black/40 mt-auto">
              <p className="text-[var(--vn-muted)] text-[10px] mb-3 uppercase tracking-wider font-bold">Chú Giải Bản Đồ</p>
              <div className="flex flex-col gap-3">
                {game.corporations.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded shadow-sm"
                      style={{ background: p.color }}
                    />
                    <span className="text-sm text-white font-bold">{p.corporation.name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/10">
                  <div className="w-4 h-4 rounded bg-[rgba(30,58,95,0.6)] border border-[rgba(30,100,160,0.4)]" />
                  <span className="text-sm text-[var(--vn-muted)] font-medium">Chưa sở hữu</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Center: Event Cards / Status */}
          <div className="flex-1 px-8 flex flex-col items-center justify-center pointer-events-auto max-w-2xl mx-auto h-full">
            <AnimatePresence mode="wait">
              {game.activeEvent && (
                <motion.div
                  key={game.activeEvent.card.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ type: 'spring', bounce: 0.4 }}
                  className="w-full drop-shadow-2xl"
                >
                  <EventCardDisplay
                    card={game.activeEvent.card}
                    resolved={game.activeEvent.resolved}
                  />
                </motion.div>
              )}

              {!game.activeEvent && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass rounded-2xl border border-[var(--vn-border)] p-8 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-md bg-black/40"
                >
                  <span className="text-5xl mb-4 drop-shadow-md">
                    {game.phase === 'ROLL_DICE' ? '🎲' : '🗺️'}
                  </span>
                  <p className="text-white text-2xl font-bold drop-shadow-md">
                    {game.phase === 'ROLL_DICE' && 'Chờ người chơi tung xúc xắc...'}
                    {game.phase === 'MOVE' && 'Đang di chuyển...'}
                    {game.phase === 'SELECT_ACTION' && 'Người chơi đang hành động...'}
                    {game.phase === 'DRAW_EVENT' && 'Rút thẻ sự kiện...'}
                    {game.phase === 'END_TURN' && 'Chờ kết thúc lượt...'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Stats & Log */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4 w-[340px] h-full pointer-events-auto"
          >
            <ActivePoliciesPanel />
            <div className="flex-1 overflow-y-auto glass rounded-xl border border-[var(--vn-border)] shadow-2xl backdrop-blur-md bg-black/40">
              <PlayerStats />
            </div>
            
            <div className="h-56 shrink-0 glass rounded-xl p-0 border border-[var(--vn-border)] shadow-2xl backdrop-blur-md bg-black/40 flex flex-col overflow-hidden">
              <EventLog />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
