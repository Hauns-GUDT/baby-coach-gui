import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useLogout } from '../../auth/hooks/useLogout';
import Button from '../../../shared/components/Button';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('de') ? 'en' : 'de');
  };
  const username = useAuthStore((state) => state.username);
  const { handleLogout } = useLogout();

  return (
    <main className="min-h-[calc(100vh-65px)] grid place-items-center p-6">
      <section className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
        <p className="text-zinc-600">
          {t('profile.loggedInAs')}{' '}
          <span className="font-semibold text-zinc-900">{username}</span>
        </p>

        <Button onClick={() => navigate('/profile/babies')}>
          {t('profile.manageBabies')}
        </Button>

        <div className="flex items-center justify-between py-1">
          <span className="text-sm font-medium text-zinc-700">{t('profile.language')}</span>
          <button
            onClick={toggleLanguage}
            className="text-sm bg-zinc-100 hover:bg-zinc-200 px-3 py-1 rounded-full font-medium cursor-pointer transition-colors"
          >
            {i18n.language.startsWith('de') ? 'EN' : 'DE'}
          </button>
        </div>

        <Button variant="secondary" onClick={handleLogout}>
          {t('profile.logout')}
        </Button>
      </section>
    </main>
  );
}
