import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useLogout } from '../../auth/hooks/useLogout';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('de') ? 'en' : 'de');
  };
  const username = useAuthStore((state) => state.username);
  const { handleLogout } = useLogout();

  return (
    <main className="p-4 flex flex-col gap-3 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-blue-grey-100 divide-y divide-blue-grey-100">

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-blue-grey-400">{t('profile.loggedInAs')}</span>
          <span className="text-sm font-semibold text-blue-grey-800">{username}</span>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-blue-grey-700">{t('profile.language')}</span>
          <button
            onClick={toggleLanguage}
            className="text-xs font-semibold bg-blue-grey-100 hover:bg-blue-grey-200 px-3 py-1 rounded-full cursor-pointer transition-colors"
          >
            {i18n.language.startsWith('de') ? 'EN' : 'DE'}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer rounded-b-2xl"
        >
          <LogOut size={15} strokeWidth={2} />
          {t('profile.logout')}
        </button>

      </div>
    </main>
  );
}
