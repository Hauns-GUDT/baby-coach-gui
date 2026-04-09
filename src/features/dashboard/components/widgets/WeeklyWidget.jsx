import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Milk, Droplets } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { useSleepEvents } from '../../hooks/useSleepEvents';
import { useFeedingEvents } from '../../hooks/useFeedingEvents';
import { useDiaperEvents } from '../../hooks/useDiaperEvents';
import { computeWeeklyHistory, computePeriodsForDate, formatHours, formatTime, computeDayDuration } from '../../utils/eventWidgetHelpers';
import DayTimeline from '../../../../shared/components/DayTimeline';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Reads a CSS variable from :root (resolves per theme at render time)
function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Draws formatted hours above each data point
const hoursAbovePointsPlugin = {
  id: 'hoursAbovePoints',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset, di) => {
      chart.getDatasetMeta(di).data.forEach((point, i) => {
        const value = dataset.data[i];
        if (!value) return;
        ctx.save();
        ctx.font = '600 9px system-ui, sans-serif';
        ctx.fillStyle = getCssVar('--chart-axis');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(formatHours(value), point.x, point.y - 6);
        ctx.restore();
      });
    });
  },
};

const EVENT_SETS = [
  { key: 'sleep',   colorVar: '--chart-sleep',  icon: Moon,     i18nKey: 'history.sleep.title',   showDuration: true },
  { key: 'feeding', colorVar: '--chart-feed',   icon: Milk,     i18nKey: 'history.feeding.title', showDuration: true },
  { key: 'diaper',  colorVar: '--chart-diaper', icon: Droplets, i18nKey: 'history.diaper.title',  showDuration: false },
];

const RANGES = [
  { days: 7,  labelKey: 'tracking.week' },
  { days: 14, labelKey: 'tracking.twoWeeks' },
];

function buildDays(count) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (count - 1 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

function todayMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function WeeklyWidget() {
  const { t, i18n } = useTranslation();
  const { sleepEvents } = useSleepEvents();
  const { feedingEvents } = useFeedingEvents();
  const { diaperEvents } = useDiaperEvents();

  const [range, setRange] = useState(7);
  const [selectedDate, setSelectedDate] = useState(todayMidnight);

  const days = buildDays(range);
  const sleepHistory = computeWeeklyHistory(sleepEvents, range);
  const maxVal = Math.max(...sleepHistory, 1);

  // Resolve colors at render time so chart updates on theme change
  const sleepColor = getCssVar('--chart-sleep');

  const chartLabels = days.map((d) =>
    new Intl.DateTimeFormat(i18n.language, { month: 'short', day: 'numeric' }).format(d)
  );

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t('history.sleep.title'),
        data: sleepHistory,
        borderColor: sleepColor,
        backgroundColor: sleepColor + '22',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: sleepColor,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item) => `${item.dataset.label}: ${formatHours(item.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: false },
        border: { display: false },
      },
      y: { display: false, beginAtZero: true, max: maxVal * 1.6 },
    },
  };

  const sleepPeriods   = selectedDate ? computePeriodsForDate(sleepEvents, selectedDate) : [];
  const feedingPeriods = selectedDate ? computePeriodsForDate(feedingEvents, selectedDate) : [];

  const timelineRows = selectedDate
    ? [
        { label: t(EVENT_SETS[0].i18nKey), color: getCssVar(EVENT_SETS[0].colorVar), icon: EVENT_SETS[0].icon, periods: sleepPeriods },
        { label: t(EVENT_SETS[1].i18nKey), color: getCssVar(EVENT_SETS[1].colorVar), icon: EVENT_SETS[1].icon, periods: feedingPeriods },
      ]
    : [];

  const dateLabel = selectedDate
    ? new Intl.DateTimeFormat(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-blue-grey-100 dark:bg-navy-700 dark:border-navy-600 p-5 flex flex-col gap-3">

        {/* Header row: title + range buttons */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-blue-grey-900 dark:text-navy-50 text-lg">{t('tracking.thisWeek')}</h2>
          <div className="flex gap-1">
            {RANGES.map(({ days: d, labelKey }) => (
              <button
                key={d}
                onClick={() => setRange(d)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95
                  ${range === d
                    ? 'bg-twilight-indigo-500 text-white shadow-sm'
                    : 'bg-blue-grey-100 text-blue-grey-500 hover:bg-blue-grey-200 dark:bg-navy-600 dark:text-navy-200 dark:hover:bg-navy-500'}`}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="h-40 w-full">
          <Line data={chartData} options={options} plugins={[hoursAbovePointsPlugin]} />
        </div>

        {/* Day selector buttons — columns match the chart bars */}
        <div className={`grid gap-1 ${range === 7 ? 'grid-cols-7' : 'grid-cols-14'}`}>
          {days.map((day, i) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const dayLabel = new Intl.DateTimeFormat(i18n.language, { weekday: range === 14 ? 'narrow' : 'short' }).format(day);
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 transition-all cursor-pointer active:scale-95
                  ${isSelected
                    ? 'bg-twilight-indigo-500 shadow-sm'
                    : 'bg-blue-grey-100 hover:bg-blue-grey-200 dark:bg-navy-600 dark:hover:bg-navy-500'}`}
              >
                <span className={`${range === 14 ? 'text-[9px]' : 'text-[10px]'} font-medium uppercase leading-none
                  ${isSelected ? 'text-twilight-indigo-100' : 'text-blue-grey-400 dark:text-navy-200'}`}>
                  {dayLabel}
                </span>
                <span className={`${range === 7 ? 'text-sm' : 'text-xs'} font-medium leading-none
                  ${isSelected ? 'text-white' : 'text-blue-grey-600 dark:text-navy-100'}`}>
                  {day.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail */}
      {selectedDate && (
        <>
          {dateLabel && (
            <p className="text-sm font-medium text-blue-grey-500 dark:text-navy-200 px-1 capitalize">{dateLabel}</p>
          )}
          <div className="bg-white rounded-2xl border border-blue-grey-100 dark:bg-navy-700 dark:border-navy-600 p-4">
            <DayTimeline rows={timelineRows} isToday={selectedDate?.toDateString() === new Date().toDateString()} />
          </div>
        </>
      )}

      {selectedDate && (() => {
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const sets = [
          { events: sleepEvents,   ...EVENT_SETS[0] },
          { events: feedingEvents, ...EVENT_SETS[1] },
          { events: diaperEvents,  ...EVENT_SETS[2] },
        ].map((s) => ({
          ...s,
          color: getCssVar(s.colorVar),
          dayEvents: s.events.filter((e) => {
            const from = new Date(e.startedAt);
            const to = e.endedAt ? new Date(e.endedAt) : dayEnd;
            return to > dayStart && from < dayEnd;
          }),
          totalH: computeDayDuration(s.events, selectedDate),
          showDuration: s.showDuration,
        })).filter((s) => s.dayEvents.length > 0);

        if (sets.length === 0) return null;

        // Merge all events into one list sorted by startedAt ascending
        const allDayEvents = sets
          .flatMap((s) => s.dayEvents.map((e) => ({ ...e, color: s.color, Icon: s.icon, showDuration: s.showDuration })))
          .sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));

        return (
          <div className="bg-white rounded-2xl border border-blue-grey-100 dark:bg-navy-700 dark:border-navy-600 p-4 flex flex-col gap-3">
            {/* Type summary rows — icon bubble + label + count, duration on right (not for diaper) */}
            {sets.map(({ key, icon: Icon, color, i18nKey, dayEvents, totalH, showDuration }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg" style={{ backgroundColor: color + '28' }}>
                    <Icon size={15} style={{ color }} strokeWidth={2} />
                  </span>
                  <span className="text-sm font-medium text-blue-grey-800 dark:text-navy-100">{t(i18nKey)}</span>
                  <span className="text-xs text-blue-grey-400 dark:text-navy-300">{dayEvents.length}×</span>
                </div>
                {showDuration && (
                  <span className="text-sm font-semibold" style={{ color }}>{formatHours(totalH)}</span>
                )}
              </div>
            ))}

            <div className="border-t border-blue-grey-100 dark:border-navy-600" />

            {/* Merged event list sorted by start time */}
            <div className="flex flex-col">
              {allDayEvents.map((e) => {
                const from = new Date(e.startedAt).getTime();
                const to = e.endedAt ? new Date(e.endedAt).getTime() : Date.now();
                const durationH = (to - from) / 3_600_000;
                return (
                  <div key={e.id} className="flex items-center gap-3 py-2 border-b border-blue-grey-50 dark:border-navy-600 last:border-0">
                    <e.Icon size={14} style={{ color: e.color }} strokeWidth={2} className="shrink-0" />
                    <span className="text-sm text-blue-grey-700 dark:text-navy-100 flex-1">
                      {formatTime(e.startedAt)} – {e.endedAt ? formatTime(e.endedAt) : '…'}
                    </span>
                    {e.showDuration && (
                      <span className="text-xs text-blue-grey-400 dark:text-navy-200 shrink-0">{formatHours(durationH)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
