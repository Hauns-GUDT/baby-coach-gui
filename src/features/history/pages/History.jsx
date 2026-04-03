import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Milk } from 'lucide-react';
import { useSleepEvents } from '../../dashboard/hooks/useSleepEvents';
import { useFeedingEvents } from '../../dashboard/hooks/useFeedingEvents';
import EventCalendar from '../components/calendar/EventCalendar';
import DayClockChart from '../components/calendar/DayClockChart';

const EVENT_SETS = [
  { key: 'sleep',   color: '#818cf8' },
  { key: 'feeding', color: '#f97316' },
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

  return (
    <main className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
      <EventCalendar eventSets={eventSets} onDaySelect={setSelection} />

      {selection && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DayClockChart
            periods={selection.periodsBySets[0]}
            primaryColor={EVENT_SETS[0].color}
            title={t('history.sleep.title')}
            dateLabel={dateLabel}
            icon={Moon}
          />
          <DayClockChart
            periods={selection.periodsBySets[1]}
            primaryColor={EVENT_SETS[1].color}
            title={t('history.feeding.title')}
            dateLabel={dateLabel}
            icon={Milk}
          />
        </div>
      )}
    </main>
  );
}
