import { useState, useEffect, useCallback } from 'react';
import { useBabyStore } from '../../babies/store/useBabyStore';
import { getEvents, updateEvent, deleteEvent } from '../../../shared/api/eventService';
import { useEventVersion } from '../../events/store/useEventVersion';

const PAGE_SIZE = 10;

/**
 * Fetches paginated event history (all types) for the selected baby.
 *
 * Returns:
 *  events, total, page, totalPages, isLoading, error,
 *  goToPage(n), editEvent(id, payload), deleteEvent(id)
 */
export function useEventHistory() {
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const eventVersion = useEventVersion((s) => s.version);
  const bumpEventVersion = useEventVersion((s) => s.bumpEventVersion);
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchPage = useCallback(async (targetPage) => {
    if (!selectedBabyId) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await getEvents(selectedBabyId, { page: targetPage, limit: PAGE_SIZE });
      setEvents(result.data);
      setTotal(result.total);
    } catch {
      setError('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBabyId]);

  // Reset to page 1 when baby changes
  useEffect(() => {
    setPage(1);
  }, [selectedBabyId]);

  useEffect(() => {
    fetchPage(page);
  }, [fetchPage, page, eventVersion]);

  const goToPage = (n) => {
    const clamped = Math.max(1, Math.min(n, totalPages));
    setPage(clamped);
  };

  // Throws on error so the caller (EditDialog) can show field-level errors
  const editEvent = async (eventId, payload) => {
    await updateEvent(selectedBabyId, eventId, payload);
    bumpEventVersion();
  };

  const removeEvent = async (eventId) => {
    await deleteEvent(selectedBabyId, eventId);
    // If we deleted the last item on this page, go back one
    const remainingOnPage = events.length - 1;
    const nextPage = remainingOnPage === 0 && page > 1 ? page - 1 : page;
    if (nextPage !== page) {
      setPage(nextPage);
    } else {
      bumpEventVersion();
    }
  };

  return {
    events,
    total,
    page,
    totalPages,
    isLoading,
    error,
    goToPage,
    editEvent,
    removeEvent,
    refetch: () => fetchPage(page),
  };
}
