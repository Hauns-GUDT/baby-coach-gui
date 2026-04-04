import { useNavigate } from 'react-router-dom';
import { logout } from '../api/authService';
import { useAuthStore } from '../store/useAuthStore';
import { useBabyStore } from '../../babies/store/useBabyStore';

export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const clearBabies = useBabyStore((state) => state.clearBabies);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Proceed with logout regardless of API error
    }
    clearAuth();
    clearBabies();
    navigate('/app/login', { replace: true });
  };

  return { handleLogout };
}
