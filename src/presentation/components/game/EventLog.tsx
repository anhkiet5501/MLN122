import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { LogEntry } from '../../../core/domain/types';

const LOG_TYPE_STYLES: Record<string, { dot: string; text: string }> = {
  ACTION: { dot: '#3B82F6', text: 'text-[var(--vn-text)]' },
  EVENT: { dot: '#A855F7', text: 'text-purple-300' },
  MONOPOLY: { dot: '#E63946', text: 'text-red-400' },
  SYSTEM: { dot: '#7B93B0', text: 'text-[var(--vn-muted)]' },
  ACHIEVEMENT: { dot: '#F4D03F', text: 'text-[var(--vn-gold)]' },
};

const CORP_COLORS: Record<string, string> = {
  EVN: '#F4D03F',
  PETROVIETNAM: '#3B82F6',
  VIETTEL: '#E63946',
  VINACOMIN: '#22C55E',
};

export const EventLog: React.FC = () => {
  const game = useGameStore((s) => s.game);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [game?.log.length]);

  if (!game) return null;

  const recentLogs = game.log.slice(0, 30);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-white text-xs font-bold flex items-center gap-1.5">
          📋 Nhật Ký Sự Kiện
        </h3>
        <span className="text-[var(--vn-muted)] text-[10px]">{game.log.length} sự kiện</span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1.5 pr-1"
        style={{ maxHeight: '160px' }}
      >
        {recentLogs.map((entry, i) => (
          <LogEntryRow key={entry.id} entry={entry} isLatest={i === 0} />
        ))}
      </div>
    </div>
  );
};

const LogEntryRow: React.FC<{ entry: LogEntry; isLatest: boolean }> = ({ entry, isLatest }) => {
  const style = LOG_TYPE_STYLES[entry.type] ?? LOG_TYPE_STYLES.SYSTEM;
  const corpColor = CORP_COLORS[entry.corporationId] ?? '#7B93B0';

  return (
    <div
      className={`flex items-start gap-2 text-[10px] rounded-lg px-2 py-1.5 transition-all ${
        isLatest ? 'bg-white/5 fade-in' : 'hover:bg-white/3'
      }`}
    >
      <div
        className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
        style={{ background: style.dot }}
      />
      <div className="flex-1 min-w-0">
        <span
          className="font-semibold mr-1"
          style={{ color: corpColor }}
        >
          [T{entry.turn}]
        </span>
        <span className={style.text}>{entry.message}</span>
      </div>
    </div>
  );
};
