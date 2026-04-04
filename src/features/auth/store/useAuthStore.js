import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  accessToken: null,
  username: null,
  isAdmin: false,
  isAuthenticated: false,
  setAuth: (accessToken, username, isAdmin = false) =>
    set({ accessToken, username, isAdmin, isAuthenticated: true }),
  clearAuth: () =>
    set({ accessToken: null, username: null, isAdmin: false, isAuthenticated: false }),
}));
