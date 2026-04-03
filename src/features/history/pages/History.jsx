import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Milk } from 'lucide-react';
import { useSleepEvents } from '../../dashboard/hooks/useSleepEvents';
import { useFeedingEvents } from '../../dashboard/hooks/useFeedingEvents';
import EventCalendar from '../components/calendar/EventCalendar';
import DayTimeline from '../../../shared/components/DayTimeline';
import { computePeriodsForDate } from '../../dashboard/components/widgets/shared/eventWidgetHelpers';

const EVENT_SETS = [
  { key: 'sleep',   color: '#818cf8', icon: Moon,  i18nKey: 'history.sleep.title' },
  { key: 'feeding', color: '#f97316', icon: Milk,  i18nKey: 'history.feeding.title' },
];

export default function History() {
  const { t, i18n } = useTranslation();
  const [selection, setSelection] = useState(null); // { date, periodsBySets }

  const { sleepEvents } = useSleepEvents();
  const { feedingEvents } = useFeedingEvents();

  const eventSets = [
    { events: sleepEvents,   color: EVENT_SETS[0].color },
    { events: feedingEvents, color: EVENT_SETS[1].color },
  ];

  const dateLabel = selection
    ? new Intl.DateTimeFormat(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' }).format(selection.date)
    : null;

  const timelineRows = selection
    ? EVENT_SETS.map(({ color, icon, i18nKey }, idx) => ({
        label: t(i18nKey),
        color,
        icon,
        periods: selection.periodsBySets[idx],
      }))
    : [];

  return (
    <main className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
      <EventCalendar eventSets={eventSets} onDaySelect={setSelection} />

      {selection && (
        <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3">
          {dateLabel && <p className="text-xs text-zinc-400">{dateLabel}</p>}
          <DayTimeline rows={timelineRows} />
        </div>
      )}
    </main>
  );
}
