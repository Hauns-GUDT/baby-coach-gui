import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  accessToken: null,
  username: null,
  isAuthenticated: false,
  setAuth: (accessToken, username) =>
    set({ accessToken, username, isAuthenticated: true }),
  clearAuth: () =>
    set({ accessToken: null, username: null, isAuthenticated: false }),
}));
