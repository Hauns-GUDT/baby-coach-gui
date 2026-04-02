import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { axiosClient } from '../api/axiosClient';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { data } = await axiosClient.post('/auth/login', { login, password });
      let username = null;
      try {
        const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
        username = payload.username ?? null;
      } catch {
        // malformed JWT payload — proceed with null username
      }
      setAuth(data.accessToken, username);
      navigate('/', { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setError(t('auth.error.invalid'));
      } else {
        setError(t('auth.error.generic'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('de') ? 'en' : 'de');
  };

  return (
    <div className="min-h-screen bg-gray-50 grid place-items-center p-6">
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-6 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full font-medium cursor-pointer transition-colors"
      >
        {i18n.language.startsWith('de') ? 'EN' : 'DE'}
      </button>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('auth.title')}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-700 text-sm" htmlFor="login">
              {t('auth.loginLabel')}
            </label>
            <input
              id="login"
              type="text"
              autoComplete="username"
              required
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-700 text-sm" htmlFor="password">
              {t('auth.passwordLabel')}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-colors"
          >
            {isSubmitting ? t('auth.submitting') : t('auth.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
