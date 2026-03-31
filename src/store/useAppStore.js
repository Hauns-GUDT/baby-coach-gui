import { create } from 'zustand';

export const useChatStore = create((set) => ({
  apiUrl: 'http://localhost:8000/api/chat',
  prompt: '',
  answer: '',
  error: '',
  isLoading: false,
  setApiUrl: (url) => set({ apiUrl: url }),
  setPrompt: (prompt) => set({ prompt }),
  setAnswer: (answer) => set({ answer }),
  setError: (error) => set({ error }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

export const useSleepStore = create((set) => ({
  sleepData: null,
  sleepLoading: false,
  sleepError: '',
  setSleepData: (data) => set({ sleepData: data }),
  setSleepLoading: (loading) => set({ sleepLoading: loading }),
  setSleepError: (error) => set({ sleepError: error }),
}));
