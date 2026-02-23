import { create } from 'zustand';

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
}

export const useJournalStore = create<JournalState>((set) => ({
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
}));
