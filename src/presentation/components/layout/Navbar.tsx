import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Moon, Sun, Trophy, BookOpen, Info, Home, Gamepad2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const game = useGameStore((s) => s.game);
  const { darkMode, toggleDarkMode } = useSettingsStore();

  const navLinks = [
    { to: '/', label: 'Trang Chủ', icon: Home },
    { to: '/rules', label: 'Luật Chơi', icon: BookOpen },
    { to: '/leaderboard', label: 'Xếp Hạng', icon: Trophy },
    { to: '/about', label: 'Giới Thiệu', icon: Info },
  ];

  return (
    <header className="glass sticky top-0 z-50 border-b border-[var(--vn-border)]">
      <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-[var(--vn-red)] flex items-center justify-center text-white font-black text-sm group-hover:scale-110 transition-transform">
            ⭐
          </div>
          <span className="font-black text-base text-white tracking-tight">
            Cán Cân <span className="text-[var(--vn-gold)]">Vĩ Mô</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === to
                  ? 'bg-[var(--vn-red)] text-white'
                  : 'text-[var(--vn-muted)] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {game?.status === 'PLAYING' && (
            <Link
              to="/game"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--vn-gold)] text-[var(--vn-dark)] hover:opacity-90 transition-opacity"
            >
              <Gamepad2 size={14} />
              Tiếp Tục Chơi
            </Link>
          )}
          <button
            onClick={toggleDarkMode}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--vn-muted)] hover:text-white hover:bg-white/5 transition-colors"
            title="Bật/tắt chế độ tối"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};
