import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './shared/components/Navigation';
import ProtectedRoute from './shared/components/ProtectedRoute';
import GuestRoute from './shared/components/GuestRoute';
import { useSilentRefresh } from './features/auth/hooks/useSilentRefresh';
import { useBabyStore } from './features/babies/store/useBabyStore';
import { useAuthStore } from './features/auth/store/useAuthStore';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import LandingPage from './features/landing/pages/LandingPage';
import Dashboard from './features/dashboard/pages/Dashboard';
import History from './features/history/pages/History';
import Profile from './features/profile/pages/Profile';
import BabiesPage from './features/babies/pages/BabiesPage';
import BabyFormPage from './features/babies/pages/BabyFormPage';
import NoBabyPage from './features/babies/pages/NoBabyPage';
import TrackingPage from './features/tracking/pages/TrackingPage';

function NoBabyGuard({ children }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { babies, hasFetched } = useBabyStore();

  const onBabiesRoute = location.pathname.startsWith('/app/profile/babies');

  if (isAuthenticated && hasFetched && babies.length === 0 && !onBabiesRoute) {
    return <NoBabyPage />;
  }

  return children;
}

export default function App() {
  const { isInitializing } = useSilentRefresh();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-zinc-50 grid place-items-center">
        <span className="text-zinc-400 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-50">
        <Navigation />
        <NoBabyGuard>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app/login" element={<GuestRoute><Login /></GuestRoute>} />
            {/* <Route path="/app/register" element={<GuestRoute><Register /></GuestRoute>} /> */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <TrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* {<Route
              path="/app/chatbot"
              element={
                <ProtectedRoute>
                   <ChatBot />
                </ProtectedRoute>
              }
            />} */}
            <Route
              path="/app/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/profile/babies"
              element={
                <ProtectedRoute>
                  <BabiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/profile/babies/new"
              element={
                <ProtectedRoute>
                  <BabyFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/profile/babies/:id/edit"
              element={
                <ProtectedRoute>
                  <BabyFormPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </NoBabyGuard>
      </div>
    </BrowserRouter>
  );
}
