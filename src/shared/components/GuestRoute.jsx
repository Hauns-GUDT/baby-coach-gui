import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

export default function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }
  return children;
}
