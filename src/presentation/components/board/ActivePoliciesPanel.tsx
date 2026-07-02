import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

export const ActivePoliciesPanel: React.FC = () => {
  const game = useGameStore((s) => s.game);

  if (!game || game.activePolicies.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-white font-bold text-xs uppercase tracking-wider px-1">
        🏛️ Chính Sách Hiện Hành
      </h3>
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {game.activePolicies.map((policy) => (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass rounded-xl p-3 border border-yellow-500/30 bg-yellow-900/10"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{policy.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="text-white font-bold text-sm leading-tight">{policy.title}</h4>
                    <span className="text-[10px] font-bold bg-white/10 text-[var(--vn-gold)] px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                      Còn {policy.activeForTurns} lượt
                    </span>
                  </div>
                  <p className="text-[var(--vn-muted)] text-[10px] leading-snug">
                    {policy.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
