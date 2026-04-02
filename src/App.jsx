import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import ChatBot from './pages/ChatBot';
import Dashboard from './pages/Dashboard';
import Tracking from './pages/Tracking';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { axiosClient } from './api/axiosClient';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    axiosClient
      .post('/auth/refresh')
      .then(({ data }) => {
        let username = null;
        try {
          const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
          username = payload.username ?? null;
        } catch {
          // malformed JWT payload — proceed with null username
        }
        setAuth(data.accessToken, username);
      })
      .catch(() => {
        // No valid refresh token — user must log in
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, [setAuth]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 grid place-items-center">
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
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
        </Routes>
      </div>
    </BrowserRouter>
  );
}
