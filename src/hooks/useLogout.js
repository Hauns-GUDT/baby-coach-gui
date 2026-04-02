import { useNavigate } from 'react-router-dom';
import { logout } from '../api/authService';
import { useAuthStore } from '../store/useAuthStore';

export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Proceed with logout regardless of API error
    }
    clearAuth();
    navigate('/login', { replace: true });
  };

  return { handleLogout };
}
