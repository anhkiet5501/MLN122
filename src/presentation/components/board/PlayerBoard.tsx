import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { DiceRoller } from './DiceRoller';
import { ActionPanel } from './ActionPanel';
import { VotingPanel } from './VotingPanel';
import { BalanceMeter } from '../player/BalanceMeter';
import { ScoringEngine } from '../../../core/engines/ScoringEngine';
import { getRegionByIndex } from '../../../core/data/regions';
import { MapPin } from 'lucide-react';
import { EventCardDisplay } from './EventCard';
import { VietnamMap } from '../map/VietnamMap';
import type { RegionId } from '../../../core/domain/types';

export const PlayerBoard: React.FC = () => {
  const game = useGameStore((s) => s.game);
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
  
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

  // Find current user's player object to show their role
  const myPlayer = myCorp.players.find(
    p => p.name.trim().toLowerCase() === myName?.trim().toLowerCase()
  );

  const ROLE_COLORS: Record<string, string> = {
    CEO: 'bg-[var(--vn-gold)] text-black',
    CFO: 'bg-blue-600/80 text-white',
    COO: 'bg-purple-600/80 text-white',
    'CSR Director': 'bg-green-700/80 text-white',
    'Strategy Director': 'bg-orange-600/80 text-white',
  };

  const currentRegionId = getRegionByIndex(myCorp.position);
  const currentRegion = game.regions[currentRegionId];

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-56px)] bg-[#0a0f18] p-4 gap-4 overflow-hidden">
      
      {/* Background Map Layer */}
      <div className="absolute inset-0 z-0 opacity-40">
        <VietnamMap 
          selectedRegion={selectedRegion} 
          onRegionClick={
            game.phase === 'SELECT_ACTION'
              ? (id) => setSelectedRegion(id === selectedRegion ? null : id)
              : undefined
          }
        />
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col gap-4">
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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-white font-black text-xl">{myCorp.corporation.name}</h2>
              {myPlayer && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${ROLE_COLORS[myPlayer.role] ?? 'bg-white/10 text-white'}`}>
                  {myPlayer.role}
                </span>
              )}
            </div>
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
              className="w-full max-w-lg mx-auto drop-shadow-2xl"
            >
              <EventCardDisplay 
                card={game.activeEvent.card} 
                resolved={game.activeEvent.resolved} 
              />
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
                    <div className="w-full glass rounded-2xl border border-[var(--vn-border)] shadow-xl overflow-hidden h-[60vh] flex flex-col relative z-20 pointer-events-auto">
                      <ActionPanel selectedRegion={selectedRegion} />
                    </div>
                  )}

                  {(game.phase === 'DRAW_EVENT' || game.phase === 'END_TURN') && (
                    <div className="w-full glass rounded-2xl border border-[var(--vn-border)] shadow-xl overflow-hidden relative z-20 pointer-events-auto">
                      <ActionPanel selectedRegion={selectedRegion} />
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
                    <div className="glass rounded-xl p-4 border border-[var(--vn-border)] shadow-md text-left">
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                           <MapPin size={18} className="text-[var(--vn-gold)]" />
                           <h4 className="font-bold text-white text-sm">Bạn đã đến: <span className="text-[var(--vn-gold)]">{currentRegion.name}</span></h4>
                         </div>
                         <div className="text-[10px] text-[var(--vn-muted)] bg-white/5 px-2 py-0.5 rounded">
                           Xúc xắc: {game.diceValue}
                         </div>
                      </div>
                      {currentRegion.description && (
                        <p className="text-[var(--vn-muted)] text-[11px] leading-relaxed italic mb-2">
                          "{currentRegion.description}"
                        </p>
                      )}
                      <div className="flex gap-3 text-[10px] font-medium border-t border-[var(--vn-border)] pt-2 mt-2">
                         <span className="text-[var(--vn-gold)]">Doanh thu: ${currentRegion.revenueValue}</span>
                         <span className="text-green-400">Sứ mệnh: {currentRegion.missionValue}</span>
                         <span className="text-[var(--vn-muted)]">Cấp độ: {currentRegion.developmentLevel}</span>
                      </div>
                    </div>
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
    </div>
  );
};
