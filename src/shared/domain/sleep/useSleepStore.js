import { create } from 'zustand';

export const useSleepStore = create((set) => ({
  sleepData: null,
  sleepLoading: false,
  sleepError: '',
  setSleepData: (data) => set({ sleepData: data }),
  setSleepLoading: (loading) => set({ sleepLoading: loading }),
  setSleepError: (error) => set({ sleepError: error }),
}));
