import { create } from 'zustand';

interface SettingsStore {
  darkMode: boolean;
  soundEnabled: boolean;
  toggleDarkMode: () => void;
  toggleSound: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  darkMode: true,
  soundEnabled: false,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
}));
