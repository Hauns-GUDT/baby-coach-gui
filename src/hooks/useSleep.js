import { useEffect } from 'react';
import { useSleepStore } from '../store/useAppStore';
import { getSleepData } from '../api/sleepService';

export function useSleep() {
  const { sleepData, sleepLoading, sleepError, setSleepData, setSleepLoading, setSleepError } =
    useSleepStore();

  const fetchSleep = async () => {
    setSleepLoading(true);
    setSleepError('');
    try {
      setSleepData(await getSleepData());
    } catch (e) {
      setSleepError(e.message);
    } finally {
      setSleepLoading(false);
    }
  };

  useEffect(() => {
    fetchSleep();
  }, []);

  return { sleepData, sleepLoading, sleepError, refetch: fetchSleep };
}
