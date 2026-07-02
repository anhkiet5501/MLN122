import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { GAME_ACTIONS } from '../../../core/data/actions';
import type { RegionId, ActionType } from '../../../core/domain/types';
import { REGION_ORDER } from '../../../core/data/regions';

interface ActionPanelProps {
  selectedRegion: RegionId | null;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ selectedRegion }) => {
  const { game, selectAction, drawEventCard, endTurn, resolveMonopolyCard, skipToNextPhase } = useGameStore();


  if (!game) return null;

  if (game.status !== 'PLAYING') return null;

  const activeCorp = game.corporations[game.activeCorporationIndex];
  const phase = game.phase;
  const isAITurn = activeCorp.isAI;
  const currentRegionId = REGION_ORDER[activeCorp.position % REGION_ORDER.length];
  const targetRegion = selectedRegion ?? currentRegionId;

  if (isAITurn) {
    return (
      <div className="glass rounded-xl p-4 border border-[var(--vn-border)]">
        <div className="text-center py-4">
          <div className="text-3xl mb-2">🤖</div>
          <p className="text-[var(--vn-gold)] font-semibold text-sm">AI đang suy nghĩ...</p>
          <p className="text-[var(--vn-muted)] text-xs mt-1">
            {activeCorp.corporation.name} đang thực hiện lượt
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'RESOLVE_MONOPOLY' && game.activeMonopoly) {
    const card = game.activeMonopoly.card;
    return (
      <div className="glass rounded-xl border border-red-500/50 overflow-hidden">
        <div className="p-3 bg-red-900/30 border-b border-red-500/30">
          <p className="text-red-400 font-bold text-sm">⚠️ Nguy Cơ Độc Quyền!</p>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{card.icon}</span>
            <h4 className="text-white font-bold text-sm">{card.title}</h4>
          </div>
          <p className="text-[var(--vn-muted)] text-xs mb-3">{card.description}</p>
          <motion.button
            onClick={resolveMonopolyCard}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors"
          >
            Chấp Nhận Hậu Quả
          </motion.button>
        </div>
      </div>
    );
  }

  if (phase === 'DRAW_EVENT') {
    return (
      <div className="glass rounded-xl p-4 border border-[var(--vn-border)]">
        <p className="text-white text-sm font-semibold mb-3 text-center">Giai Đoạn Sự Kiện</p>
        <motion.button
          onClick={drawEventCard}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
        >
          🃏 Rút Thẻ Sự Kiện
        </motion.button>
      </div>
    );
  }

  if (phase === 'END_TURN') {
    return (
      <div className="glass rounded-xl p-4 border border-[var(--vn-border)]">
        <p className="text-white text-sm font-semibold mb-3 text-center">Lượt Hoàn Tất</p>
        <motion.button
          onClick={endTurn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--vn-red)] to-red-700 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
        >
          ✅ Kết Thúc Lượt
        </motion.button>
      </div>
    );
  }

  if (phase !== 'SELECT_ACTION') return null;

  const currentRegion = game.regions[targetRegion];
  const canUpgrade = currentRegion.owner === activeCorp.id;



  return (
    <div className="glass rounded-xl overflow-hidden border border-[var(--vn-border)]">
      <div className="p-3 border-b border-[var(--vn-border)]">
        <p className="text-white text-xs font-bold">Chọn Hành Động</p>
        <p className="text-[var(--vn-muted)] text-[10px]">
          Mục tiêu: <span className="text-[var(--vn-gold)]">{currentRegion.name}</span>
        </p>
      </div>

      <div className="p-2 space-y-1.5">
        {GAME_ACTIONS.map((action) => {
          let cost = action.moneyCost;

          // EVN discount
          if (activeCorp.corporation.id === 'EVN' && action.type === 'BUILD_INFRASTRUCTURE') {
            cost = Math.floor(cost * 0.8);
          }

          const canAfford = activeCorp.money >= cost;
          const requiresOwnership =
            action.type === 'UPGRADE_REGION' && !canUpgrade;
          const disabled = !canAfford || requiresOwnership;

          return (
            <motion.button
              key={action.type}
              onClick={() => {
                if (!disabled) {
                  selectAction(action.type as ActionType, targetRegion);
                }
              }}
              whileHover={!disabled ? { scale: 1.01 } : {}}
              whileTap={!disabled ? { scale: 0.99 } : {}}
              disabled={disabled}
              className={`
                w-full text-left p-2.5 rounded-lg transition-all
                ${disabled
                  ? 'opacity-40 cursor-not-allowed bg-white/3'
                  : 'hover:bg-white/8 bg-white/5 cursor-pointer hover:border-[var(--vn-border)] border border-transparent'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{action.icon}</span>
                  <div>
                    <p className="text-white text-xs font-semibold">{action.label}</p>
                    <p className="text-[var(--vn-muted)] text-[10px] leading-tight">{action.description.slice(0, 50)}...</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`text-xs font-bold ${canAfford ? 'text-[var(--vn-gold)]' : 'text-red-400'}`}>
                    -${cost}
                  </p>
                  <div className="flex gap-1 justify-end mt-0.5">
                    {action.missionDelta !== 0 && (
                      <span className={`text-[9px] font-bold ${action.missionDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {action.missionDelta > 0 ? '+' : ''}{action.missionDelta}M
                      </span>
                    )}
                    {action.efficiencyDelta !== 0 && (
                      <span className={`text-[9px] font-bold ${action.efficiencyDelta > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                        {action.efficiencyDelta > 0 ? '+' : ''}{action.efficiencyDelta}E
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {requiresOwnership && (
                <p className="text-red-400 text-[9px] mt-1">⚠ Bạn không sở hữu khu vực này</p>
              )}
            </motion.button>
          );
        })}

        <motion.button
          onClick={skipToNextPhase}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full text-center p-2.5 rounded-lg transition-all bg-white/5 hover:bg-white/10 text-[var(--vn-muted)] hover:text-white border border-transparent hover:border-[var(--vn-border)] mt-2"
        >
          <span className="text-xs font-bold uppercase tracking-wide">Bỏ Qua / Bỏ Lượt</span>
        </motion.button>
      </div>
    </div>
  );
};
