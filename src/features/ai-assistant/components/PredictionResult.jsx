import { Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Renders the result from the /babies/:id/prediction endpoint */
export default function PredictionResult({ prediction }) {
  const { t } = useTranslation();
  const isBedtime = prediction.type === 'BEDTIME';

  // Use AI-suggested time if available, otherwise algo time
  const displayTime = prediction.aiEnhancement?.suggestedTime ?? prediction.time;

  // Human-readable explanation: prefer AI reasoning, fall back to structured reasons
  const explanation = prediction.aiEnhancement?.reasoning
    ?? prediction.reasons.map((r) => t(`sleepAssistant.reasons.${r.key}`, r.params ?? {})).join(' ');

  return (
    <div className="flex flex-col gap-2 bg-blue-grey-50 dark:bg-navy-700 rounded-xl p-3">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isBedtime ? 'bg-twilight-indigo-100 dark:bg-twilight-indigo-900/30' : 'bg-light-apricot-100 dark:bg-light-apricot-900/20'}`}>
          <Moon size={16} className={isBedtime ? 'text-twilight-indigo-600' : 'text-light-apricot-600 dark:text-light-apricot-400'} />
        </div>
        <div>
          <p className="text-xs text-blue-grey-600 dark:text-navy-200">{t(`sleepAssistant.types.${prediction.type}`)}</p>
          <p className="text-lg font-semibold text-blue-grey-900 dark:text-navy-50">{formatTime(displayTime)}</p>
        </div>
      </div>
      <p className="text-xs text-blue-grey-600 dark:text-navy-200">{t('sleepAssistant.norm', { label: prediction.normLabel })}</p>
      {explanation && (
        <p className="text-xs text-blue-grey-600 dark:text-navy-200 leading-relaxed border-t border-blue-grey-100 dark:border-navy-600 pt-2">
          {explanation}
        </p>
      )}
      {prediction.aiEnhancement && (
        <p className="text-xs text-blue-grey-600 dark:text-navy-200 text-right">{prediction.aiEnhancement.model}</p>
      )}
    </div>
  );
}
