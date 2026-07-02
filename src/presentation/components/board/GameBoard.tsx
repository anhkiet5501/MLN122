import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TurnPanel } from '../board/TurnPanel';
import { VietnamMap } from '../map/VietnamMap';
import { DiceRoller } from '../board/DiceRoller';
import { ActionPanel } from '../board/ActionPanel';
import { EventCardDisplay } from '../board/EventCard';
import { PlayerStats } from '../player/PlayerStats';
import { EventLog } from '../game/EventLog';
import { ActivePoliciesPanel } from '../board/ActivePoliciesPanel';
import { IncomeSummaryModal } from '../board/IncomeSummaryModal';
import { useGameStore } from '../../store/gameStore';
import type { RegionId } from '../../../core/domain/types';

export const GameBoard: React.FC = () => {
  const game = useGameStore((s) => s.game);
  const dismissIncomeSummary = useGameStore((s) => s.dismissIncomeSummary);
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);

  if (!game) return null;

  return (
    <div className="relative w-full h-[calc(100vh-56px)] overflow-hidden bg-[#0a0f18]">
      {/* Income Summary Modal — shown after every full round */}
      {game.activeIncomeSummary && game.activeIncomeSummary.length > 0 && (
        <IncomeSummaryModal
          summaries={game.activeIncomeSummary}
          onDismiss={dismissIncomeSummary}
        />
      )}
      {/* Background Map Layer */}
      <div className="absolute inset-0 z-0">
        <VietnamMap
          onRegionClick={
            game.phase === 'SELECT_ACTION'
              ? (id) => setSelectedRegion(id === selectedRegion ? null : id)
              : undefined
          }
          selectedRegion={selectedRegion}
        />
      </div>

      {/* Top Turn Panel */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-4 pointer-events-none">
        <div className="pointer-events-auto max-w-4xl mx-auto drop-shadow-2xl">
          <TurnPanel />
        </div>
      </div>

      {/* Floating UI Container */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 pt-24 pb-6">
        <div className="flex justify-between items-start flex-1 overflow-hidden">
          {/* Left Side: Actions & Dice */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4 w-[340px] h-full pointer-events-auto"
          >
            {/* Dice */}
            <div className="glass rounded-xl p-4 border border-[var(--vn-border)] flex flex-col items-center justify-center gap-2 shadow-2xl backdrop-blur-md bg-black/40">
              <DiceRoller />
            </div>

            {/* Action panel */}
            <div className="flex-1 overflow-y-auto glass rounded-xl border border-[var(--vn-border)] shadow-2xl backdrop-blur-md bg-black/40">
              <ActionPanel selectedRegion={selectedRegion} />
            </div>
            
            {/* Map Legend */}
            <div className="glass rounded-lg p-3 border border-[var(--vn-border)] shadow-2xl backdrop-blur-md bg-black/40 shrink-0">
              <p className="text-[var(--vn-muted)] text-[10px] mb-2 uppercase tracking-wider font-bold">Chú Giải Bản Đồ</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {game.corporations.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0 shadow-sm"
                      style={{ background: p.color }}
                    />
                    <span className="text-xs text-white truncate drop-shadow-md font-medium">{p.corporation.name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-[rgba(30,58,95,0.6)] border border-[rgba(30,100,160,0.4)]" />
                  <span className="text-xs text-[var(--vn-muted)] font-medium">Chưa sở hữu</span>
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
                  className="glass rounded-2xl border border-[var(--vn-border)] p-6 px-10 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-md bg-black/40"
                >
                  <span className="text-4xl mb-3 drop-shadow-md">
                    {game.phase === 'ROLL_DICE' ? '🎲' : '🗺️'}
                  </span>
                  <p className="text-white text-lg font-medium drop-shadow-md">
                    {game.phase === 'ROLL_DICE' && 'Đổ xúc xắc để bắt đầu lượt của bạn'}
                    {game.phase === 'MOVE' && 'Đang di chuyển đến khu vực mới...'}
                    {game.phase === 'SELECT_ACTION' && 'Chọn một hành động để thực hiện'}
                    {game.phase === 'DRAW_EVENT' && 'Rút thẻ sự kiện để tiếp tục'}
                    {game.phase === 'END_TURN' && 'Sẵn sàng kết thúc lượt'}
                    {game.phase === 'GAME_OVER' && 'Trò chơi đã kết thúc!'}
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
