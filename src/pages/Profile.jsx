import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { useLogout } from '../hooks/useLogout';

export default function Profile() {
  const { t } = useTranslation();
  const username = useAuthStore((state) => state.username);
  const { handleLogout } = useLogout();

  return (
    <main className="min-h-[calc(100vh-65px)] grid place-items-center p-6">
      <section className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>

        <p className="text-gray-600">
          {t('profile.loggedInAs')}{' '}
          <span className="font-semibold text-gray-900">{username}</span>
        </p>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-3 transition-colors"
        >
          {t('profile.logout')}
        </button>
      </section>
    </main>
  );
}
