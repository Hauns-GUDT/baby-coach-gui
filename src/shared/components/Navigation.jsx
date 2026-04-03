import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useBabyStore } from '../../features/babies/store/useBabyStore';
import { getBabies } from '../../features/babies/api/babyService';

export default function Navigation() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isBabyDialogOpen, setIsBabyDialogOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { babies, selectedBabyId, hasFetched, setBabies, setSelectedBaby, setHasFetched } = useBabyStore();

  useEffect(() => {
    if (isAuthenticated && !hasFetched) {
      getBabies()
        .then((data) => { setBabies(data); setHasFetched(true); })
        .catch(() => { setHasFetched(true); });
    }
  }, [isAuthenticated, hasFetched]);

  if (['/login', '/register'].includes(location.pathname)) return null;
  if (hasFetched && babies.length === 0) return null;

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('de') ? 'en' : 'de');
  };

  const navLinkClass = ({ isActive }) =>
    `font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-zinc-600 hover:text-zinc-900'}`;

  const selectedBaby = babies.find((b) => b.id === selectedBabyId);

  const babySelector = babies.length > 0 && (
    <button
      onClick={() => setIsBabyDialogOpen(true)}
      className="text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3 py-1 rounded-full cursor-pointer transition-colors"
    >
      {selectedBaby?.name ?? '—'}
    </button>
  );

  const links = [
    { to: '/', label: t('nav.tracking'), end: true },
    { to: '/dashboard', label: t('nav.dashboard') },
    // { to: '/chatbot', label: t('nav.chatbot') },
    { to: '/history', label: t('nav.history') },
    { to: '/profile', label: t('nav.profile') },
  ];

  return (
    <nav className="bg-white border-b border-zinc-200 px-6 relative">
      {/* Top bar */}
      <div className="h-16 flex items-center justify-between">
        <NavLink className="text-lg font-bold text-indigo-600" to="/">Baby Coach</NavLink>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClass}>
              {label}
            </NavLink>
          ))}
          {babySelector}
          <button
            onClick={toggleLanguage}
            className="text-sm bg-zinc-100 hover:bg-zinc-200 px-3 py-1 rounded-full font-medium cursor-pointer transition-colors"
          >
            {i18n.language.startsWith('de') ? 'EN' : 'DE'}
          </button>
        </div>

        {/* Mobile: baby selector + language toggle + burger */}
        <div className="flex items-center gap-3 md:hidden">
          {babySelector}
          <button
            onClick={toggleLanguage}
            className="text-sm bg-zinc-100 hover:bg-zinc-200 px-3 py-1 rounded-full font-medium cursor-pointer transition-colors"
          >
            {i18n.language.startsWith('de') ? 'EN' : 'DE'}
          </button>
          <button
            onClick={() => setIsOpen((o) => !o)}
            aria-label="Toggle menu"
            className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Baby selection dialog */}
      {isBabyDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsBabyDialogOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-3">
            <h2 className="text-lg font-bold text-zinc-900">Select Baby</h2>
            <div className="flex flex-col gap-1">
              {babies.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setSelectedBaby(b.id); setIsBabyDialogOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    b.id === selectedBabyId
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-100 py-3 flex flex-col gap-1">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg font-medium transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-zinc-600 hover:bg-zinc-50'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
