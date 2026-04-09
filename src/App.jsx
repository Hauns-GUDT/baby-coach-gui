import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Navigation from './shared/components/Navigation';
import AiAssistantDrawer from './features/ai-assistant/components/AiAssistantDrawer';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminRoute from './shared/components/AdminRoute';
import GuestRoute from './shared/components/GuestRoute';
import { useSilentRefresh } from './features/auth/hooks/useSilentRefresh';
import { useBabyStore } from './features/babies/store/useBabyStore';
import { useAuthStore } from './features/auth/store/useAuthStore';
import Login from './features/auth/pages/Login';
import LandingPage from './features/landing/pages/LandingPage';
import Dashboard from './features/dashboard/pages/Dashboard';
import Profile from './features/profile/pages/Profile';
import BabiesPage from './features/babies/pages/BabiesPage';
import BabyFormPage from './features/babies/pages/BabyFormPage';
import NoBabyPage from './features/babies/pages/NoBabyPage';
import TrackingPage from './features/tracking/pages/TrackingPage';
import AdminPage from './features/admin/pages/AdminPage';

function NoBabyGuard({ children }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { babies, hasFetched } = useBabyStore();

  const onAppRoute = location.pathname.startsWith('/app');
  const onBabiesRoute = location.pathname.startsWith('/app/profile/babies');
  const onAdminRoute = location.pathname.startsWith('/app/admin');

  if (isAuthenticated && hasFetched && babies.length === 0 && onAppRoute && !onBabiesRoute && !onAdminRoute) {
    return <NoBabyPage />;
  }

  return children;
}

export default function App() {
  const { isInitializing } = useSilentRefresh();
  const [isAiOpen, setIsAiOpen] = useState(false);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-blue-grey-50 dark:bg-navy-800 grid place-items-center">
        <span className="text-blue-grey-400 dark:text-navy-200 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-blue-grey-50 dark:bg-navy-800">
        <Navigation onOpenAi={() => setIsAiOpen(true)} />
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
            <Route
              path="/app/admin"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
          </Routes>
        </NoBabyGuard>
        <AiAssistantDrawer isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      </div>
    </BrowserRouter>
  );
}
