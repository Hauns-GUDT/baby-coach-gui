import { create } from 'zustand';

export const useDiaperEventStore = create((set) => ({
  diaperEvents: [],
  isLoading: false,
  error: '',
  setDiaperEvents: (events) => set({ diaperEvents: events }),
  addDiaperEvent: (event) => set((s) => ({ diaperEvents: [event, ...s.diaperEvents] })),
  updateDiaperEvent: (id, data) =>
    set((s) => ({
      diaperEvents: s.diaperEvents.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),
  removeDiaperEvent: (id) =>
    set((s) => ({ diaperEvents: s.diaperEvents.filter((e) => e.id !== id) })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
