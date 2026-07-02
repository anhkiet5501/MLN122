import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { ScoringEngine } from '../../../core/engines/ScoringEngine';
import { BalanceMeter } from './BalanceMeter';

import { ChevronDown, ChevronUp, Star } from 'lucide-react';

export const PlayerStats: React.FC = () => {
  const game = useGameStore((s) => s.game);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (!game) return null;

  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      <h2 className="text-white font-bold text-sm px-1 flex items-center gap-2">
        <Star size={14} className="text-[var(--vn-gold)]" />
        Thống Kê Tập Đoàn
      </h2>

      {game.corporations.map((corp, idx) => {
        const isActive = idx === game.activeCorporationIndex;
        const isExpanded = expandedId === corp.id;
        const finalScore = ScoringEngine.calculateFinalScore(corp);

        return (
          <motion.div
            key={corp.id}
            layout
            className={`glass rounded-xl overflow-hidden border transition-all ${
              isActive
                ? 'border-[var(--vn-red)] pulse-active'
                : 'border-[var(--vn-border)]'
            }`}
          >
            {/* Header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : corp.id)}
              className="w-full text-left"
            >
              <div className="p-3 flex items-center gap-2">
                {/* Corp icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: corp.color + '22', border: `1px solid ${corp.color}44` }}
                >
                  {corp.corporation.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-white font-bold text-xs truncate">{corp.corporation.name}</p>
                    {isActive && (
                      <span className="text-[9px] bg-[var(--vn-red)] text-white px-1 py-0.5 rounded font-bold flex-shrink-0">
                        LƯỢT HIỆN TẠI
                      </span>
                    )}
                    {corp.isAI && (
                      <span className="text-[9px] bg-purple-900/50 text-purple-300 px-1 py-0.5 rounded flex-shrink-0">
                        AI
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--vn-muted)] text-[10px]">Nhóm • {corp.players.length} Thành Viên</p>

                  {/* Balance meter compact */}
                  <div className="mt-1">
                    <BalanceMeter corp={corp} compact />
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-[var(--vn-gold)] font-black text-base">${corp.money}</p>
                  <p className="text-[var(--vn-muted)] text-[9px]">
                    Điểm: <span className="text-white font-bold">{Math.round(finalScore).toLocaleString()}</span>
                  </p>
                </div>

                <div className="text-[var(--vn-muted)] flex-shrink-0">
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>
            </button>

            {/* Expanded details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 border-t border-[var(--vn-border)] pt-3 space-y-3">
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <StatCard
                        label="Điểm Sứ Mệnh"
                        value={corp.missionScore}
                        max={100}
                        color="#22C55E"
                        icon="🤝"
                      />
                      <StatCard
                        label="Điểm Hiệu Quả"
                        value={corp.efficiencyScore}
                        max={100}
                        color="#3B82F6"
                        icon="⚙️"
                      />
                    </div>

                    {/* Score formula */}
                    <div className="rounded-lg bg-white/5 p-2">
                      <p className="text-[10px] text-[var(--vn-muted)] mb-1">Công Thức Tính Điểm</p>
                      <p className="text-[10px] text-white font-mono">
                        ({corp.money}/10) × {corp.missionScore} × {corp.efficiencyScore}
                        {' '}- |{corp.missionScore} - {corp.efficiencyScore}| × 100
                      </p>
                      <p className="text-[var(--vn-gold)] font-black text-sm mt-1">
                        = {Math.round(finalScore).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, max, color, icon }) => (
  <div className="rounded-lg bg-white/5 p-2">
    <div className="flex items-center gap-1 mb-1">
      <span className="text-xs">{icon}</span>
      <span className="text-[10px] text-[var(--vn-muted)]">{label}</span>
    </div>
    <p className="text-white font-black text-lg leading-none mb-1.5">{value}</p>
    <div className="w-full h-1.5 rounded-full bg-white/10">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      />
    </div>
  </div>
);
