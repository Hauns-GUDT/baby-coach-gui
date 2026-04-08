import { Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PredictionResult from './PredictionResult';

export default function AiAnswerScreen({
  answerMode,
  messages,
  prediction,
  isSleepLoading,
  isChatLoading,
  isHistoryLoading,
  errorKey,
  chatError,
  activeTopic,
  messagesEndRef,
  isAnswerLoading,
  answerError,
  onMoreQuestions,
  onGoHome,
}) {
  const { t } = useTranslation();
  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-3">
      {isHistoryLoading && (
        <div className="flex items-center gap-2 text-xs text-blue-grey-400 px-1">
          <span className="w-3.5 h-3.5 border-2 border-twilight-indigo-200 border-t-twilight-indigo-500 rounded-full animate-spin shrink-0" />
          {t('aiAssistant.loading')}
        </div>
      )}

      {answerMode === 'prediction' && (
        <div>
          {isSleepLoading && (
            <div className="flex items-center gap-2 text-xs text-blue-grey-400 px-1">
              <span className="w-3.5 h-3.5 border-2 border-twilight-indigo-200 border-t-twilight-indigo-500 rounded-full animate-spin shrink-0" />
              {t('sleepAssistant.loading')}
            </div>
          )}
          {prediction && <PredictionResult prediction={prediction} />}
          {errorKey && <p className="text-xs text-rose-500">{t(errorKey)}</p>}
        </div>
      )}

      {answerMode === 'chat' && messages.map((msg) =>
        msg.role === 'user' ? (
          <div key={msg.id} className="flex justify-end">
            <div className="max-w-[80%] px-4 py-2.5 bg-twilight-indigo-100 rounded-2xl rounded-tr-sm text-xs font-semibold text-twilight-indigo-700 leading-snug">
              {msg.content}
            </div>
          </div>
        ) : (
          <div key={msg.id} className="flex gap-2 items-start">
            <div className="w-7 h-7 rounded-full bg-twilight-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={14} className="text-white" />
            </div>
            <div className="flex-1 bg-blue-grey-50 border border-blue-grey-100 rounded-sm rounded-r-2xl rounded-bl-2xl px-4 py-3">
              <p className="text-xs text-blue-grey-700 leading-relaxed">{msg.content}</p>
            </div>
          </div>
        )
      )}

      {answerMode === 'chat' && isChatLoading && (
        <div className="flex gap-2 items-start">
          <div className="w-7 h-7 rounded-full bg-twilight-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
            <Bot size={14} className="text-white" />
          </div>
          <div className="flex-1 bg-blue-grey-50 border border-blue-grey-100 rounded-sm rounded-r-2xl rounded-bl-2xl px-4 py-3 min-h-10">
            <div className="flex items-center gap-2 text-xs text-blue-grey-400">
              <span className="w-3.5 h-3.5 border-2 border-twilight-indigo-200 border-t-twilight-indigo-500 rounded-full animate-spin" />
              {t('aiAssistant.loading')}
            </div>
          </div>
        </div>
      )}

      {chatError && <p className="text-xs text-rose-500 px-1">{chatError}</p>}

      {!isAnswerLoading && (messages.length > 0 || prediction || answerError) && (
        <div className="flex gap-2 flex-wrap">
          {activeTopic && (
            <button
              onClick={onMoreQuestions}
              className="px-3.5 py-2 rounded-full border border-blue-grey-200 bg-white text-xs font-semibold text-blue-grey-700 hover:border-twilight-indigo-400 hover:text-twilight-indigo-600 transition-all"
            >
              {t('aiAssistant.moreQuestions', { topic: t(`aiAssistant.topics.${activeTopic}.label`) })}
            </button>
          )}
          <button
            onClick={onGoHome}
            className="px-3.5 py-2 rounded-full border border-blue-grey-200 bg-white text-xs font-semibold text-blue-grey-700 hover:border-twilight-indigo-400 hover:text-twilight-indigo-600 transition-all"
          >
            {t('aiAssistant.allTopics')}
          </button>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
