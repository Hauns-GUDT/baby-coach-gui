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
