import { create } from 'zustand';

export const useChatStore = create((set) => ({
  apiUrl: '/api/chat',
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
