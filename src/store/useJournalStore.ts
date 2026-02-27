import { create } from 'zustand';
import { appStorage } from './storage';

export interface JournalEntry {
  id: string;
  text: string;
  timestamp: number;
  sentimentScore: number;
  color: string;
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
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  webAuthnCredentialId: string | null;
  setWebAuthnCredentialId: (id: string | null) => void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  currentRoute: { name: 'Home' },
  hashedPin: null,
  webAuthnCredentialId: null,
  isLocked: true,
  isHydrated: false,

  hydrate: async () => {
    try {
      const dataStr = await appStorage.getItem('journal-storage');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        set({
          entries: data.entries || [],
          hashedPin: data.hashedPin || null,
          webAuthnCredentialId: data.webAuthnCredentialId || null,
          isLocked: true,
          isHydrated: true,
        });
      } else {
        set({ isHydrated: true, isLocked: true });
      }
    } catch (e) {
      set({ isHydrated: true, isLocked: true });
    }
  },

  addEntry: (text, sentimentScore, color) => {
    set((state) => {
      const newEntries = [
        ...state.entries,
        {
          id: Math.random().toString(36).substring(7),
          text,
          timestamp: Date.now(),
          sentimentScore,
          color,
        },
      ];
      appStorage.setItem('journal-storage', JSON.stringify({ entries: newEntries, hashedPin: state.hashedPin, webAuthnCredentialId: state.webAuthnCredentialId }));
      return { entries: newEntries };
    });
  },

  removeEntry: (id) => {
    set((state) => {
      const newEntries = state.entries.filter((entry) => entry.id !== id);
      appStorage.setItem('journal-storage', JSON.stringify({ entries: newEntries, hashedPin: state.hashedPin, webAuthnCredentialId: state.webAuthnCredentialId }));
      return { entries: newEntries };
    });
  },

  navigate: (name, params) => set({ currentRoute: { name, params } }),
  goBack: () => set({ currentRoute: { name: 'Home' } }),

  setHashedPin: (hashedPin) => {
    set((state) => {
      appStorage.setItem('journal-storage', JSON.stringify({ entries: state.entries, hashedPin, webAuthnCredentialId: state.webAuthnCredentialId }));
      return { hashedPin, isLocked: false };
    });
  },
  setWebAuthnCredentialId: (webAuthnCredentialId) => {
    set((state) => {
      appStorage.setItem('journal-storage', JSON.stringify({ entries: state.entries, hashedPin: state.hashedPin, webAuthnCredentialId }));
      return { webAuthnCredentialId };
    });
  },
  unlock: () => set({ isLocked: false }),
  lock: () => set({ isLocked: true }),
}));
