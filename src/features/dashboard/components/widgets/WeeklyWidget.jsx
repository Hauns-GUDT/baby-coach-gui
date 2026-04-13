import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Milk, Droplets, ChevronDown, MessageCircle } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useSleepEvents } from '../../hooks/useSleepEvents';
import { useFeedingEvents } from '../../hooks/useFeedingEvents';
import { useDiaperEvents } from '../../hooks/useDiaperEvents';
import { computeWeeklyHistory, computePeriodsForDate, formatHours, formatTime, computeDayDuration } from '../../utils/eventWidgetHelpers';
import DayTimeline from '../../../../shared/components/DayTimeline';
import { panelBase, panelClass } from '../../../../shared/utils/inputClass';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Reads a CSS variable from :root (resolves per theme at render time)
function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const EVENT_SETS = [
  { key: 'sleep',   colorVar: '--chart-sleep',  icon: Moon,     i18nKey: 'history.sleep.title',   showDuration: true,  i18nPrefix: 'history.sleep' },
  { key: 'feeding', colorVar: '--chart-feed',   icon: Milk,     i18nKey: 'history.feeding.title', showDuration: true,  i18nPrefix: 'history.feeding' },
  { key: 'diaper',  colorVar: '--chart-diaper', icon: Droplets, i18nKey: 'history.diaper.title',  showDuration: false, i18nPrefix: 'history.diaper' },
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

// Filter chip active/inactive classes (mirrors tracking page)
const FILTER_ACTIVE_CLS   = 'bg-twilight-indigo-600 border-twilight-indigo-600 text-white dark:bg-sky-500/20 dark:border-sky-500 dark:text-sky-100';
const FILTER_INACTIVE_CLS = 'bg-white border-blue-grey-200 text-blue-grey-500 hover:border-blue-grey-400 dark:bg-navy-600 dark:border-navy-400 dark:text-navy-100 dark:hover:border-navy-300';

export default function WeeklyWidget() {
  const { t, i18n } = useTranslation();
  const { sleepEvents } = useSleepEvents();
  const { feedingEvents } = useFeedingEvents();
  const { diaperEvents } = useDiaperEvents();

  const [range, setRange] = useState(7);
  const [selectedDate, setSelectedDate] = useState(todayMidnight);
  const [chartInset, setChartInset] = useState({ left: 0, right: 0 });
  const [expandedNotes, setExpandedNotes] = useState(() => new Set());
  const [selectedTypes, setSelectedTypes] = useState([]);

  const toggleType = (type) => setSelectedTypes((prev) =>
    prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
  );

  const toggleNote = (id) => setExpandedNotes((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const chartRef = useRef(null);

  const chartInsetRef = useRef({ left: 0, right: 0 });

  // Plugin that reads chart area bounds after layout so buttons align with bars
  // Uses ref comparison to avoid triggering re-render on every chart layout cycle
  const alignPlugin = useMemo(() => ({
    id: 'alignButtons',
    afterLayout(chart) {
      const { left, right } = chart.chartArea;
      const newRight = chart.width - right;
      if (chartInsetRef.current.left !== left || chartInsetRef.current.right !== newRight) {
        chartInsetRef.current = { left, right: newRight };
        setChartInset({ left, right: newRight });
      }
    },
  }), []);

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
        backgroundColor: sleepColor + '99',
        borderColor: sleepColor,
        borderWidth: 1.5,
        borderRadius: 4,
        borderSkipped: false,
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
      y: {
        display: true,
        beginAtZero: true,
        max: Math.ceil(maxVal), // round up to nearest full hour so top label is clean
        border: { display: false, dash: [4, 4] },
        grid: {
          color: getCssVar('--chart-axis') + '30',
          lineWidth: 1,
        },
        ticks: {
          stepSize: 1, // every full hour
          maxTicksLimit: 8,
          callback: (v) => Number.isInteger(v) ? `${v}h` : null, // full hours only, no minutes
          font: { size: 9, family: 'system-ui, sans-serif' },
          color: getCssVar('--chart-axis'),
          padding: 4,
        },
      },
    },
  };

  const sleepPeriods   = selectedDate ? computePeriodsForDate(sleepEvents, selectedDate) : [];
  const feedingPeriods = selectedDate ? computePeriodsForDate(feedingEvents, selectedDate) : [];

  const timelineRows = selectedDate
    ? EVENT_SETS.slice(0, 2) // sleep + feeding only (diaper is point-in-time)
        .filter(({ key }) => selectedTypes.length === 0 || selectedTypes.includes(key))
        .map(({ i18nKey, colorVar, icon }, idx) => ({
          label: t(i18nKey),
          color: getCssVar(colorVar),
          icon,
          periods: idx === 0 ? sleepPeriods : feedingPeriods,
        }))
    : [];

  const dateLabel = selectedDate
    ? new Intl.DateTimeFormat(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className={panelClass}>

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
          <Bar ref={chartRef} data={chartData} options={options} plugins={[alignPlugin]} />
        </div>

        {/* Day selector buttons — offset to align with chart bars */}
        <div
          className={`grid gap-1 ${range === 7 ? 'grid-cols-7' : 'grid-cols-14'}`}
          style={{ paddingLeft: chartInset.left, paddingRight: chartInset.right }}
        >
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
          <div className={`${panelBase} p-4`}>
            <DayTimeline rows={timelineRows} isToday={selectedDate?.toDateString() === new Date().toDateString()} />
          </div>
        </>
      )}

      {selectedDate && (() => {
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        // All types with events on this day — drives filter buttons
        const allSets = [
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
        })).filter((s) => s.dayEvents.length > 0);

        if (allSets.length === 0) return null;

        // Only selected types feed the event list (empty = show all)
        const allDayEvents = allSets
          .filter((s) => selectedTypes.length === 0 || selectedTypes.includes(s.key))
          .flatMap((s) => s.dayEvents.map((e) => ({ ...e, color: s.color, Icon: s.icon, showDuration: s.showDuration, i18nPrefix: s.i18nPrefix })))
          .sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));

        return (
          <div className={`${panelBase} p-4 flex flex-col gap-3`}>
            {/* Filter buttons — count inside, duration below in event color */}
            <div className="flex gap-2 flex-wrap flex-col">
              {allSets.map(({ key, icon: Icon, color, i18nKey, dayEvents, totalH, showDuration }) => {
                const active = selectedTypes.includes(key);
                return (
                  <div key={key} className="flex items-center gap-0.5">
                    <button
                      onClick={() => toggleType(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer active:scale-95 ${
                        active ? FILTER_ACTIVE_CLS : FILTER_INACTIVE_CLS
                      }`}
                    >
                      <Icon size={13} strokeWidth={2} />
                      <span>{t(i18nKey)}</span>
                      <span className="opacity-70">{dayEvents.length}×</span>
                    </button>
                    {showDuration && (
                      <span className="text-xs font-medium ml-auto" style={{ color }}>{formatHours(totalH)}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {allDayEvents.length > 0 && <div className="border-t border-blue-grey-100 dark:border-navy-600" />}

            {/* Merged event list sorted by start time */}
            <div className="flex flex-col">
              {allDayEvents.map((e) => {
                const from = new Date(e.startedAt).getTime();
                const to = e.endedAt ? new Date(e.endedAt).getTime() : Date.now();
                const durationH = (to - from) / 3_600_000;
                const hasNotes = !!e.notes;
                const noteExpanded = expandedNotes.has(e.id);
                return (
                  <div key={e.id} className="flex items-center gap-3 py-2 border-b border-blue-grey-50 dark:border-navy-600 last:border-0">
                    <e.Icon size={14} style={{ color: e.color }} strokeWidth={2} className="shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm text-blue-grey-700 dark:text-navy-100">
                        {formatTime(e.startedAt)} – {e.endedAt ? formatTime(e.endedAt) : '…'}
                      </span>
                      {/* SubType + ml */}
                      {(e.subType || e.ml != null) && (
                        <span className="text-xs text-blue-grey-400 dark:text-navy-200 mt-0.5">
                          {[e.subType ? t(`${e.i18nPrefix}.${e.subType}`, e.subType) : null, e.ml != null ? `${e.ml} ml` : null].filter(Boolean).join(' · ')}
                        </span>
                      )}
                      {/* Notes inline on sm+ */}
                      {hasNotes && (
                        <p className="hidden sm:block text-xs text-blue-grey-400 dark:text-navy-200 mt-0.5 truncate">{e.notes}</p>
                      )}
                      {/* Notes expanded on mobile */}
                      {hasNotes && noteExpanded && (
                        <p className="sm:hidden text-xs text-blue-grey-400 dark:text-navy-200 mt-0.5 wrap-break-word">{e.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {hasNotes && (
                        <button
                          onClick={() => toggleNote(e.id)}
                          className={`sm:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                            noteExpanded ? 'text-twilight-indigo-600 dark:text-sky-400' : 'text-blue-grey-400 hover:text-blue-grey-600 dark:text-navy-300 dark:hover:text-navy-100'
                          }`}
                        >
                          <MessageCircle size={15} />
                        </button>
                      )}
                      {e.showDuration && (
                        <span className="text-xs text-blue-grey-400 dark:text-navy-200">{formatHours(durationH)}</span>
                      )}
                    </div>
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
