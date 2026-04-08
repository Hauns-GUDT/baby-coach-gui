import { BotMessageSquare, X, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SCREEN_HOME } from './constants';

export default function AiDrawerHeader({ screen, backLabel, onBack, onClose }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0 bg-linear-to-b from-twilight-indigo-700 to-twilight-indigo-600 rounded-t-2xl">
      <div className="flex items-center gap-2 min-w-0">
        {screen === SCREEN_HOME ? (
          <>
            <BotMessageSquare size={15} className="text-twilight-indigo-200 shrink-0" />
            <span className="text-sm font-semibold text-white">{t('aiAssistant.title')}</span>
          </>
        ) : (
          <button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-white">
            <ChevronLeft size={16} />
            {backLabel}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onClose}
          aria-label={t('aiAssistant.close')}
          className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
