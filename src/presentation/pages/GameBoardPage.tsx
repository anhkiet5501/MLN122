import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { HostBoard } from '../components/board/HostBoard';
import { PlayerBoard } from '../components/board/PlayerBoard';
import { ScoringEngine } from '../../core/engines/ScoringEngine';
import { GameService } from '../../core/services/GameService';
import { saveLeaderboardEntry } from '../../infrastructure/persistence/LocalStorageRepository';
import { v4 as uuid } from '../../core/utils/uuid';
import { Trophy, RotateCcw, Home } from 'lucide-react';

export const GameBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const { game, clearGame } = useGameStore();

  const role = sessionStorage.getItem('mln122_role') || 'PLAYER';
  const isHost = role === 'HOST';

  useEffect(() => {
    if (!game) {
      navigate('/', { replace: true });
    }
  }, [game, navigate]);

  useEffect(() => {
    if (game?.status === 'PLAYING' && game.turn > game.maxTurns) {
      useGameStore.setState((state) => ({
        game: state.game ? GameService.checkGameOver(state.game) : null,
      }));
    }
  }, [game?.status, game?.turn, game?.maxTurns]);

  useEffect(() => {
    if (game?.status === 'ENDED' && isHost) {
      // Only host saves the leaderboard to avoid duplicates
      const ranked = ScoringEngine.rankPlayers(game.corporations);
      ranked.forEach((player, i) => {
        saveLeaderboardEntry({
          id: uuid(),
          gameId: game.id,
          playerName: player.corporation.name,
          corporationId: player.corporation.id,
          corporationName: player.corporation.name,
          finalScore: ScoringEngine.calculateFinalScore(player),
          money: player.money,
          missionScore: player.missionScore,
          efficiencyScore: player.efficiencyScore,
          turnsPlayed: game.turn,
          date: Date.now(),
          won: i === 0,
        });
      });
    }
  }, [game?.status, game?.corporations, game?.id, game?.turn, isHost]);

  if (!game) return null;

  if (game.status === 'ENDED') {
    const ranked = ScoringEngine.rankPlayers(game.corporations);
    const winner = ranked[0];

    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 max-w-lg w-full border border-[var(--vn-border)] text-center"
        >
          {/* Winner */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-5xl"
            style={{ background: winner.color + '22', border: `2px solid ${winner.color}` }}
          >
            {winner.corporation.icon}
          </motion.div>

          <div className="text-[var(--vn-gold)] text-sm font-bold mb-1 flex items-center justify-center gap-2">
            <Trophy size={16} /> CHIẾN THẮNG
          </div>
          <h1 className="text-3xl font-black text-white mb-0.5">{winner.corporation.name}</h1>
          <p className="text-[var(--vn-muted)] text-sm mb-2">{winner.corporation.fullName}</p>
          <p className="text-[var(--vn-gold)] font-black text-4xl mb-6">
            {Math.round(ScoringEngine.calculateFinalScore(winner)).toLocaleString()}
          </p>

          {/* All rankings */}
          <div className="space-y-2 mb-8">
            {ranked.map((player, i) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
              >
                <span className="text-[var(--vn-muted)] text-sm w-5 font-bold">#{i + 1}</span>
                <span className="text-lg">{player.corporation.icon}</span>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-bold">{player.corporation.name}</p>
                  <p className="text-[var(--vn-muted)] text-[10px]">
                    ${player.money} • M:{player.missionScore} • E:{player.efficiencyScore}
                  </p>
                </div>
                <span className="text-[var(--vn-gold)] font-black text-sm">
                  {Math.round(ScoringEngine.calculateFinalScore(player)).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Buttons - Only Host can restart */}
          {isHost ? (
            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={() => { clearGame(); navigate('/create'); }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #E63946, #B91C1C)' }}
              >
                <RotateCcw size={14} /> Trò Chơi Mới
              </motion.button>
              <motion.button
                onClick={() => { clearGame(); navigate('/'); }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-[var(--vn-muted)] hover:text-white transition-colors"
              >
                <Home size={14} />
              </motion.button>
            </div>
          ) : (
            <div className="text-[var(--vn-muted)] text-sm italic">
              Đang chờ chủ phòng bắt đầu trận mới...
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return isHost ? <HostBoard /> : <PlayerBoard />;
};
