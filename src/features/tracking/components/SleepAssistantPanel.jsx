import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, X, Sparkles } from 'lucide-react';
import { useSleepPrediction } from '../hooks/useSleepPrediction';

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function PredictionResult({ prediction }) {
  const { t } = useTranslation();
  const isBedtime = prediction.type === 'BEDTIME';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isBedtime ? 'bg-twilight-indigo-100' : 'bg-light-apricot-100'}`}>
          <Moon size={18} className={isBedtime ? 'text-twilight-indigo-600' : 'text-light-apricot-600'} />
        </div>
        <div>
          <p className="text-xs text-blue-grey-400">{t(`sleepAssistant.types.${prediction.type}`)}</p>
          <p className="text-xl font-semibold text-blue-grey-800">{formatTime(prediction.time)}</p>
        </div>
      </div>

      <p className="text-xs text-blue-grey-400">{t('sleepAssistant.norm', { label: prediction.normLabel })}</p>
      <p className="text-xs text-blue-grey-500 leading-relaxed border-t border-blue-grey-100 pt-3">{prediction.reason}</p>
    </div>
  );
}

function ErrorMessage({ errorKey }) {
  const { t } = useTranslation();
  return (
    <p className="text-sm text-rose-500">{t(errorKey)}</p>
  );
}

export default function SleepAssistantPanel() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { prediction, isLoading, errorKey, fetchPrediction, reset } = useSleepPrediction();

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 left-6 w-72 bg-white rounded-2xl border border-blue-grey-100 shadow-xl z-40 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-blue-grey-100">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-twilight-indigo-500" />
              <span className="text-sm font-semibold text-blue-grey-700">{t('sleepAssistant.title')}</span>
            </div>
            <button
              onClick={handleClose}
              aria-label={t('tracking.cancel')}
              className="text-blue-grey-400 hover:text-blue-grey-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-4 min-h-[100px] flex flex-col justify-center">
            {!prediction && !errorKey && !isLoading && (
              <button
                onClick={fetchPrediction}
                className="w-full py-2.5 rounded-xl bg-twilight-indigo-600 text-white text-sm font-medium hover:bg-twilight-indigo-700 active:scale-95 transition-all"
              >
                {t('sleepAssistant.requestButton')}
              </button>
            )}

            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-sm text-blue-grey-400">
                <span className="w-4 h-4 border-2 border-twilight-indigo-400 border-t-transparent rounded-full animate-spin" />
                {t('sleepAssistant.loading')}
              </div>
            )}

            {prediction && <PredictionResult prediction={prediction} />}
            {errorKey && <ErrorMessage errorKey={errorKey} />}

            {(prediction || errorKey) && (
              <button
                onClick={fetchPrediction}
                className="mt-3 text-xs text-twilight-indigo-500 hover:text-twilight-indigo-700 text-center transition-colors"
              >
                {t('sleepAssistant.retry')}
              </button>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={t('sleepAssistant.fab')}
        className={`fixed bottom-6 left-6 w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center active:scale-95 transition-all z-40 ${isOpen ? 'bg-blue-grey-700 hover:bg-blue-grey-800' : 'bg-twilight-indigo-600 hover:bg-twilight-indigo-700'}`}
      >
        {isOpen ? <X size={22} /> : <Moon size={22} />}
      </button>
    </>
  );
}
