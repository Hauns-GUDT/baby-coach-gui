import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, LayoutDashboard, Moon, User } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useBabyStore } from '../../features/babies/store/useBabyStore';

export default function BottomNav({ onOpenAi }) {
  const { t } = useTranslation();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { babies, hasFetched } = useBabyStore();

  // Same visibility rules as Navigation
  if (['/app/login', '/app/register'].includes(location.pathname)) return null;
  if (!location.pathname.startsWith('/app')) return null;
  if (!isAuthenticated) return null;
  if (hasFetched && babies.length === 0) return null;

  const linkClass = ({ isActive }) =>
    `flex flex-col items-center gap-0.5 text-xs font-medium transition-colors min-w-[56px] py-1 ${isActive ? 'text-indigo-600' : 'text-zinc-400'}`;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-zinc-200">
      <div className="flex items-end justify-around px-4 pt-2 pb-3 max-w-md mx-auto">
        <NavLink to="/app" end className={linkClass}>
          <Home size={22} />
          <span>{t('nav.tracking')}</span>
        </NavLink>

        <NavLink to="/app/dashboard" className={linkClass}>
          <LayoutDashboard size={22} />
          <span>{t('nav.dashboard')}</span>
        </NavLink>

        {/* Center AI moon — elevated above the bar */}
        <button
          onClick={onOpenAi}
          aria-label={t('aiAssistant.title')}
          className="flex flex-col items-center gap-1 text-xs font-medium text-indigo-600 -translate-y-3"
        >
          <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Moon size={24} />
          </div>
          <span>{t('aiAssistant.title')}</span>
        </button>

        <NavLink to="/app/profile" className={linkClass}>
          <User size={22} />
          <span>{t('nav.profile')}</span>
        </NavLink>
      </div>
    </nav>
  );
}
