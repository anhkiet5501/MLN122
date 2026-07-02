import React from 'react';
import { motion } from 'framer-motion';
import { getLeaderboard, clearLeaderboard } from '../../infrastructure/persistence/LocalStorageRepository';
import { Trophy, Trash2, Medal } from 'lucide-react';

const CORP_COLORS: Record<string, string> = {
  EVN: '#F4D03F',
  PETROVIETNAM: '#3B82F6',
  VIETTEL: '#E63946',
  VINACOMIN: '#22C55E',
};

const CORP_ICONS: Record<string, string> = {
  EVN: '⚡',
  PETROVIETNAM: '🛢️',
  VIETTEL: '📡',
  VINACOMIN: '⛏️',
};

export const LeaderboardPage: React.FC = () => {
  const [entries, setEntries] = React.useState(getLeaderboard());

  const handleClear = () => {
    clearLeaderboard();
    setEntries([]);
  };

  const topEntries = [...entries].sort((a, b) => b.finalScore - a.finalScore);

  return (
    <main className="min-h-[calc(100vh-56px)] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-2">
              <Trophy className="text-[var(--vn-gold)]" size={28} />
              Bảng Xếp Hạng
            </h1>
            <p className="text-[var(--vn-muted)] text-sm mt-1">Những nhà lãnh đạo xuất sắc nhất mọi thời đại</p>
          </div>
          {entries.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-900/20 transition-colors border border-red-900/30"
            >
              <Trash2 size={12} /> Xóa
            </button>
          )}
        </motion.div>

        {topEntries.length === 0 ? (
          <div className="glass rounded-xl p-12 border border-[var(--vn-border)] text-center">
            <Trophy size={48} className="text-[var(--vn-muted)] mx-auto mb-3 opacity-30" />
            <p className="text-[var(--vn-muted)] text-sm">Chưa có ván chơi nào hoàn thành.</p>
            <p className="text-[var(--vn-muted)] text-xs mt-1">Hãy chơi hết một ván game để lưu thành tích tại đây!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topEntries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass rounded-xl p-4 border transition-all ${
                  entry.won
                    ? 'border-[var(--vn-gold)]/40'
                    : 'border-[var(--vn-border)]'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-8 flex-shrink-0 text-center">
                    {i === 0 ? (
                      <Medal size={20} className="text-[var(--vn-gold)] mx-auto" />
                    ) : i === 1 ? (
                      <Medal size={20} className="text-gray-400 mx-auto" />
                    ) : i === 2 ? (
                      <Medal size={20} className="text-amber-700 mx-auto" />
                    ) : (
                      <span className="text-[var(--vn-muted)] text-sm font-bold">#{i + 1}</span>
                    )}
                  </div>

                  {/* Corp icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: CORP_COLORS[entry.corporationId] + '22',
                      border: `1px solid ${CORP_COLORS[entry.corporationId]}44`,
                    }}
                  >
                    {CORP_ICONS[entry.corporationId]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold text-sm">{entry.playerName}</p>
                      {entry.won && (
                        <span className="text-[9px] bg-[var(--vn-gold)]/20 text-[var(--vn-gold)] px-1.5 py-0.5 rounded font-bold">
                          THẮNG CUỘC
                        </span>
                      )}
                    </div>
                    <p className="text-[var(--vn-muted)] text-xs">{entry.corporationName}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[10px] text-green-400">Sứ mệnh:{entry.missionScore}</span>
                      <span className="text-[10px] text-blue-400">Hiệu quả:{entry.efficiencyScore}</span>
                      <span className="text-[10px] text-[var(--vn-gold)]">${entry.money}</span>
                      <span className="text-[10px] text-[var(--vn-muted)]">{entry.turnsPlayed} lượt</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-black text-lg">{Math.round(entry.finalScore).toLocaleString()}</p>
                    <p className="text-[var(--vn-muted)] text-[10px]">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
