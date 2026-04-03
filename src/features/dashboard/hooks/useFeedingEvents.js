import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBabyStore } from '../../babies/store/useBabyStore';
import { useFeedingEventStore } from '../store/useFeedingEventStore';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../../shared/api/eventService';
import { parseApiError } from '../../../shared/utils/parseApiError';
import { useEventVersion } from '../../events/store/useEventVersion';

export function useFeedingEvents() {
  const { t } = useTranslation();
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const bumpEventVersion = useEventVersion((s) => s.bumpEventVersion);
  const eventVersion = useEventVersion((s) => s.version);
  const {
    feedingEvents,
    isLoading,
    error,
    setFeedingEvents,
    addFeedingEvent,
    updateFeedingEvent,
    removeFeedingEvent,
    setIsLoading,
    setError,
  } = useFeedingEventStore();

  const activeFeeding = feedingEvents.find((e) => !e.endedAt) ?? null;

  const translateError = (err) => {
    const { fieldErrors, code } = parseApiError(err);
    if (code) return t(`validation.${code}`, t('history.feeding.saveFailed'));
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const firstCode = Object.values(fieldErrors)[0];
      return t(`validation.${firstCode}`, t('history.feeding.saveFailed'));
    }
    return t('history.feeding.saveFailed');
  };

  const fetchFeedingEvents = async () => {
    if (!selectedBabyId) return;
    setIsLoading(true);
    setError('');
    try {
      const from = new Date();
      from.setDate(from.getDate() - 14);
      const response = await getEvents(selectedBabyId, {
        type: 'feeding',
        from: from.toISOString(),
      });
      const events = Array.isArray(response) ? response : (response.data ?? []);
      setFeedingEvents([...events].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)));
    } catch (e) {
      setError(t('history.feeding.error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedingEvents();
  }, [selectedBabyId, eventVersion]);

  const startFeeding = async () => {
    if (!selectedBabyId || activeFeeding) return;
    setError('');
    try {
      const event = await createEvent(selectedBabyId, {
        type: 'feeding',
        startedAt: new Date().toISOString(),
      });
      addFeedingEvent(event);
      bumpEventVersion();
    } catch (e) {
      setError(translateError(e));
    }
  };

  const stopFeeding = async () => {
    if (!selectedBabyId || !activeFeeding) return;
    setError('');
    try {
      const updated = await updateEvent(selectedBabyId, activeFeeding.id, {
        endedAt: new Date().toISOString(),
      });
      updateFeedingEvent(activeFeeding.id, updated);
      bumpEventVersion();
    } catch (e) {
      setError(translateError(e));
    }
  };

  const editFeedingEvent = async (eventId, payload) => {
    if (!selectedBabyId) throw new Error('No baby selected');
    const updated = await updateEvent(selectedBabyId, eventId, payload);
    updateFeedingEvent(eventId, updated);
    bumpEventVersion();
  };

  const deleteFeedingEvent = async (eventId) => {
    if (!selectedBabyId) return;
    removeFeedingEvent(eventId);
    try {
      await deleteEvent(selectedBabyId, eventId);
      bumpEventVersion();
    } catch (e) {
      setError(translateError(e));
      fetchFeedingEvents();
    }
  };

  return {
    feedingEvents,
    activeFeeding,
    isLoading,
    error,
    startFeeding,
    stopFeeding,
    editFeedingEvent,
    deleteFeedingEvent,
    refetch: fetchFeedingEvents,
  };
}
