import { create } from 'zustand';

export const useBabyStore = create((set) => ({
  babies: [],
  isLoading: false,
  error: '',
  setBabies: (babies) => set({ babies }),
  addBaby: (baby) => set((s) => ({ babies: [...s.babies, baby] })),
  updateBaby: (id, data) =>
    set((s) => ({ babies: s.babies.map((b) => (b.id === id ? { ...b, ...data } : b)) })),
  removeBaby: (id) => set((s) => ({ babies: s.babies.filter((b) => b.id !== id) })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
