import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './shared/components/Navigation';
import ProtectedRoute from './shared/components/ProtectedRoute';
import { useSilentRefresh } from './features/auth/hooks/useSilentRefresh';
import Login from './features/auth/pages/Login';
import Dashboard from './features/dashboard/pages/Dashboard';
import Tracking from './features/tracking/pages/Tracking';
import ChatBot from './features/chatbot/pages/ChatBot';
import Profile from './features/profile/pages/Profile';
import BabiesPage from './features/babies/pages/BabiesPage';
import BabyFormPage from './features/babies/pages/BabyFormPage';

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
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <ChatBot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking"
            element={
              <ProtectedRoute>
                <Tracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/babies"
            element={
              <ProtectedRoute>
                <BabiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/babies/new"
            element={
              <ProtectedRoute>
                <BabyFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/babies/:id/edit"
            element={
              <ProtectedRoute>
                <BabyFormPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
