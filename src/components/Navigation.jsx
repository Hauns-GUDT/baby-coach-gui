import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navigation() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (location.pathname === '/login') return null;

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('de') ? 'en' : 'de');
  };

  const navLinkClass = ({ isActive }) =>
    `font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`;

  const links = [
    { to: '/', label: t('nav.dashboard'), end: true },
    { to: '/chatbot', label: t('nav.chatbot') },
    { to: '/tracking', label: t('nav.tracking') },
    { to: '/profile', label: t('nav.profile') },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 relative">
      {/* Top bar */}
      <div className="h-16 flex items-center justify-between">
        <span className="text-lg font-bold text-indigo-600">Baby Coach</span>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClass}>
              {label}
            </NavLink>
          ))}
          <button
            onClick={toggleLanguage}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full font-medium cursor-pointer transition-colors"
          >
            {i18n.language.startsWith('de') ? 'EN' : 'DE'}
          </button>
        </div>

        {/* Mobile: language toggle + burger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleLanguage}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full font-medium cursor-pointer transition-colors"
          >
            {i18n.language.startsWith('de') ? 'EN' : 'DE'}
          </button>
          <button
            onClick={() => setIsOpen((o) => !o)}
            aria-label="Toggle menu"
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
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

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 py-3 flex flex-col gap-1">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg font-medium transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}`
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
