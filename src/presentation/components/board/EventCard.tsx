import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import type { EventCard as EventCardType } from '../../../core/domain/types';
import { VotingPanel } from './VotingPanel';

const CATEGORY_COLORS: Record<string, string> = {
  ECONOMIC: '#F4D03F',
  SOCIAL: '#22C55E',
  NATURAL: '#3B82F6',
  POLITICAL: '#A855F7',
  TECHNOLOGY: '#06B6D4',
};

const CATEGORY_LABELS: Record<string, string> = {
  ECONOMIC: 'Kinh Tế',
  SOCIAL: 'Xã Hội',
  NATURAL: 'Thiên Tai',
  POLITICAL: 'Chính Trị',
  TECHNOLOGY: 'Công Nghệ',
};

interface EventCardProps {
  card: EventCardType;
  resolved: boolean;
}

export const EventCardDisplay: React.FC<EventCardProps> = ({ card, resolved }) => {
  const { resolveEventCard, game } = useGameStore();

  const activeCorp = game?.corporations[game.activeCorporationIndex];
  const isAITurn = activeCorp?.isAI;

  const categoryColor = CATEGORY_COLORS[card.category] ?? '#7B93B0';

  return (
    <motion.div
      key={card.id}
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: -90, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass rounded-xl overflow-hidden border border-[var(--vn-border)]"
      style={{ borderTopColor: categoryColor, borderTopWidth: '3px' }}
    >
      {/* Card header */}
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: `${categoryColor}22` }}
          >
            {card.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ color: categoryColor, background: `${categoryColor}22` }}
              >
                {CATEGORY_LABELS[card.category]}
              </span>
            </div>
            <h3 className="font-bold text-white text-sm leading-tight">{card.title}</h3>
          </div>
        </div>
        <p className="text-[var(--vn-muted)] text-xs mt-2 leading-relaxed">
          {card.description}
        </p>
      </div>

      {/* Choices / Voting */}
      {!resolved && !isAITurn && (
        <>
          {game?.activeEvent?.votingSession ? (
            <VotingPanel card={card} votingSession={game.activeEvent.votingSession} />
          ) : (
            <div className="p-3 grid grid-cols-1 gap-2">
              {card.choices.map((choice, index) => (
                <motion.button
                  key={index}
                  onClick={() => resolveEventCard(index as 0 | 1)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-[var(--vn-border)] transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-xs font-semibold">
                      {String.fromCharCode(65 + index)}. {choice.label}
                    </span>
                  </div>
                  <p className="text-[var(--vn-muted)] text-[10px] mb-2">{choice.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    {choice.moneyDelta !== 0 && (
                      <StatBadge label="💰" value={choice.moneyDelta} suffix="$" />
                    )}
                    {choice.missionDelta !== 0 && (
                      <StatBadge label="🤝" value={choice.missionDelta} suffix=" Điểm Sứ Mệnh" />
                    )}
                    {choice.efficiencyDelta !== 0 && (
                      <StatBadge label="⚙️" value={choice.efficiencyDelta} suffix=" Điểm Hiệu Quả" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </>
      )}

      {/* AI turn or resolved */}
      {(isAITurn || resolved) && (
        <div className="p-3">
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <p className="text-[var(--vn-muted)] text-xs">
              {isAITurn ? '🤖 AI đang quyết định...' : '✅ Sự kiện đã được giải quyết'}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const StatBadge: React.FC<{ label: string; value: number; suffix: string }> = ({
  label,
  value,
  suffix,
}) => (
  <span
    className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
      value > 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
    }`}
  >
    {label} {value > 0 ? '+' : ''}{value}{suffix}
  </span>
);
