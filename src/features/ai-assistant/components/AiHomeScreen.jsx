import { Moon, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AiHomeScreen({
  conversations,
  onSleepQuickAction,
  onContinueConversation,
  onDeleteConversation,
}) {
  const { t } = useTranslation();
  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-grey-400 dark:text-navy-200 mb-2">
          {t('aiAssistant.quickActionsLabel')}
        </p>
        <button
          onClick={onSleepQuickAction}
          className="w-full flex flex-col items-start gap-2 p-3.5 rounded-2xl bg-twilight-indigo-50 dark:bg-transparent border border-twilight-indigo-200 dark:border-twilight-indigo-700 text-twilight-indigo-600 dark:text-twilight-indigo-300 active:scale-95 transition-all text-left"
        >
          <div className="w-8 h-8 rounded-xl bg-twilight-indigo-100 dark:bg-twilight-indigo-800/50 flex items-center justify-center"><Moon size={16} /></div>
          <span className="text-xs font-bold leading-snug">{t('aiAssistant.quickActions.sleep.label')}</span>
          <span className="text-xs opacity-70">{t('aiAssistant.quickActions.sleep.sub')}</span>
        </button>
      </div>

      {conversations.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-grey-400 dark:text-navy-400 mb-2">
            {t('aiAssistant.recentChats')}
          </p>
          <div className="flex flex-col gap-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center gap-2 bg-white dark:bg-navy-700 border border-blue-grey-100 dark:border-navy-600 rounded-xl px-3 py-2.5"
              >
                <button
                  className="flex-1 text-left text-xs text-blue-grey-700 dark:text-navy-100 font-medium truncate"
                  onClick={() => onContinueConversation(conv.id)}
                >
                  {conv.title || t('aiAssistant.untitledChat')}
                </button>
                <button
                  onClick={() => onDeleteConversation(conv.id)}
                  aria-label={t('aiAssistant.deleteChat')}
                  className="p-1 rounded-lg hover:bg-blue-grey-100 dark:hover:bg-navy-600 transition-colors shrink-0"
                >
                  <Trash2 size={13} className="text-blue-grey-400 dark:text-navy-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
