import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';
import { useEventPolling } from '../../../features/events/hooks/useEventPolling';

function AuthenticatedShell({ children }) {
  useEventPolling();
  return children;
}

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/app/login" replace />;
  }
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
