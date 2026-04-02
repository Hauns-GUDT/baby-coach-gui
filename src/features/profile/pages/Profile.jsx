import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useLogout } from '../../auth/hooks/useLogout';
import Button from '../../../shared/components/Button';

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const username = useAuthStore((state) => state.username);
  const { handleLogout } = useLogout();

  return (
    <main className="min-h-[calc(100vh-65px)] grid place-items-center p-6">
      <section className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-zinc-900">{t('profile.title')}</h1>

        <p className="text-zinc-600">
          {t('profile.loggedInAs')}{' '}
          <span className="font-semibold text-zinc-900">{username}</span>
        </p>

        <Button onClick={() => navigate('/profile/babies')}>
          {t('profile.manageBabies')}
        </Button>

        <Button variant="secondary" onClick={handleLogout}>
          {t('profile.logout')}
        </Button>
      </section>
    </main>
  );
}
