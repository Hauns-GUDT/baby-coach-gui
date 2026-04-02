import { create } from 'zustand';

export const useSleepEventStore = create((set) => ({
  sleepEvents: [],
  isLoading: false,
  error: '',
  setSleepEvents: (events) => set({ sleepEvents: events }),
  addSleepEvent: (event) => set((s) => ({ sleepEvents: [event, ...s.sleepEvents] })),
  updateSleepEvent: (id, data) =>
    set((s) => ({
      sleepEvents: s.sleepEvents.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),
  removeSleepEvent: (id) =>
    set((s) => ({ sleepEvents: s.sleepEvents.filter((e) => e.id !== id) })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
