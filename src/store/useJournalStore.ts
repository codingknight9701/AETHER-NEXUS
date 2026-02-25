import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface JournalEntry {
  id: string;
  text: string;
  timestamp: number;
  sentimentScore: number; // -1 (Negative) to 1 (Positive)
  color: string; // The hex color mapped from the sentiment
}

interface JournalState {
  entries: JournalEntry[];
  addEntry: (text: string, sentimentScore: number, color: string) => void;
  removeEntry: (id: string) => void;
  currentRoute: { name: string; params?: any };
  navigate: (name: string, params?: any) => void;
  goBack: () => void;
  hashedPin: string | null;
  isLocked: boolean;
  setHashedPin: (pin: string) => void;
  unlock: () => void;
  lock: () => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (text, sentimentScore, color) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              id: Math.random().toString(36).substring(7),
              text,
              timestamp: Date.now(),
              sentimentScore,
              color,
            },
          ],
        })),
      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        })),
      currentRoute: { name: 'Home' },
      navigate: (name, params) => set({ currentRoute: { name, params } }),
      goBack: () => set({ currentRoute: { name: 'Home' } }),
      hashedPin: null,
      isLocked: true,
      setHashedPin: (hashedPin) => set({ hashedPin, isLocked: false }),
      unlock: () => set({ isLocked: false }),
      lock: () => set({ isLocked: true }),
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ entries: state.entries, hashedPin: state.hashedPin }), // Persist entries and PIN
    }
  )
);
