import React from 'react';
import { motion } from 'framer-motion';
import { ScoringEngine } from '../../../core/engines/ScoringEngine';
import type { CorporationState } from '../../../core/domain/types';

interface BalanceMeterProps {
  corp: CorporationState;
  compact?: boolean;
}

export const BalanceMeter: React.FC<BalanceMeterProps> = ({ corp, compact = false }) => {
  const { missionScore, efficiencyScore } = corp;
  const balancePercent = ScoringEngine.getBalancePercent(missionScore, efficiencyScore);
  const status = ScoringEngine.getBalanceStatus(missionScore, efficiencyScore);

  const indicatorPos = ((balancePercent + 100) / 200) * 100; // 0-100%

  const statusColor =
    status === 'BALANCED'
      ? '#22C55E'
      : status === 'MISSION_HEAVY'
      ? '#3B82F6'
      : '#F4D03F';

  const statusLabel =
    status === 'BALANCED'
      ? '⚖️ Cân Bằng'
      : status === 'MISSION_HEAVY'
      ? '🤝 Thiên Hướng Sứ Mệnh'
      : '⚙️ Thiên Hướng Hiệu Quả';

  if (compact) {
    return (
      <div className="w-full">
        <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-blue-900 via-green-900 to-yellow-900">
          <motion.div
            className="absolute top-0.5 -translate-x-1/2 w-2 h-2 rounded-full border border-white"
            style={{ background: statusColor }}
            animate={{ left: `${indicatorPos}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Labels */}
      <div className="flex justify-between text-[10px] text-[var(--vn-muted)] mb-1">
        <span>⚙️ Hiệu Quả</span>
        <span
          className="font-bold text-[10px]"
          style={{ color: statusColor }}
        >
          {statusLabel}
        </span>
        <span>🤝 Sứ Mệnh</span>
      </div>

      {/* Track */}
      <div className="relative h-4 rounded-full bg-gradient-to-r from-yellow-900/60 via-green-900/60 to-blue-900/60 border border-[var(--vn-border)]">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />

        {/* Indicator */}
        <motion.div
          className="absolute top-0.5 -translate-x-1/2"
          animate={{ left: `${indicatorPos}%` }}
          transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        >
          <div
            className="w-3 h-3 rounded-full border-2 border-white shadow-lg"
            style={{
              background: statusColor,
              boxShadow: `0 0 8px ${statusColor}80`,
            }}
          />
        </motion.div>
      </div>

      {/* Score values */}
      <div className="flex justify-between mt-1">
        <span className="text-[var(--vn-gold)] text-xs font-bold">{efficiencyScore}</span>
        <span className="text-[var(--vn-gold)] text-xs font-bold">{missionScore}</span>
      </div>
    </div>
  );
};
