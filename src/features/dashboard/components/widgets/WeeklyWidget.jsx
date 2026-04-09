import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Milk } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { useSleepEvents } from '../../hooks/useSleepEvents';
import { useFeedingEvents } from '../../hooks/useFeedingEvents';
import { computeWeeklyHistory, computePeriodsForDate, formatHours } from '../../utils/eventWidgetHelpers';
import DayTimeline from '../../../../shared/components/DayTimeline';
import DayEventSummary from './DayEventSummary';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

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
        ctx.fillStyle = '#6e9dc4'; // blue-grey-400
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(formatHours(value), point.x, point.y - 6);
        ctx.restore();
      });
    });
  },
};

const EVENT_SETS = [
  { key: 'sleep',   color: '#425bbd', icon: Moon,  i18nKey: 'history.sleep.title' },   // twilight-indigo-500
  { key: 'feeding', color: '#f5b20a', icon: Milk,  i18nKey: 'history.feeding.title' }, // light-apricot-500
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

  const [range, setRange] = useState(7);
  const [selectedDate, setSelectedDate] = useState(todayMidnight);

  const days = buildDays(range);
  const sleepHistory = computeWeeklyHistory(sleepEvents, range);
  const maxVal = Math.max(...sleepHistory, 1);

  const chartLabels = days.map((d) =>
    new Intl.DateTimeFormat(i18n.language, { month: 'short', day: 'numeric' }).format(d)
  );

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t('history.sleep.title'),
        data: sleepHistory,
        borderColor: '#425bbd',        // twilight-indigo-500
        backgroundColor: '#425bbd22',  // twilight-indigo-500 faded fill
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#425bbd',
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
        { label: t(EVENT_SETS[0].i18nKey), color: EVENT_SETS[0].color, icon: EVENT_SETS[0].icon, periods: sleepPeriods },
        { label: t(EVENT_SETS[1].i18nKey), color: EVENT_SETS[1].color, icon: EVENT_SETS[1].icon, periods: feedingPeriods },
      ]
    : [];

  const dateLabel = selectedDate
    ? new Intl.DateTimeFormat(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-blue-grey-100 p-5 flex flex-col gap-3">

        {/* Header row: title + range buttons */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-blue-grey-900 text-lg">{t('tracking.thisWeek')}</h2>
          <div className="flex gap-1">
            {RANGES.map(({ days: d, labelKey }) => (
              <button
                key={d}
                onClick={() => setRange(d)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95
                  ${range === d
                    ? 'bg-twilight-indigo-500 text-white shadow-sm'
                    : 'bg-blue-grey-100 text-blue-grey-500 hover:bg-blue-grey-200'}`}
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
                    : 'bg-blue-grey-100 hover:bg-blue-grey-200'}`}
              >
                <span className={`${range === 14 ? 'text-[9px]' : 'text-[10px]'} font-medium uppercase leading-none
                  ${isSelected ? 'text-twilight-indigo-100' : 'text-blue-grey-400'}`}>
                  {dayLabel}
                </span>
                <span className={`${range === 7 ? 'text-sm' : 'text-xs'} font-medium leading-none
                  ${isSelected ? 'text-white' : 'text-blue-grey-600'}`}>
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
            <p className="text-sm font-medium text-blue-grey-500 px-1 capitalize">{dateLabel}</p>
          )}
          <div className="bg-white rounded-2xl border border-blue-grey-100 p-4">
            <DayTimeline rows={timelineRows} isToday={selectedDate?.toDateString() === new Date().toDateString()} />
          </div>
        </>
      )}

      {selectedDate && (
        <>
          <DayEventSummary
            events={sleepEvents}
            date={selectedDate}
            color={EVENT_SETS[0].color}
            icon={EVENT_SETS[0].icon}
            label={t(EVENT_SETS[0].i18nKey)}
          />
          <DayEventSummary
            events={feedingEvents}
            date={selectedDate}
            color={EVENT_SETS[1].color}
            icon={EVENT_SETS[1].icon}
            label={t(EVENT_SETS[1].i18nKey)}
          />
        </>
      )}
    </div>
  );
}
