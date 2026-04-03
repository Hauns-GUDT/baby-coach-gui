import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useBabyStore = create(
  persist(
    (set) => ({
      babies: [],
      selectedBabyId: null,
      isLoading: false,
      hasFetched: false,
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
      setHasFetched: (hasFetched) => set({ hasFetched }),
      setError: (error) => set({ error }),
      clearBabies: () => set({ babies: [], selectedBabyId: null, hasFetched: false }),
    }),
    {
      name: 'baby-selection',
      partialize: (state) => ({ selectedBabyId: state.selectedBabyId }),
    }
  )
);
