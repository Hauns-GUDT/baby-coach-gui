import { create } from 'zustand';

/**
 * Shared invalidation signal.
 * Any hook that mutates events calls bumpEventVersion().
 * useEventHistory watches the version and refetches when it changes.
 */
export const useEventVersion = create((set) => ({
  version: 0,
  bumpEventVersion: () => set((s) => ({ version: s.version + 1 })),
}));
