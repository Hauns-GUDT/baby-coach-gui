import { useState, useEffect } from 'react';
import { useBabyStore } from '../../babies/store/useBabyStore';
import { getAllEvents } from '../../../shared/api/eventService';
import { computePeriodsForDate } from '../../dashboard/components/widgets/shared/eventWidgetHelpers';

export function useHistoryDayEvents(date) {
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const [sleepEvents, setSleepEvents] = useState([]);
  const [feedingEvents, setFeedingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!date || !selectedBabyId) return;

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Fetch from 24h before dayStart so events that began the previous day
    // but overlap into this day (e.g. overnight sleep) are included.
    const fetchFrom = new Date(dayStart);
    fetchFrom.setDate(fetchFrom.getDate() - 1);

    let cancelled = false;
    setIsLoading(true);
    setError('');

    getAllEvents(selectedBabyId, {
      types: ['sleep', 'feeding'],
      from: fetchFrom.toISOString(),
      to: dayEnd.toISOString(),
    })
      .then((res) => {
        if (cancelled) return;
        const events = Array.isArray(res) ? res : (res.data ?? []);
        setSleepEvents(events.filter((e) => e.type === 'sleep'));
        setFeedingEvents(events.filter((e) => e.type === 'feeding'));
      })
      .catch(() => {
        if (!cancelled) setError('loadFailed');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [date?.toDateString(), selectedBabyId]);

  const sleepPeriods = date ? computePeriodsForDate(sleepEvents, date) : [];
  const feedingPeriods = date ? computePeriodsForDate(feedingEvents, date) : [];

  return { sleepPeriods, feedingPeriods, sleepEvents, feedingEvents, isLoading, error };
}
