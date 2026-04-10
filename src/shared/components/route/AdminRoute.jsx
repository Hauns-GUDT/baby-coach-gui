import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';

export default function AdminRoute({ children }) {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }
  return children;
}
