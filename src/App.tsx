import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './presentation/pages/HomePage';
import { RoomPage } from './presentation/pages/RoomPage';
import { LeaderboardPage } from './presentation/pages/LeaderboardPage';
import { RulesPage } from './presentation/pages/RulesPage';
import { AboutPage } from './presentation/pages/AboutPage';
import { Navbar } from './presentation/components/layout/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
