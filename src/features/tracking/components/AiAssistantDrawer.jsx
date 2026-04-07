import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, X, BotMessageSquare, Send } from 'lucide-react';
import { useSleepPrediction } from '../hooks/useSleepPrediction';
import { askChat } from '../../../shared/api/chatService';

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function PredictionResult({ prediction }) {
  const { t } = useTranslation();
  const isBedtime = prediction.type === 'BEDTIME';
  return (
    <div className="flex flex-col gap-2 bg-blue-grey-50 rounded-xl p-3">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isBedtime ? 'bg-twilight-indigo-100' : 'bg-light-apricot-100'}`}>
          <Moon size={16} className={isBedtime ? 'text-twilight-indigo-600' : 'text-light-apricot-600'} />
        </div>
        <div>
          <p className="text-xs text-blue-grey-400">{t(`sleepAssistant.types.${prediction.type}`)}</p>
          <p className="text-lg font-semibold text-blue-grey-800">{formatTime(prediction.time)}</p>
        </div>
      </div>
      <p className="text-xs text-blue-grey-400">{t('sleepAssistant.norm', { label: prediction.normLabel })}</p>
      <p className="text-xs text-blue-grey-500 leading-relaxed border-t border-blue-grey-100 pt-2">{prediction.reason}</p>
    </div>
  );
}

const CHIPS = [
  { key: 'sleepNormal', prompt: 'Is my baby\'s sleep normal for their age?' },
  { key: 'dreamFeeding', prompt: 'What are dream feeding tips?' },
  { key: 'napLength', prompt: 'How long should my baby\'s naps be?' },
  { key: 'bedtimeRoutine', prompt: 'What is a good bedtime routine for a baby?' },
];

export default function AiAssistantDrawer({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { prediction, isLoading: isSleepLoading, errorKey, fetchPrediction, reset: resetPrediction } = useSleepPrediction();
  const [chatAnswer, setChatAnswer] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [inputValue, setInputValue] = useState('');
  // Which content is active: null | 'sleep' | 'chat'
  const [activeContent, setActiveContent] = useState(null);

  const handleClose = () => {
    resetPrediction();
    setChatAnswer(null);
    setChatError(null);
    setInputValue('');
    setActiveContent(null);
    onClose();
  };

  const handleSleepSuggestion = () => {
    setChatAnswer(null);
    setChatError(null);
    setActiveContent('sleep');
    fetchPrediction();
  };

  const sendPrompt = async (prompt) => {
    setActiveContent('chat');
    setChatAnswer(null);
    setChatError(null);
    resetPrediction();
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

  const handleChip = (prompt) => sendPrompt(prompt);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    sendPrompt(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={handleClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out max-h-[65vh] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-blue-grey-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-blue-grey-100 shrink-0">
          <div className="flex items-center gap-2">
            <BotMessageSquare size={15} className="text-twilight-indigo-500" />
            <span className="text-sm font-semibold text-blue-grey-700">{t('aiAssistant.title')}</span>
          </div>
          <button
            onClick={handleClose}
            aria-label={t('aiAssistant.close')}
            className="text-blue-grey-400 hover:text-blue-grey-600 transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-col gap-3 p-4 overflow-y-auto flex-1">
          {/* Sleep suggestion quick button */}
          <button
            onClick={handleSleepSuggestion}
            disabled={isSleepLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-twilight-indigo-600 text-white text-sm font-medium hover:bg-twilight-indigo-700 active:scale-95 transition-all disabled:opacity-60"
          >
            <Moon size={16} />
            {isSleepLoading ? t('sleepAssistant.loading') : t('aiAssistant.sleepSuggestion')}
          </button>

          {/* Chips */}
          <div>
            <p className="text-xs text-blue-grey-400 mb-2">{t('aiAssistant.quickQuestions')}</p>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CHIPS.map(({ key, prompt }) => (
                <button
                  key={key}
                  onClick={() => handleChip(prompt)}
                  className="shrink-0 px-3 py-1.5 rounded-full bg-blue-grey-100 text-blue-grey-700 text-xs font-medium hover:bg-twilight-indigo-50 hover:text-twilight-indigo-700 active:scale-95 transition-all"
                >
                  {t(`aiAssistant.chips.${key}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Response area */}
          {activeContent === 'sleep' && (
            <div>
              {prediction && <PredictionResult prediction={prediction} />}
              {errorKey && <p className="text-sm text-red-500">{t(errorKey)}</p>}
            </div>
          )}

          {activeContent === 'chat' && (
            <div className="bg-blue-grey-50 rounded-xl p-3 min-h-12">
              {isChatLoading && (
                <div className="flex items-center gap-2 text-sm text-blue-grey-400">
                  <span className="w-3.5 h-3.5 border-2 border-twilight-indigo-400 border-t-transparent rounded-full animate-spin" />
                  {t('aiAssistant.loading')}
                </div>
              )}
              {chatAnswer && <p className="text-sm text-blue-grey-700 leading-relaxed">{chatAnswer}</p>}
              {chatError && <p className="text-sm text-red-500">{chatError}</p>}
            </div>
          )}
        </div>

        {/* Text input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-blue-grey-100 shrink-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('aiAssistant.placeholder')}
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
