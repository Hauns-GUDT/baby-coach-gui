import { Moon, Milk } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TABS = [
  {
    id: 'sleep',
    icon: Moon,
    i18nKey: 'history.sleep.title',
    activeClass: 'bg-indigo-600 text-white shadow-indigo-200',
    iconClass: 'text-white',
  },
  {
    id: 'feeding',
    icon: Milk,
    i18nKey: 'history.feeding.title',
    activeClass: 'bg-orange-500 text-white shadow-orange-200',
    iconClass: 'text-white',
  },
];

export default function EventTypeTabs({ activeTab, onTabChange }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3">
      {TABS.map(({ id, icon: Icon, i18nKey, activeClass, iconClass }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`
              flex flex-col items-center justify-center gap-2 rounded-2xl py-7 px-4
              font-semibold text-base transition-all duration-200 cursor-pointer
              shadow-md
              ${isActive
                ? `${activeClass} shadow-lg scale-[1.02]`
                : 'bg-white text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}
            `}
          >
            <Icon
              size={32}
              strokeWidth={1.8}
              className={isActive ? iconClass : 'text-zinc-300'}
            />
            {t(i18nKey)}
          </button>
        );
      })}
    </div>
  );
}
