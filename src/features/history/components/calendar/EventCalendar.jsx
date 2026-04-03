import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { computePeriodsForDate } from '../../../dashboard/components/widgets/shared/eventWidgetHelpers';

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function isSameDay(a, b) { return a.toDateString() === b.toDateString(); }

function isFutureDay(date, today) {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const t = new Date(today); t.setHours(0, 0, 0, 0);
  return d > t;
}

/**
 * @param {object}   props
 * @param {Array}    props.eventSets     [{ events, color }, ...] — one entry per event type
 * @param {Function} [props.onDaySelect] called with { date, periodsBySets }
 */
export default function EventCalendar({ eventSets = [], onDaySelect }) {
  const { i18n } = useTranslation();
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const days = buildMonthGrid(viewYear, viewMonth);

  const monthLabel = new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(
    new Date(viewYear, viewMonth, 1)
  );

  const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 1 + i);
    return new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(d);
  });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const handleDayClick = (date) => {
    if (isFutureDay(date, today)) return;
    const periodsBySets = eventSets.map(({ events }) => computePeriodsForDate(events, date));
    setSelectedDate(date);
    onDaySelect?.({ date, periodsBySets });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer" aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-zinc-700 capitalize">{monthLabel}</span>
        <button onClick={nextMonth} className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer" aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdayLabels.map((label) => (
          <div key={label} className="text-center text-[10px] font-semibold text-zinc-400 uppercase py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;

          const future = isFutureDay(date, today);
          const selected = selectedDate && isSameDay(date, selectedDate);
          const todayCell = isSameDay(date, today);

          const dotsToShow = future
            ? []
            : eventSets.filter(({ events }) => computePeriodsForDate(events, date).length > 0);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDayClick(date)}
              disabled={future}
              className={`flex flex-col items-center justify-center rounded-xl py-2 gap-1 transition-all
                ${future ? 'opacity-25 cursor-not-allowed'
                  : selected ? 'bg-zinc-800 shadow-sm cursor-pointer'
                  : todayCell ? 'bg-zinc-100 cursor-pointer'
                  : 'hover:bg-zinc-50 cursor-pointer'}`}
            >
              <span className={`text-xs font-semibold leading-none ${selected ? 'text-white' : 'text-zinc-700'}`}>
                {date.getDate()}
              </span>
              <div className="flex gap-0.5 h-1.5 items-center">
                {dotsToShow.length > 0
                  ? dotsToShow.map(({ color }, idx) => (
                      <span key={idx} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selected ? '#ffffff' : color }} />
                    ))
                  : <span className="w-1.5 h-1.5" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
