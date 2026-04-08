import { Moon, Milk, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TOPICS } from './constants';

export default function AiHomeScreen({
  conversations,
  onSleepQuickAction,
  onFeedingQuickAction,
  onGoToTopic,
  onContinueConversation,
  onDeleteConversation,
}) {
  const { t } = useTranslation();
  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-grey-400 mb-2">
          {t('aiAssistant.quickActionsLabel')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSleepQuickAction}
            className="flex flex-col items-start gap-2 p-3.5 rounded-2xl bg-twilight-indigo-50 text-twilight-indigo-600 active:scale-95 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-twilight-indigo-100 flex items-center justify-center"><Moon size={16} /></div>
            <span className="text-xs font-bold leading-snug">{t('aiAssistant.quickActions.sleep.label')}</span>
            <span className="text-xs opacity-70">{t('aiAssistant.quickActions.sleep.sub')}</span>
          </button>
          <button
            onClick={onFeedingQuickAction}
            className="flex flex-col items-start gap-2 p-3.5 rounded-2xl bg-light-apricot-50 text-light-apricot-600 active:scale-95 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-light-apricot-100 flex items-center justify-center"><Milk size={16} /></div>
            <span className="text-xs font-bold leading-snug">{t('aiAssistant.quickActions.feeding.label')}</span>
            <span className="text-xs opacity-70">{t('aiAssistant.quickActions.feeding.sub')}</span>
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-grey-400 mb-2">
          {t('aiAssistant.topicsLabel')}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {TOPICS.map(({ key, Icon, iconCls }) => (
            <button
              key={key}
              onClick={() => onGoToTopic(key)}
              className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl border border-blue-grey-100 bg-white hover:border-blue-grey-300 active:scale-95 transition-all"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconCls}`}>
                <Icon size={16} />
              </div>
              <span className="text-xs font-semibold text-blue-grey-700 text-center leading-tight">
                {t(`aiAssistant.topics.${key}.label`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {conversations.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-grey-400 mb-2">
            {t('aiAssistant.recentChats')}
          </p>
          <div className="flex flex-col gap-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center gap-2 bg-white border border-blue-grey-100 rounded-xl px-3 py-2.5"
              >
                <button
                  className="flex-1 text-left text-xs text-blue-grey-700 font-medium truncate"
                  onClick={() => onContinueConversation(conv.id)}
                >
                  {conv.title || t('aiAssistant.untitledChat')}
                </button>
                <button
                  onClick={() => onDeleteConversation(conv.id)}
                  aria-label={t('aiAssistant.deleteChat')}
                  className="p-1 rounded-lg hover:bg-blue-grey-100 transition-colors shrink-0"
                >
                  <Trash2 size={13} className="text-blue-grey-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
