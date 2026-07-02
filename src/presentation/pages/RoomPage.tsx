import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from '@liveblocks/react';
import { useGameStore } from '../store/gameStore';
import { GameBoardPage } from './GameBoardPage';
import { CreateGamePage } from './CreateGamePage';

// Liveblocks public key loaded from environment variable.
// Set VITE_LIVEBLOCKS_PUBLIC_KEY in .env (dev) or Vercel env vars (production).
const API_KEY = import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY as string;

export const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) return;

    const store = useGameStore.getState();

    // Enter room through zustand-liveblocks middleware so mapped storage syncs
    store.liveblocks.enterRoom(roomId);

    return () => {
      store.liveblocks.leaveRoom();
      // Clear local state when leaving a room to avoid stale UI on next room
      useGameStore.getState().clearGame();
    };
  }, [roomId]);

  if (!roomId) {
    navigate('/');
    return null;
  }

  return (
    <LiveblocksProvider publicApiKey={API_KEY}>
      <RoomProvider id={roomId} initialPresence={{}}>
        <ClientSideSuspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)]">
            <div className="w-12 h-12 border-4 border-[var(--vn-gold)] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[var(--vn-muted)]">Đang kết nối vào phòng...</p>
          </div>
        }>
          <RoomContent />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};

const RoomContent: React.FC = () => {
  // Zustand state will automatically sync to the room provided by RoomProvider
  const game = useGameStore((state) => state.game);

  if (!game) {
    return <CreateGamePage />;
  }

  return <GameBoardPage />;
};
