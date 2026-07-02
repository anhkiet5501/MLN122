import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export const DiceRoller: React.FC = () => {
  const { game, rollDice } = useGameStore();
  const [isRolling, setIsRolling] = useState(false);
  const [displayFace, setDisplayFace] = useState(0);

  const phase = game?.phase;
  const canRoll = game?.status === 'PLAYING' && phase === 'ROLL_DICE' && (game.turn <= game.maxTurns);
  const diceValue = game?.diceValue;

  const handleRoll = () => {
    if (!canRoll || isRolling) return;
    setIsRolling(true);

    // Animate through random faces
    let count = 0;
    const interval = setInterval(() => {
      setDisplayFace(Math.floor(Math.random() * 6));
      count++;
      if (count > 12) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 80);

    rollDice();
  };

  useEffect(() => {
    if (diceValue) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayFace(diceValue - 1);
    }
  }, [diceValue]);

  if (!game) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        onClick={handleRoll}
        disabled={!canRoll || isRolling}
        whileHover={canRoll ? { scale: 1.05 } : {}}
        whileTap={canRoll ? { scale: 0.95 } : {}}
        className={`
          relative w-20 h-20 rounded-2xl flex items-center justify-center text-5xl
          transition-all duration-200 select-none
          ${canRoll && !isRolling
            ? 'bg-gradient-to-br from-[var(--vn-card)] to-[#0a1628] border-2 border-[var(--vn-border)] hover:border-[var(--vn-gold)] hover:glow-gold cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(244,208,63,0.2)]'
            : 'bg-[var(--vn-surface)] border border-[var(--vn-border)] opacity-50 cursor-not-allowed'
          }
        `}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={displayFace}
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.1 }}
          >
            {DICE_FACES[displayFace]}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <div className="text-center">
        {canRoll && !isRolling && (
          <p className="text-[var(--vn-gold)] text-xs font-semibold animate-pulse">
            Nhấn để Đổ
          </p>
        )}
        {isRolling && (
          <p className="text-[var(--vn-muted)] text-xs">Đang đổ...</p>
        )}
        {diceValue && !canRoll && (
          <p className="text-white text-xs font-medium">
            Đã đổ: <span className="text-[var(--vn-gold)] font-bold">{diceValue}</span>
          </p>
        )}
      </div>
    </div>
  );
};
