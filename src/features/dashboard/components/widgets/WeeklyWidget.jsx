import { useTranslation } from 'react-i18next';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useSleepEvents } from '../../hooks/useSleepEvents';
import { useFeedingEvents } from '../../hooks/useFeedingEvents';
import { computeWeeklyHistory, formatHours } from './shared/eventWidgetHelpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function WeeklyWidget() {
  const { t, i18n } = useTranslation();
  const { sleepEvents } = useSleepEvents();
  const { feedingEvents } = useFeedingEvents();

  const sleepHistory   = computeWeeklyHistory(sleepEvents);
  const feedingHistory = computeWeeklyHistory(feedingEvents);

  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(d);
  });

  const chartData = {
    labels: dayLabels,
    datasets: [
      {
        label: t('history.sleep.title'),
        data: sleepHistory,
        backgroundColor: '#818cf8cc',
        borderRadius: 4,
        borderWidth: 0,
      },
      {
        label: t('history.feeding.title'),
        data: feedingHistory,
        backgroundColor: '#f97316cc',
        borderRadius: 4,
        borderWidth: 0,
      },
    ],
  };

  const maxVal = Math.max(...sleepHistory, ...feedingHistory, 1);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { boxWidth: 10, boxHeight: 10, font: { size: 11 }, color: '#a1a1aa', padding: 12 },
      },
      tooltip: {
        callbacks: {
          label: (item) => `${item.dataset.label}: ${formatHours(item.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#a1a1aa' },
        border: { display: false },
      },
      y: { display: false, beginAtZero: true, max: maxVal * 1.4 },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3">
      <h2 className="font-semibold text-zinc-900 text-lg">{t('tracking.thisWeek')}</h2>
      <div className="h-40 w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
