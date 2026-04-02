import { useState, useEffect } from 'react';
import { refresh } from '../api/authService';
import { useAuthStore } from '../store/useAuthStore';

export function useSilentRefresh() {
  const [isInitializing, setIsInitializing] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    refresh()
      .then(({ accessToken, username }) => setAuth(accessToken, username))
      .catch(() => {
        // No valid refresh token — user must log in
      })
      .finally(() => setIsInitializing(false));
  }, [setAuth]);

  return { isInitializing };
}
