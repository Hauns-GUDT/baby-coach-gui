import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Milk } from 'lucide-react';
import EventCalendar from '../components/calendar/EventCalendar';
import DayTimeline from '../../../shared/components/DayTimeline';
import { useHistoryDayEvents } from '../hooks/useHistoryDayEvents';

const EVENT_SETS = [
  { key: 'sleep',   color: '#818cf8', icon: Moon,  i18nKey: 'history.sleep.title' },
  { key: 'feeding', color: '#f97316', icon: Milk,  i18nKey: 'history.feeding.title' },
];

export default function History() {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(null);

  const { sleepPeriods, feedingPeriods, isLoading, error } = useHistoryDayEvents(selectedDate);

  const dateLabel = selectedDate
    ? new Intl.DateTimeFormat(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate)
    : null;

  const timelineRows = selectedDate
    ? [
        { label: t(EVENT_SETS[0].i18nKey), color: EVENT_SETS[0].color, icon: EVENT_SETS[0].icon, periods: sleepPeriods },
        { label: t(EVENT_SETS[1].i18nKey), color: EVENT_SETS[1].color, icon: EVENT_SETS[1].icon, periods: feedingPeriods },
      ]
    : [];

  return (
    <main className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
      <EventCalendar onDaySelect={setSelectedDate} />

      {selectedDate && (
        <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3">
          {dateLabel && <p className="text-xs text-zinc-400">{dateLabel}</p>}
          {isLoading && <p className="text-sm text-zinc-400">{t('history.loadingDay')}</p>}
          {error && <p className="text-sm text-rose-500">{t('history.loadDayFailed')}</p>}
          {!isLoading && !error && <DayTimeline rows={timelineRows} />}
        </div>
      )}
    </main>
  );
}
