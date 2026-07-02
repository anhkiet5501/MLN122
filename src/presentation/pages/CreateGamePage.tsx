import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMyPresence, useOthers } from '@liveblocks/react';
import { useGameStore } from '../store/gameStore';
import { CORPORATIONS } from '../../core/data/corporations';
import { GAME_ACTIONS } from '../../core/data/actions';
import type { CorporationId, CreateGameConfig, GameMode, AIDifficulty, TeamRole } from '../../core/domain/types';
import { Play, Plus, Minus, Bot, Users, UserPlus, Trash2, CheckCircle2 } from 'lucide-react';

const TEAM_ROLES: TeamRole[] = ['CEO', 'CFO', 'COO', 'CSR Director', 'Strategy Director'];

interface PlayerConfig {
  name: string;
  role: TeamRole;
}

interface CorpConfig {
  corporationId: CorporationId;
  isAI: boolean;
  players: PlayerConfig[];
}

export const CreateGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const createGame = useGameStore((s) => s.createGame);
  
  // Role
  const role = sessionStorage.getItem('mln122_role') || 'PLAYER';
  const isHost = role === 'HOST';

  // Liveblocks presence
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();

  // Host state
  const [playerCount, setPlayerCount] = useState(2);
  const [mode, setMode] = useState<GameMode>('HOTSEAT');
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('EASY');
  const [maxTurns, setMaxTurns] = useState(5);
  const [discussionTimer, setDiscussionTimer] = useState(60);
  const [corporations, setCorporations] = useState<CorpConfig[]>([
    { corporationId: 'EVN', isAI: false, players: [{ name: 'Người chơi 1', role: 'CEO' }] },
    { corporationId: 'PETROVIETNAM', isAI: false, players: [{ name: 'Người chơi 2', role: 'CEO' }] },
    { corporationId: 'VIETTEL', isAI: false, players: [{ name: 'Người chơi 3', role: 'CEO' }] },
    { corporationId: 'VINACOMIN', isAI: false, players: [{ name: 'Người chơi 4', role: 'CEO' }] },
  ]);

  // Player state
  const [playerName, setPlayerName] = useState('');
  const [selectedCorp, setSelectedCorp] = useState<CorporationId | ''>('');
  const [isReady, setIsReady] = useState(false);

  const activeCorps = corporations.slice(0, playerCount);
  const usedCorps = activeCorps.map((p) => p.corporationId);

  const updateCorp = (index: number, updates: Partial<CorpConfig>) => {
    setCorporations((prev) => prev.map((p, i) => (i === index ? { ...p, ...updates } : p)));
  };

  const handleHostStart = () => {
    // Map connected players (from others and myPresence) to the active corporations
    const realActiveCorps = activeCorps.map(corpConfig => {
      // Find someone who selected this corporation in others
      const otherPlayer = others.find(o => o.presence?.corporationId === corpConfig.corporationId);
      
      let players = corpConfig.players;
      
      if (otherPlayer && otherPlayer.presence?.name) {
        players = [{ name: String(otherPlayer.presence.name), role: 'CEO' }];
      } else if (myPresence.corporationId === corpConfig.corporationId && myPresence.name) {
        // If the host is playing this corp
        players = [{ name: String(myPresence.name), role: 'CEO' }];
      }
      
      return {
        ...corpConfig,
        players
      };
    });

    const config: CreateGameConfig = {
      corporations: realActiveCorps,
      mode,
      aiDifficulty,
      maxTurns,
      discussionTimer,
    };
    createGame(config);
  };

  const handlePlayerReady = () => {
    if (playerName.trim() && selectedCorp) {
      setIsReady(true);
      sessionStorage.setItem('mln122_corp', selectedCorp);
      sessionStorage.setItem('mln122_name', playerName);
      updateMyPresence({ 
        name: playerName, 
        corporationId: selectedCorp, 
        isReady: true 
      });
    }
  };

  // -------------------------------------------------------------
  // PLAYER VIEW
  // -------------------------------------------------------------
  if (!isHost) {
    return (
      <main className="min-h-[calc(100vh-56px)] px-4 py-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass p-8 rounded-3xl border border-[var(--vn-border)] shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Xin chào!</h1>
            <p className="text-[var(--vn-muted)]">Hãy chọn tên và tập đoàn của bạn</p>
          </div>

          {!isReady ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--vn-muted)] mb-2">Tên hiển thị</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  className="w-full bg-black/40 border-2 border-[var(--vn-border)] focus:border-[var(--vn-gold)] rounded-xl px-4 py-3 text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--vn-muted)] mb-2">Chọn Tập đoàn</label>
                <div className="grid grid-cols-2 gap-2">
                  {CORPORATIONS.map(corp => {
                    const isSelected = selectedCorp === corp.id;
                    const isTakenByOther = others.some(o => o.presence?.corporationId === corp.id);

                    return (
                      <button
                        key={corp.id}
                        onClick={() => !isTakenByOther && setSelectedCorp(corp.id as CorporationId)}
                        disabled={isTakenByOther}
                        className={`p-3 rounded-xl border transition-all text-left flex flex-col items-center ${
                          isSelected
                            ? 'border-[var(--vn-gold)] bg-[var(--vn-gold)]/20 text-white shadow-[0_0_15px_rgba(244,208,63,0.3)]'
                            : isTakenByOther
                            ? 'border-transparent opacity-30 cursor-not-allowed'
                            : 'border-[var(--vn-border)] text-[var(--vn-muted)] hover:border-white/30'
                        }`}
                      >
                        <span className="text-2xl mb-1">{corp.icon}</span>
                        <span className="text-xs font-bold text-center mt-1">{corp.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handlePlayerReady}
                disabled={!playerName.trim() || !selectedCorp}
                className="w-full py-4 rounded-xl font-black text-lg text-black bg-[var(--vn-gold)] hover:bg-[#FFE066] disabled:opacity-50 transition-all mt-4"
              >
                Sẵn Sàng!
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 size={40} className="text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Đã Sẵn Sàng!</h2>
              <p className="text-[var(--vn-muted)] text-center">
                Bạn đã tham gia với tư cách <strong>{playerName}</strong> ({selectedCorp}).<br/>
                Vui lòng nhìn lên màn hình chính và chờ Máy chủ bắt đầu trận đấu...
              </p>
            </div>
          )}
        </motion.div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // HOST VIEW
  // -------------------------------------------------------------
  return (
    <main className="min-h-[calc(100vh-56px)] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        
        {roomId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 text-center bg-gradient-to-r from-[var(--vn-red)] to-[#B91C1C] rounded-3xl p-6 shadow-2xl shadow-red-900/30 border border-white/20"
          >
            <p className="text-white/80 font-semibold uppercase tracking-widest text-sm mb-2">Mã phòng (PIN) để người khác tham gia</p>
            <h2 className="text-6xl md:text-8xl font-black text-white tracking-[0.2em] font-mono">{roomId}</h2>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Connected Players */}
          <div className="lg:col-span-1 glass rounded-xl border border-[var(--vn-border)] p-4 flex flex-col min-h-[300px]">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <Users size={16} className="text-[var(--vn-gold)]"/> 
              Người chơi đã vào ({others.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {others.length === 0 ? (
                <div className="text-center text-[var(--vn-muted)] text-sm py-8 italic">
                  Chưa có ai vào phòng...
                </div>
              ) : (
                others.map((other) => (
                  <div key={other.connectionId} className="bg-white/5 p-3 rounded-lg border border-[var(--vn-border)]">
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      {other.presence?.isReady && <CheckCircle2 size={14} className="text-green-500" />}
                      {other.presence?.name ? String(other.presence.name) : 'Khách ẩn danh'}
                    </div>
                    {other.presence?.corporationId && (
                      <div className="text-xs text-[var(--vn-gold)] mt-1">
                        {CORPORATIONS.find(c => c.id === other.presence?.corporationId)?.name}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Game settings */}
          <div className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SettingCard title="🎮 Chế Độ">
                <div className="grid grid-cols-2 gap-2">
                  {(['HOTSEAT', 'VS_AI'] as GameMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                        mode === m
                          ? 'border-[var(--vn-red)] bg-[var(--vn-red)]/10 text-white'
                          : 'border-[var(--vn-border)] text-[var(--vn-muted)] hover:border-[var(--vn-muted)]'
                      }`}
                    >
                      <span className="text-xs font-semibold">{m === 'HOTSEAT' ? 'Người vs Người' : 'vs AI'}</span>
                    </button>
                  ))}
                </div>
              </SettingCard>

              <SettingCard title="👥 Số Đội">
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setPlayerCount(Math.max(2, playerCount - 1))} className="w-8 h-8 rounded glass text-white hover:border-[var(--vn-red)] border border-[var(--vn-border)] flex justify-center items-center"><Minus size={14}/></button>
                  <span className="text-white font-black text-2xl w-6 text-center">{playerCount}</span>
                  <button onClick={() => setPlayerCount(Math.min(4, playerCount + 1))} className="w-8 h-8 rounded glass text-white hover:border-[var(--vn-gold)] border border-[var(--vn-border)] flex justify-center items-center"><Plus size={14}/></button>
                </div>
              </SettingCard>

              <SettingCard title="⏱️ Lượt Tối Đa">
                <select 
                  value={maxTurns} onChange={(e) => setMaxTurns(Number(e.target.value))}
                  className="w-full bg-[var(--vn-dark)] text-white border border-[var(--vn-border)] rounded-lg p-2 outline-none"
                >
                  <option value={5}>5 lượt (Nhanh)</option>
                  <option value={10}>10 lượt (Vừa)</option>
                  <option value={15}>15 lượt (Lâu)</option>
                  <option value={20}>20 lượt (Rất lâu)</option>
                </select>
              </SettingCard>

              <SettingCard title="⏱️ Thảo Luận">
                <select 
                  value={discussionTimer} onChange={(e) => setDiscussionTimer(Number(e.target.value))}
                  className="w-full bg-[var(--vn-dark)] text-white border border-[var(--vn-border)] rounded-lg p-2 outline-none"
                >
                  <option value={30}>30 giây</option>
                  <option value={60}>60 giây</option>
                  <option value={90}>90 giây</option>
                  <option value={120}>120 giây</option>
                </select>
              </SettingCard>
            </div>

            {/* Config Team */}
            <div className="glass rounded-xl p-4 border border-[var(--vn-border)]">
              <h3 className="text-white font-bold text-sm mb-4">Cấu Hình Đội (Chỉ định bắt buộc)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCorps.map((corpConfig, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4 border border-[var(--vn-border)]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-white">Đội {index + 1}</span>
                      {mode === 'VS_AI' && index > 0 && (
                        <button onClick={() => updateCorp(index, { isAI: !corpConfig.isAI })} className="text-[10px] px-2 py-1 bg-purple-600/50 text-white rounded">
                          {corpConfig.isAI ? 'Máy (AI)' : 'Người chơi'}
                        </button>
                      )}
                    </div>
                    <select 
                      value={corpConfig.corporationId}
                      onChange={(e) => updateCorp(index, { corporationId: e.target.value as CorporationId })}
                      className="w-full bg-[var(--vn-dark)] text-[var(--vn-gold)] border border-[var(--vn-border)] rounded-lg p-2 outline-none text-sm font-bold"
                    >
                      {CORPORATIONS.map(c => (
                        <option key={c.id} value={c.id} disabled={usedCorps.includes(c.id) && corpConfig.corporationId !== c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {(() => {
                      const corp = CORPORATIONS.find(c => c.id === corpConfig.corporationId);
                      if (!corp) return null;
                      return (
                        <div className="mt-3 space-y-2">
                          <p className="text-[10px] text-[var(--vn-muted)] leading-relaxed">{corp.strategyFocus}</p>
                          <div className="text-[9px] text-[var(--vn-muted)] space-y-0.5">
                            {corp.actionPriorities.slice(0, 3).map((actionType, i) => {
                              const action = GAME_ACTIONS.find(a => a.type === actionType);
                              return action ? (
                                <p key={actionType}>
                                  <span className="text-[var(--vn-gold)]">#{i + 1}</span> {action.label}
                                </p>
                              ) : null;
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            </div>

            {/* Start button */}
            <motion.div className="mt-8 flex justify-end">
              <motion.button
                onClick={handleHostStart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-10 py-4 rounded-xl font-black text-lg text-white glow-red"
                style={{ background: 'linear-gradient(135deg, #E63946, #B91C1C)' }}
              >
                <Play size={20} />
                Bắt Đầu Trận Đấu
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
};

const SettingCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="glass rounded-xl p-4 border border-[var(--vn-border)] flex flex-col justify-center">
    <p className="text-white font-bold text-xs mb-3">{title}</p>
    {children}
  </div>
);
