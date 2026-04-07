import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, BotMessageSquare, Send, ChevronLeft, Moon, Milk, Baby, CalendarDays, Heart, Bot, Droplets } from 'lucide-react';
import { askChat } from '../../../shared/api/chatService';
import { useSleepPrediction } from '../hooks/useSleepPrediction';

const TOPICS = [
  { key: 'sleep',       Icon: Moon,         iconCls: 'bg-twilight-indigo-100 text-twilight-indigo-600' },
  { key: 'feeding',     Icon: Milk,         iconCls: 'bg-light-apricot-100 text-light-apricot-600' },
  { key: 'diapers',     Icon: Droplets,     iconCls: 'bg-warm-brown-100 text-warm-brown-500' },
  { key: 'development', Icon: Baby,         iconCls: 'bg-emerald-100 text-emerald-600' },
  { key: 'routines',    Icon: CalendarDays, iconCls: 'bg-blue-grey-100 text-blue-grey-600' },
  { key: 'health',      Icon: Heart,        iconCls: 'bg-rose-100 text-rose-500' },
];

const SCREEN_HOME   = 0;
const SCREEN_TOPIC  = 1;
const SCREEN_ANSWER = 2;

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Renders the result from the /babies/:id/prediction endpoint */
function PredictionResult({ prediction }) {
  const { t } = useTranslation();
  const isBedtime = prediction.type === 'BEDTIME';

  // Use AI-suggested time if available, otherwise algo time
  const displayTime = prediction.aiEnhancement?.suggestedTime ?? prediction.time;

  // Human-readable explanation: prefer AI reasoning, fall back to structured reasons
  const explanation = prediction.aiEnhancement?.reasoning
    ?? prediction.reasons.map((r) => t(`sleepAssistant.reasons.${r.key}`, r.params ?? {})).join(' ');

  return (
    <div className="flex flex-col gap-2 bg-blue-grey-50 rounded-xl p-3">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isBedtime ? 'bg-twilight-indigo-100' : 'bg-light-apricot-100'}`}>
          <Moon size={16} className={isBedtime ? 'text-twilight-indigo-600' : 'text-light-apricot-600'} />
        </div>
        <div>
          <p className="text-xs text-blue-grey-400">{t(`sleepAssistant.types.${prediction.type}`)}</p>
          <p className="text-lg font-semibold text-blue-grey-800">{formatTime(displayTime)}</p>
        </div>
      </div>
      <p className="text-xs text-blue-grey-400">{t('sleepAssistant.norm', { label: prediction.normLabel })}</p>
      {explanation && (
        <p className="text-xs text-blue-grey-500 leading-relaxed border-t border-blue-grey-100 pt-2">
          {explanation}
        </p>
      )}
      {prediction.aiEnhancement && (
        <p className="text-xs text-blue-grey-300 text-right">{prediction.aiEnhancement.model}</p>
      )}
    </div>
  );
}

export default function AiAssistantDrawer({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { prediction, isLoading: isSleepLoading, errorKey, fetchPrediction, reset: resetPrediction } = useSleepPrediction();

  const [screen, setScreen]                 = useState(SCREEN_HOME);
  const [activeTopic, setActiveTopic]       = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [chatAnswer, setChatAnswer]         = useState(null);
  const [isChatLoading, setIsChatLoading]   = useState(false);
  const [chatError, setChatError]           = useState(null);
  const [inputValue, setInputValue]         = useState('');
  // 'chat' | 'prediction' — which kind of result is on screen 2
  const [answerMode, setAnswerMode]         = useState('chat');

  const resetAnswer = () => {
    setChatAnswer(null);
    setChatError(null);
    setActiveQuestion(null);
    resetPrediction();
  };

  const handleClose = () => {
    resetAnswer();
    setInputValue('');
    setScreen(SCREEN_HOME);
    setActiveTopic(null);
    onClose();
  };

  const goHome = () => {
    resetAnswer();
    setActiveTopic(null);
    setScreen(SCREEN_HOME);
  };

  const goToTopic = (key) => {
    resetAnswer();
    setActiveTopic(key);
    setScreen(SCREEN_TOPIC);
  };

  // Used for topic questions and free-text input
  const sendChatPrompt = async (prompt, displayQuestion) => {
    resetAnswer();
    setAnswerMode('chat');
    setActiveQuestion(displayQuestion || prompt);
    setScreen(SCREEN_ANSWER);
    setIsChatLoading(true);
    try {
      const answer = await askChat(prompt);
      setChatAnswer(answer);
    } catch {
      setChatError(t('chatbot.error.generic'));
    } finally {
      setIsChatLoading(false);
    }
  };

  // Sleep quick action — uses the full algorithm + optional AI pipeline
  const handleSleepQuickAction = () => {
    resetAnswer();
    setAnswerMode('prediction');
    setActiveQuestion(t('aiAssistant.quickActions.sleep.question'));
    setActiveTopic(null); // not coming from a topic
    setScreen(SCREEN_ANSWER);
    fetchPrediction();
  };

  // Feeding quick action — uses chat (no dedicated algorithm yet)
  const handleFeedingQuickAction = () => {
    sendChatPrompt(
      t('aiAssistant.quickActions.feeding.prompt'),
      t('aiAssistant.quickActions.feeding.question'),
    );
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    sendChatPrompt(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBack = () => {
    if (screen === SCREEN_TOPIC) { goHome(); return; }
    if (screen === SCREEN_ANSWER) {
      resetAnswer();
      setScreen(activeTopic ? SCREEN_TOPIC : SCREEN_HOME);
    }
  };

  const backLabel = screen === SCREEN_ANSWER && activeTopic
    ? t(`aiAssistant.topics.${activeTopic}.label`)
    : t('aiAssistant.back');

  const placeholder = screen === SCREEN_ANSWER
    ? t('aiAssistant.placeholderFollowUp')
    : screen === SCREEN_TOPIC && activeTopic
      ? t('aiAssistant.placeholderTopic', { topic: t(`aiAssistant.topics.${activeTopic}.label`).toLowerCase() })
      : t('aiAssistant.placeholder');

  const topicQuestions = activeTopic
    ? t(`aiAssistant.topics.${activeTopic}.questions`, { returnObjects: true })
    : [];

  const activeTopic_ = TOPICS.find((tp) => tp.key === activeTopic);
  const ActiveTopicIcon = activeTopic_?.Icon;
  const activeTopicIconCls = activeTopic_?.iconCls ?? 'bg-twilight-indigo-100 text-twilight-indigo-600';

  const isAnswerLoading = answerMode === 'prediction' ? isSleepLoading : isChatLoading;
  const answerError     = answerMode === 'prediction' && errorKey ? t(errorKey) : chatError;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={handleClose} />
      )}

      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out max-h-[72vh] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-blue-grey-100 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {screen === SCREEN_HOME ? (
              <>
                <BotMessageSquare size={15} className="text-twilight-indigo-500 shrink-0" />
                <span className="text-sm font-semibold text-blue-grey-700">{t('aiAssistant.title')}</span>
              </>
            ) : (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm font-semibold text-twilight-indigo-600"
              >
                <ChevronLeft size={16} />
                {backLabel}
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            aria-label={t('aiAssistant.close')}
            className="w-7 h-7 rounded-full bg-blue-grey-50 flex items-center justify-center text-blue-grey-400 hover:text-blue-grey-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Sliding viewport */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${screen * 100}%)` }}
          >
            {/* ── Screen 0: Home ── */}
            <div className="w-full shrink-0 h-full overflow-y-auto p-4 flex flex-col gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-grey-400 mb-2">
                  {t('aiAssistant.quickActionsLabel')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSleepQuickAction}
                    className="flex flex-col items-start gap-2 p-3.5 rounded-2xl bg-twilight-indigo-50 text-twilight-indigo-600 active:scale-95 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-twilight-indigo-100 flex items-center justify-center"><Moon size={16} /></div>
                    <span className="text-xs font-bold leading-snug">{t('aiAssistant.quickActions.sleep.label')}</span>
                    <span className="text-xs opacity-70">{t('aiAssistant.quickActions.sleep.sub')}</span>
                  </button>
                  <button
                    onClick={handleFeedingQuickAction}
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
                      onClick={() => goToTopic(key)}
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
            </div>

            {/* ── Screen 1: Topic questions ── */}
            <div className="w-full shrink-0 h-full overflow-y-auto p-4 flex flex-col gap-3">
              {activeTopic && (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-grey-50 shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeTopicIconCls}`}>
                      {ActiveTopicIcon && <ActiveTopicIcon size={20} />}
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
                        onClick={() => sendChatPrompt(q, q)}
                        className="flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl border border-blue-grey-100 bg-white hover:border-twilight-indigo-400 hover:bg-twilight-indigo-50 active:scale-95 transition-all text-left"
                      >
                        <span className="text-xs text-blue-grey-700 font-medium leading-snug">{q}</span>
                        <ChevronLeft size={15} className="text-blue-grey-300 shrink-0 rotate-180" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ── Screen 2: Answer ── */}
            <div className="w-full shrink-0 h-full overflow-y-auto p-4 flex flex-col gap-3">
              {activeQuestion && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] px-4 py-2.5 bg-twilight-indigo-100 rounded-2xl rounded-tr-sm text-xs font-semibold text-twilight-indigo-700 leading-snug">
                    {activeQuestion}
                  </div>
                </div>
              )}

              {/* Prediction result (sleep quick action) */}
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

              {/* Chat answer (topic questions + feeding + free-text) */}
              {answerMode === 'chat' && (
                <div className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full bg-twilight-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="flex-1 bg-blue-grey-50 border border-blue-grey-100 rounded-sm rounded-r-2xl rounded-bl-2xl px-4 py-3 min-h-10">
                    {isChatLoading && (
                      <div className="flex items-center gap-2 text-xs text-blue-grey-400">
                        <span className="w-3.5 h-3.5 border-2 border-twilight-indigo-200 border-t-twilight-indigo-500 rounded-full animate-spin" />
                        {t('aiAssistant.loading')}
                      </div>
                    )}
                    {chatAnswer && <p className="text-xs text-blue-grey-700 leading-relaxed">{chatAnswer}</p>}
                    {chatError && <p className="text-xs text-rose-500">{chatError}</p>}
                  </div>
                </div>
              )}

              {/* Follow-up pills */}
              {!isAnswerLoading && (chatAnswer || prediction || answerError) && (
                <div className="flex gap-2 flex-wrap">
                  {activeTopic && (
                    <button
                      onClick={() => { resetAnswer(); setScreen(SCREEN_TOPIC); }}
                      className="px-3.5 py-2 rounded-full border border-blue-grey-200 bg-white text-xs font-semibold text-blue-grey-700 hover:border-twilight-indigo-400 hover:text-twilight-indigo-600 transition-all"
                    >
                      {t('aiAssistant.moreQuestions', { topic: t(`aiAssistant.topics.${activeTopic}.label`) })}
                    </button>
                  )}
                  <button
                    onClick={goHome}
                    className="px-3.5 py-2 rounded-full border border-blue-grey-200 bg-white text-xs font-semibold text-blue-grey-700 hover:border-twilight-indigo-400 hover:text-twilight-indigo-600 transition-all"
                  >
                    {t('aiAssistant.allTopics')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-blue-grey-100 shrink-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 text-sm bg-blue-grey-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-twilight-indigo-300 placeholder:text-blue-grey-400"
          />
          <button
            onClick={handleSend}
            aria-label={t('aiAssistant.send')}
            disabled={!inputValue.trim() || isChatLoading}
            className="w-9 h-9 rounded-full bg-twilight-indigo-600 text-white flex items-center justify-center hover:bg-twilight-indigo-700 active:scale-95 transition-all disabled:opacity-40"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
