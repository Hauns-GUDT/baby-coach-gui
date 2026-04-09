import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useLogout } from '../../auth/hooks/useLogout';
import { useThemeStore } from '../../../shared/store/useThemeStore';

const THEME_MODES = ['light', 'auto', 'dark'];

export default function Profile() {
  const { t, i18n } = useTranslation();
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('de') ? 'en' : 'de');
  };
  const username = useAuthStore((state) => state.username);
  const { handleLogout } = useLogout();
  const { mode, setMode } = useThemeStore();

  return (
    <main className="p-4 flex flex-col gap-3 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-blue-grey-100 dark:bg-navy-700 dark:border-navy-600 divide-y divide-blue-grey-100 dark:divide-navy-600">

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-blue-grey-400 dark:text-navy-200">{t('profile.loggedInAs')}</span>
          <span className="text-sm font-semibold text-blue-grey-800 dark:text-navy-50">{username}</span>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-blue-grey-700 dark:text-navy-100">{t('profile.language')}</span>
          <button
            onClick={toggleLanguage}
            className="text-xs font-semibold bg-blue-grey-100 hover:bg-blue-grey-200 text-blue-grey-700 dark:bg-navy-500 dark:hover:bg-navy-400 dark:text-navy-100 px-3 py-1 rounded-full cursor-pointer transition-colors"
          >
            {i18n.language.startsWith('de') ? 'EN' : 'DE'}
          </button>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-blue-grey-700 dark:text-navy-100">{t('profile.theme')}</span>
          <div className="flex gap-1 bg-blue-grey-100 dark:bg-navy-600 rounded-full p-1">
            {THEME_MODES.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer transition-colors ${
                  mode === m
                    ? 'bg-white text-blue-grey-800 shadow-sm dark:bg-navy-400 dark:text-navy-50'
                    : 'text-blue-grey-500 hover:text-blue-grey-700 dark:text-navy-200 dark:hover:text-navy-50'
                }`}
              >
                {t(`profile.theme${m.charAt(0).toUpperCase() + m.slice(1)}`)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer rounded-b-2xl"
        >
          <LogOut size={15} strokeWidth={2} />
          {t('profile.logout')}
        </button>

      </div>
    </main>
  );
}
