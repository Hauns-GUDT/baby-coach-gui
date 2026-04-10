import { useState } from 'react';
import { useBabyStore } from '../../babies/store/useBabyStore';
import { getPrediction } from '../api/sleepService';

// Maps backend error codes to i18n keys
const ERROR_CODE_MAP = {
  BABY_CURRENTLY_SLEEPING: 'sleepAssistant.errors.currentlySleeping',
  INVALID_SLEEP_DURATION:  'sleepAssistant.errors.invalidDuration',
  NO_SLEEP_EVENTS:         'sleepAssistant.errors.noEvents',
};

export function useSleepPrediction() {
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState(null); // i18n key

  const fetchPrediction = async () => {
    if (!selectedBabyId) return;
    setIsLoading(true);
    setPrediction(null);
    setErrorKey(null);
    try {
      const result = await getPrediction(selectedBabyId);
      setPrediction(result);
    } catch (err) {
      // NestJS wraps the object in message: { code: '...' }
      const code = err?.response?.data?.message?.code ?? err?.response?.data?.code;
      setErrorKey(ERROR_CODE_MAP[code] ?? 'sleepAssistant.errors.generic');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setPrediction(null);
    setErrorKey(null);
  };

  return { prediction, isLoading, errorKey, fetchPrediction, reset };
}
