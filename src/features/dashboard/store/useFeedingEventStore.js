import { create } from 'zustand';

export const useFeedingEventStore = create((set) => ({
  feedingEvents: [],
  isLoading: false,
  error: '',
  setFeedingEvents: (events) => set({ feedingEvents: events }),
  addFeedingEvent: (event) => set((s) => ({ feedingEvents: [event, ...s.feedingEvents] })),
  updateFeedingEvent: (id, data) =>
    set((s) => ({
      feedingEvents: s.feedingEvents.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),
  removeFeedingEvent: (id) =>
    set((s) => ({ feedingEvents: s.feedingEvents.filter((e) => e.id !== id) })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
