import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBabyStore } from '../../babies/store/useBabyStore';
import { useDiaperEventStore } from '../store/useDiaperEventStore';
import { getAllEvents } from '../../../shared/api/eventService';
import { useEventVersion } from '../../events/store/useEventVersion';

export function useDiaperEvents() {
  const { t } = useTranslation();
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const eventVersion = useEventVersion((s) => s.version);
  const { diaperEvents, isLoading, error, setDiaperEvents, setIsLoading, setError } =
    useDiaperEventStore();

  const fetchDiaperEvents = async () => {
    if (!selectedBabyId) return;
    setIsLoading(true);
    setError('');
    try {
      const from = new Date();
      from.setDate(from.getDate() - 14);
      const response = await getAllEvents(selectedBabyId, {
        types: ['diaper'],
        from: from.toISOString(),
      });
      const events = Array.isArray(response) ? response : (response.data ?? []);
      setDiaperEvents([...events].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)));
    } catch {
      setError(t('history.diaper.saveFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiaperEvents();
  }, [selectedBabyId, eventVersion]);

  return { diaperEvents, isLoading, error, refetch: fetchDiaperEvents };
}
