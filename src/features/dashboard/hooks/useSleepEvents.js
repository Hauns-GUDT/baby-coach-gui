import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBabyStore } from '../../babies/store/useBabyStore';
import { useSleepEventStore } from '../store/useSleepEventStore';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../../shared/api/eventService';
import { parseApiError } from '../../../shared/utils/parseApiError';

export function useSleepEvents() {
  const { t } = useTranslation();
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const {
    sleepEvents,
    isLoading,
    error,
    setSleepEvents,
    addSleepEvent,
    updateSleepEvent,
    removeSleepEvent,
    setIsLoading,
    setError,
  } = useSleepEventStore();

  const activeSleep = sleepEvents.find((e) => !e.endedAt) ?? null;

  const translateError = (err) => {
    const { fieldErrors, code } = parseApiError(err);
    if (code) return t(`validation.${code}`, t('tracking.sleep.saveFailed'));
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      // Collapse field errors into a single message for the banner
      const firstCode = Object.values(fieldErrors)[0];
      return t(`validation.${firstCode}`, t('tracking.sleep.saveFailed'));
    }
    return t('tracking.sleep.saveFailed');
  };

  const fetchSleepEvents = async () => {
    if (!selectedBabyId) return;
    setIsLoading(true);
    setError('');
    try {
      const from = new Date();
      from.setDate(from.getDate() - 14);
      const events = await getEvents(selectedBabyId, {
        type: 'sleep',
        from: from.toISOString(),
      });
      // Sort newest first
      setSleepEvents([...events].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)));
    } catch (e) {
      setError(t('tracking.sleep.error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSleepEvents();
  }, [selectedBabyId]);

  const startSleep = async () => {
    if (!selectedBabyId || activeSleep) return;
    setError('');
    try {
      const event = await createEvent(selectedBabyId, {
        type: 'sleep',
        startedAt: new Date().toISOString(),
      });
      addSleepEvent(event);
    } catch (e) {
      setError(translateError(e));
    }
  };

  const stopSleep = async () => {
    if (!selectedBabyId || !activeSleep) return;
    setError('');
    try {
      const updated = await updateEvent(selectedBabyId, activeSleep.id, {
        endedAt: new Date().toISOString(),
      });
      updateSleepEvent(activeSleep.id, updated);
    } catch (e) {
      setError(translateError(e));
    }
  };

  // Throws a structured error so EditSleepDialog can handle field-level display
  const editSleepEvent = async (eventId, payload) => {
    if (!selectedBabyId) throw new Error('No baby selected');
    const updated = await updateEvent(selectedBabyId, eventId, payload);
    updateSleepEvent(eventId, updated);
  };

  const deleteSleepEvent = async (eventId) => {
    if (!selectedBabyId) return;
    removeSleepEvent(eventId);
    try {
      await deleteEvent(selectedBabyId, eventId);
    } catch (e) {
      setError(translateError(e));
      fetchSleepEvents();
    }
  };

  return {
    sleepEvents,
    activeSleep,
    isLoading,
    error,
    startSleep,
    stopSleep,
    editSleepEvent,
    deleteSleepEvent,
    refetch: fetchSleepEvents,
  };
}
