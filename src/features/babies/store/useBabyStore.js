import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useBabyStore = create(
  persist(
    (set) => ({
      babies: [],
      selectedBabyId: null,
      isLoading: false,
      error: '',
      setBabies: (babies) =>
        set((s) => ({
          babies,
          selectedBabyId: s.selectedBabyId ?? (babies.length > 0 ? babies[0].id : null),
        })),
      setSelectedBaby: (id) => set({ selectedBabyId: id }),
      addBaby: (baby) => set((s) => ({ babies: [...s.babies, baby] })),
      updateBaby: (id, data) =>
        set((s) => ({ babies: s.babies.map((b) => (b.id === id ? { ...b, ...data } : b)) })),
      removeBaby: (id) => set((s) => ({ babies: s.babies.filter((b) => b.id !== id) })),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'baby-selection',
      partialize: (state) => ({ selectedBabyId: state.selectedBabyId }),
    }
  )
);
