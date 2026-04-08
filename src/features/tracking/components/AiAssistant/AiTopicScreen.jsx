import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AiTopicScreen({ activeTopic, topicData, topicQuestions, onSendQuestion }) {
  const { t } = useTranslation();

  // Always render the wrapper so the sliding layout has 3 equal-width slots
  if (!activeTopic || !topicData) return null;

  const { Icon, iconCls } = topicData;

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-grey-50 shrink-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-grey-800">
            {t(`aiAssistant.topics.${activeTopic}.label`)}
          </p>
          <p className="text-xs text-blue-grey-400">
            {t('aiAssistant.topicSubtitle')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {Array.isArray(topicQuestions) && topicQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSendQuestion(q, q)}
            className="flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl border border-blue-grey-100 bg-white hover:border-twilight-indigo-400 hover:bg-twilight-indigo-50 active:scale-95 transition-all text-left"
          >
            <span className="text-xs text-blue-grey-700 font-medium leading-snug">{q}</span>
            <ChevronLeft size={15} className="text-blue-grey-300 shrink-0 rotate-180" />
          </button>
        ))}
      </div>
    </div>
  );
}
