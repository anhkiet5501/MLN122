import React from 'react';
import { useGameStore } from '../../store/gameStore';

const PHASE_LABELS: Record<string, string> = {
  ROLL_DICE: 'Tung Xúc Xắc',
  MOVE: 'Di Chuyển...',
  SELECT_ACTION: 'Chọn Hành Động',
  DRAW_EVENT: 'Rút Thẻ Sự Kiện',
  RESOLVE_EVENT: '📜 Giải Quyết Sự Kiện',
  END_TURN: '⏳ Kết Thúc Lượt',
  GAME_OVER: '🏆 Trò Chơi Kết Thúc',
  WAITING: 'Đang Chờ...',
};

const PHASE_STEPS = [
  'ROLL_DICE',
  'MOVE',
  'SELECT_ACTION',
  'DRAW_EVENT',
  'RESOLVE_EVENT',
  'END_TURN',
];

export const TurnPanel: React.FC = () => {
  const game = useGameStore((s) => s.game);
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!game?.actionDeadline) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((game.actionDeadline! - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [game?.actionDeadline]);

  if (!game) return null;

  const activeCorp = game.corporations[game.activeCorporationIndex];
  const currentStepIndex = PHASE_STEPS.indexOf(game.phase);

  return (
    <div className="glass border-b border-[var(--vn-border)] px-4 py-2">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Turn info */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: activeCorp.color + '33', color: activeCorp.color }}
              >
                {activeCorp.corporation.icon}
              </span>
              <span className="text-white font-bold text-sm">{activeCorp.corporation.name}</span>
              <span className="text-[var(--vn-muted)] text-xs">({activeCorp.players.length} thành viên)</span>
              {activeCorp.isAI && (
                <span className="text-[9px] bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded font-medium">AI</span>
              )}
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-[var(--vn-border)]" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[var(--vn-muted)] text-xs">Lượt</span>
            <span className="text-white font-bold text-sm">{game.turn}</span>
            <span className="text-[var(--vn-muted)] text-xs">/ {game.maxTurns}</span>
          </div>

          {timeLeft !== null && (
            <>
              <div className="w-px h-8 bg-[var(--vn-border)]" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[var(--vn-muted)]">Thời gian:</span>
                <span className={`text-sm font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            </>
          )}
        </div>

        {/* Phase stepper */}
        <div className="hidden lg:flex items-center gap-1">
          {PHASE_STEPS.map((step, i) => {
            const isActive = step === game.phase;
            const isCompleted = i < currentStepIndex;
            return (
              <React.Fragment key={step}>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--vn-red)] text-white'
                      : isCompleted
                      ? 'text-[var(--vn-muted)] line-through opacity-50'
                      : 'text-[var(--vn-muted)] opacity-40'
                  }`}
                >
                  {PHASE_LABELS[step]}
                </div>
                {i < PHASE_STEPS.length - 1 && (
                  <span className="text-[var(--vn-border)] text-xs">›</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current phase badge (mobile) */}
        <div className="lg:hidden">
          <span className="px-2 py-1 rounded-lg bg-[var(--vn-red)] text-white text-xs font-bold">
            {PHASE_LABELS[game.phase] ?? game.phase}
          </span>
        </div>

        {/* Player money summary */}
        <div className="flex items-center gap-3">
          {game.corporations.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-1 text-xs transition-all ${
                p.id === activeCorp.id ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <span style={{ color: p.color }}>{p.corporation.icon}</span>
              <span className="text-[var(--vn-gold)] font-bold">${p.money}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
