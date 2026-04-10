import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, BotMessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useBabyStore } from '../../features/babies/store/useBabyStore';
import { getBabies } from '../../features/babies/api/babyService';
import { useBabyForm } from '../../features/babies/hooks/useBabyForm';
import BabyForm from '../../features/babies/components/BabyForm';
import Button from './design/Button';
import Dialog from './design/Dialog';

function BabyEditDialog({ baby, onClose }) {
  const { t } = useTranslation();
  const { name, setName, birthday, setBirthday, gender, setGender, weightGrams, setWeightGrams, isSubmitting, error, fieldErrors, submit } =
    useBabyForm(baby.id, { onSuccess: onClose });

  return (
    <Dialog isOpen onClose={onClose} title={t('babies.editBaby')}>
      <BabyForm
        name={name} setName={setName}
        birthday={birthday} setBirthday={setBirthday}
        gender={gender} setGender={setGender}
        weightGrams={weightGrams} setWeightGrams={setWeightGrams}
        isSubmitting={isSubmitting}
        error={error}
        fieldErrors={fieldErrors}
        onSubmit={submit}
        onCancel={onClose}
      />
    </Dialog>
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
      className="text-sm font-medium text-twilight-indigo-100 bg-twilight-indigo-800 hover:bg-twilight-indigo-700 dark:text-navy-50 dark:bg-navy-600 dark:hover:bg-navy-400 px-3 py-1 rounded-xl cursor-pointer transition-colors"
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

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-twilight-indigo-800 text-white dark:bg-navy-600 dark:text-navy-50'
        : 'text-twilight-indigo-200 hover:bg-twilight-indigo-800 hover:text-white dark:text-navy-100 dark:hover:bg-navy-600 dark:hover:text-navy-50'
    }`;

  return (
    <nav className="bg-linear-to-b from-twilight-indigo-700 to-twilight-indigo-600 border-b border-white/10 dark:from-navy-800 dark:to-navy-700 dark:border-navy-600 relative z-40">
      {/* Click-outside overlay for mobile dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-30 sm:hidden" onClick={() => setIsOpen(false)} />
      )}

      <div className="relative z-40 max-w-5xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">

          {/* Left: logo + mobile title/burger OR desktop links */}
          <div className="flex items-center gap-3">
            <NavLink to="/app" onClick={() => setIsOpen(false)}>
              <img src="/logo.png" alt="Baby Coach" className="h-10 w-10 rounded-xl ring-1 ring-light-apricot-400" />
            </NavLink>

            {/* Desktop nav links */}
            <div className="hidden sm:flex items-center gap-1">
              {links.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className={navLinkClass}>
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Mobile: page title + burger */}
            <button
              onClick={() => setIsOpen((o) => !o)}
              className="flex sm:hidden items-center gap-1 text-lg font-bold text-white dark:text-navy-50 cursor-pointer select-none"
            >
              {getPageTitle()}
              {isOpen
                ? <ChevronUp size={18} className="text-twilight-indigo-300 dark:text-navy-200" />
                : <ChevronDown size={18} className="text-twilight-indigo-300 dark:text-navy-200" />}
            </button>
          </div>

          {/* Right: baby selector + AI button */}
          <div className="flex items-center gap-3">
            {babySelector}

            {onOpenAi && (
              <Button
                variant="primary"
                onClick={onOpenAi}
                aria-label={t('aiAssistant.title')}
              >
                <BotMessageSquare size={17} />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile dropdown */}
        {isOpen && (
          <div className="sm:hidden border-t border-twilight-indigo-800 dark:border-navy-600 py-3 flex flex-col gap-1">
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-twilight-indigo-700 text-white dark:bg-navy-600 dark:text-navy-50'
                      : 'text-twilight-indigo-200 hover:bg-twilight-indigo-800 hover:text-white dark:text-navy-100 dark:hover:bg-navy-600 dark:hover:text-navy-50'
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
