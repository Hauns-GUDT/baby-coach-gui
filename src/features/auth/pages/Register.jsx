import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegister } from '../hooks/useRegister';

export default function Register() {
  const { t, i18n } = useTranslation();
  const { submit, error, fieldErrors, isSubmitting } = useRegister();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    submit({ email, username, password });
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
        <h1 className="text-2xl font-bold text-blue-grey-900 mb-6">{t('registration.title')}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-blue-grey-700 text-sm" htmlFor="email">
              {t('registration.emailLabel')} <span className="text-rose-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-blue-grey-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-twilight-indigo-300"
            />
            {fieldErrors?.email && (
              <p role="alert" className="text-sm text-rose-600">{fieldErrors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-blue-grey-700 text-sm" htmlFor="username">
              {t('registration.usernameLabel')} <span className="text-rose-500">*</span>
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-blue-grey-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-twilight-indigo-300"
            />
            {fieldErrors?.username && (
              <p role="alert" className="text-sm text-rose-600">{fieldErrors.username}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-blue-grey-700 text-sm" htmlFor="password">
              {t('registration.passwordLabel')} <span className="text-rose-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-blue-grey-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-twilight-indigo-300"
            />
            {fieldErrors?.password && (
              <p role="alert" className="text-sm text-rose-600">{fieldErrors.password}</p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-rose-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 bg-twilight-indigo-600 hover:bg-twilight-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-colors cursor-pointer"
          >
            {isSubmitting ? t('registration.submitting') : t('registration.submit')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-blue-grey-500">
          {t('registration.signInPrompt')}{' '}
          <Link to="/app/login" className="text-twilight-indigo-600 font-semibold hover:underline">
            {t('registration.signInLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
