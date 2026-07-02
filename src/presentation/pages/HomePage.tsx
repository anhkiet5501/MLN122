import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Globe } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim().length >= 4) {
      sessionStorage.setItem('mln122_role', 'PLAYER');
      navigate(`/room/${pin.trim().toUpperCase()}`);
    }
  };

  const handleCreateRoom = () => {
    sessionStorage.setItem('mln122_role', 'HOST');
    // Generate a random 6 character alphanumeric PIN
    const newPin = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${newPin}`);
  };

  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--vn-red)] opacity-5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--vn-gold)] opacity-5 blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 bg-gradient-to-br from-[#E63946] to-[#B91C1C] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-red-500/20"
          >
            <Globe size={40} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2">Quốc Gia Cân Bằng</h1>
          <p className="text-[var(--vn-muted)]">Tham gia cuộc chơi kinh tế vĩ mô cùng bạn bè</p>
        </div>

        <div className="glass p-8 rounded-3xl border border-[var(--vn-border)] shadow-2xl">
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-[var(--vn-muted)] mb-2 text-center">
                Mã phòng (PIN)
              </label>
              <input
                type="text"
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                placeholder="VD: ABCD12"
                className="w-full bg-black/40 border-2 border-[var(--vn-border)] focus:border-[var(--vn-gold)] rounded-2xl px-6 py-5 text-center text-3xl font-black text-white uppercase tracking-widest outline-none transition-all placeholder:text-gray-700"
                maxLength={8}
              />
            </div>
            
            <button
              type="submit"
              disabled={pin.trim().length < 4}
              className="w-full py-5 rounded-2xl font-black text-lg text-black bg-[var(--vn-gold)] hover:bg-[#FFE066] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-2 shadow-[0_0_20px_rgba(244,208,63,0.3)]"
            >
              Tham Gia Ngay
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-[var(--vn-border)]"></div>
            <span className="text-xs font-medium text-[var(--vn-muted)] uppercase tracking-wider">hoặc</span>
            <div className="flex-1 h-px bg-[var(--vn-border)]"></div>
          </div>

          <button
            onClick={handleCreateRoom}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white glass border border-[var(--vn-border)] hover:border-white/20 hover:bg-white/5 transition-all active:scale-[0.98]"
          >
            <Plus size={20} />
            Tạo phòng chơi mới
          </button>
        </div>
        
        <div className="flex justify-center gap-6 mt-8">
          <button onClick={() => navigate('/rules')} className="text-[var(--vn-muted)] hover:text-white text-sm font-medium transition-colors">
            Cách chơi
          </button>
          <button onClick={() => navigate('/about')} className="text-[var(--vn-muted)] hover:text-white text-sm font-medium transition-colors">
            Thông tin
          </button>
        </div>
      </motion.div>
    </main>
  );
};
