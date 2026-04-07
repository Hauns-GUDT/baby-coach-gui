import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../hooks/useLogin';

export default function Login() {
  const { t, i18n } = useTranslation();
  const { submit, error, isSubmitting } = useLogin();
  const location = useLocation();
  const registered = location.state?.registered === true;

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    submit({ login, password });
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('de') ? 'en' : 'de');
  };

  return (
    <div className="min-h-screen bg-blue-grey-50 grid place-items-center p-6">
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-6 text-sm bg-blue-grey-100 hover:bg-blue-grey-200 px-3 py-1 rounded-full font-medium cursor-pointer transition-colors"
      >
        {i18n.language.startsWith('de') ? 'EN' : 'DE'}
      </button>
      <div className="w-full max-w-sm bg-white rounded-2xl border border-blue-grey-100 p-8">
        <h1 className="text-2xl font-bold text-blue-grey-900 mb-6">{t('auth.title')}</h1>

        {registered && (
          <p role="status" className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            {t('auth.registeredSuccess')}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-blue-grey-700 text-sm" htmlFor="login">
              {t('auth.loginLabel')}
            </label>
            <input
              id="login"
              type="text"
              autoComplete="username"
              required
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="border border-blue-grey-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-twilight-indigo-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-blue-grey-700 text-sm" htmlFor="password">
              {t('auth.passwordLabel')}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-blue-grey-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-twilight-indigo-300"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-rose-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 bg-twilight-indigo-600 hover:bg-twilight-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-colors cursor-pointer"
          >
            {isSubmitting ? t('auth.submitting') : t('auth.submit')}
          </button>
        </form>

        {/* <p className="mt-6 text-center text-sm text-blue-grey-500">
          {t('auth.registerPrompt')}{' '}
          <Link to="/app/register" className="text-twilight-indigo-600 font-semibold hover:underline">
            {t('auth.registerLink')}
          </Link>
        </p> */}
      </div>
    </div>
  );
}
