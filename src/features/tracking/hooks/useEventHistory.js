import { useState, useEffect, useCallback } from 'react';
import { useBabyStore } from '../../babies/store/useBabyStore';
import { getEvents, createEvent, updateEvent, deleteEvent, continueEvent as continueEventApi } from '../../../shared/api/eventService';
import { useEventVersion } from '../../events/store/useEventVersion';

const PAGE_SIZE = 5;

/**
 * Fetches paginated event history for the selected baby.
 * Supports multi-type filtering via selectedTypes (empty = all types).
 *
 * Returns:
 *  events, total, page, totalPages, isLoading, error,
 *  selectedTypes, toggleType(type),
 *  goToPage(n), editEvent(id, payload), removeEvent(id)
 */
export function useEventHistory() {
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const eventVersion = useEventVersion((s) => s.version);
  const bumpEventVersion = useEventVersion((s) => s.bumpEventVersion);
  const [page, setPage] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchPage = useCallback(async (targetPage, types) => {
    if (!selectedBabyId) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await getEvents(selectedBabyId, {
        page: targetPage,
        limit: PAGE_SIZE,
        types: types.length ? types : undefined,
      });
      setEvents(result.data);
      setTotal(result.total);
    } catch {
      setError('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBabyId]);

  // Reset to page 1 when baby or type filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedBabyId, selectedTypes]);

  useEffect(() => {
    fetchPage(page, selectedTypes);
  }, [fetchPage, page, selectedTypes, eventVersion]);

  const goToPage = (n) => {
    const clamped = Math.max(1, Math.min(n, totalPages));
    setPage(clamped);
  };

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Throws on error so the caller (EventFormDialog) can show field-level errors
  const addEvent = async (payload) => {
    await createEvent(selectedBabyId, payload);
    bumpEventVersion();
  };

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

  const continueEvent = async (eventId) => {
    await continueEventApi(selectedBabyId, eventId);
    bumpEventVersion();
  };

  const hasActiveEvent = events.some((e) => !e.endedAt);

  return {
    events,
    total,
    page,
    totalPages,
    isLoading,
    error,
    selectedTypes,
    toggleType,
    goToPage,
    addEvent,
    editEvent,
    removeEvent,
    continueEvent,
    hasActiveEvent,
    refetch: () => fetchPage(page, selectedTypes),
  };
}
