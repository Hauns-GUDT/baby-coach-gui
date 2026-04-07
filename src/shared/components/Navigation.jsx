import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useBabyStore } from '../../features/babies/store/useBabyStore';
import { getBabies } from '../../features/babies/api/babyService';
import { useBabyForm } from '../../features/babies/hooks/useBabyForm';
import BabyForm from '../../features/babies/components/BabyForm';

function BabyEditDialog({ baby, onClose }) {
  const { t } = useTranslation();
  const { name, setName, birthday, setBirthday, gender, setGender, isSubmitting, error, fieldErrors, submit } =
    useBabyForm(baby.id, { onSuccess: onClose });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-blue-grey-900">{t('babies.editBaby')}</h2>
        <BabyForm
          name={name} setName={setName}
          birthday={birthday} setBirthday={setBirthday}
          gender={gender} setGender={setGender}
          isSubmitting={isSubmitting}
          error={error}
          fieldErrors={fieldErrors}
          onSubmit={submit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

export default function Navigation({ onOpenAi }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isBabyDialogOpen, setIsBabyDialogOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const { babies, selectedBabyId, hasFetched, setBabies, setHasFetched } = useBabyStore();

  useEffect(() => {
    if (isAuthenticated && !hasFetched) {
      getBabies()
        .then((data) => { setBabies(data); setHasFetched(true); })
        .catch(() => { setHasFetched(true); });
    }
  }, [isAuthenticated, hasFetched]);

  if (['/app/login', '/app/register'].includes(location.pathname)) return null;
  if (!location.pathname.startsWith('/app')) return null;
  if (hasFetched && babies.length === 0 && !location.pathname.startsWith('/app/admin')) return null;

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/app') return t('nav.tracking');
    if (p === '/app/dashboard') return t('nav.dashboard');
    if (p === '/app/profile/babies/new') return t('babies.addBaby');
    if (p.startsWith('/app/profile/babies/')) return t('babies.editBaby');
    if (p === '/app/profile/babies') return t('babies.title');
    if (p.startsWith('/app/profile')) return t('profile.title');
    if (p.startsWith('/app/admin')) return t('admin.title');
    return '';
  };

  const currentBaby = babies.find((b) => b.id === selectedBabyId) ?? babies[0] ?? null;

  const babySelector = currentBaby && (
    <button
      onClick={() => setIsBabyDialogOpen(true)}
      className="text-sm font-medium text-twilight-indigo-100 bg-twilight-indigo-800 hover:bg-twilight-indigo-700 px-3 py-1 rounded-full cursor-pointer transition-colors"
    >
      {currentBaby.name}
    </button>
  );

  const links = [
    { to: '/app', label: t('nav.tracking'), end: true },
    { to: '/app/dashboard', label: t('nav.dashboard') },
    { to: '/app/profile', label: t('nav.profile') },
    ...(isAdmin ? [{ to: '/app/admin', label: t('nav.admin') }] : []),
  ];

  return (
    <nav className="bg-linear-to-b from-twilight-indigo-700 to-twilight-indigo-600 border-b border-white/10 relative z-40">
      {/* Click-outside overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
      )}

      <div className="relative z-40 max-w-5xl mx-auto px-6">
        {/* Top bar */}
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink to="/app" onClick={() => setIsOpen(false)}>
              <img src="/logo.png" alt="Baby Coach" className="h-10 w-10 rounded-full ring-1 ring-light-apricot-400" />
            </NavLink>
            <button
              onClick={() => setIsOpen((o) => !o)}
              className="flex items-center gap-1 text-lg font-bold text-white cursor-pointer select-none"
            >
              {getPageTitle()}
              {isOpen
                ? <ChevronUp size={18} className="text-twilight-indigo-300" />
                : <ChevronDown size={18} className="text-twilight-indigo-300" />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {babySelector}
            {onOpenAi && (
              <button
                onClick={onOpenAi}
                aria-label={t('aiAssistant.title')}
                className="w-9 h-9 rounded-full bg-light-apricot-400 text-twilight-indigo-900 flex items-center justify-center hover:bg-light-apricot-300 active:scale-95 transition-all"
              >
                <Moon size={17} />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown nav links */}
        {isOpen && (
          <div className="border-t border-twilight-indigo-800 py-3 flex flex-col gap-1">
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-twilight-indigo-700 text-white'
                      : 'text-twilight-indigo-200 hover:bg-twilight-indigo-800 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {isBabyDialogOpen && currentBaby && (
        <BabyEditDialog baby={currentBaby} onClose={() => setIsBabyDialogOpen(false)} />
      )}
    </nav>
  );
}
