import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navigation() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('de') ? 'en' : 'de');
  };

  const navLinkClass = ({ isActive }) =>
    `font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 h-16.25 flex items-center justify-between">
      <span className="text-lg font-bold text-indigo-600">Baby Coach</span>

      <div className="flex items-center gap-6">
        <NavLink to="/" end className={navLinkClass}>
          {t('nav.dashboard')}
        </NavLink>
        <NavLink to="/chatbot" className={navLinkClass}>
          {t('nav.chatbot')}
        </NavLink>
        <NavLink to="/tracking" className={navLinkClass}>
          {t('nav.tracking')}
        </NavLink>
        <button
          onClick={toggleLanguage}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full font-medium cursor-pointer transition-colors"
        >
          {i18n.language.startsWith('de') ? 'EN' : 'DE'}
        </button>
      </div>
    </nav>
  );
}
