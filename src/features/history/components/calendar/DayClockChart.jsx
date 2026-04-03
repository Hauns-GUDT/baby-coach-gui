import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import {
  buildDoughnutSegments,
  clockTicksPlugin,
  hoursToTimeStr,
  clockSplitPeriods,
  formatHours,
} from '../../../dashboard/components/widgets/shared/eventWidgetHelpers';

ChartJS.register(ArcElement, Tooltip);

function ClockFace({ periods, color, label, offset, primaryLabel }) {
  const { data, colors, meta } = buildDoughnutSegments(periods, color);

  const options = {
    cutout: '60%',
    rotation: -90,
    animation: false,
    layout: { padding: 8 },
    plugins: {
      legend: { display: false },
      tooltip: {
        filter: (item) => meta[item.dataIndex]?.kind === 'primary',
        callbacks: {
          title: () => null,
          label: (item) => {
            const seg = meta[item.dataIndex];
            const start = hoursToTimeStr(seg.fromH + offset);
            const duration = formatHours(seg.toH - seg.fromH);
            return `${primaryLabel} · ${start} · ${duration}`;
          },
        },
      },
    },
  };

  const chartData = {
    datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 0 }],
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-24 h-24">
        <Doughnut data={chartData} options={options} plugins={[clockTicksPlugin]} />
      </div>
      <span className="text-xs font-semibold text-zinc-400 tracking-wide">{label}</span>
    </div>
  );
}

export default function DayClockChart({ periods, primaryColor, title, dateLabel, icon: Icon }) {
  if (!periods) return null;

  const { am, pm } = clockSplitPeriods(periods);

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center gap-3">
      {(title || dateLabel) && (
        <div className="flex flex-col items-center gap-0.5 w-full">
          {title && (
            <div className="flex items-center gap-1.5">
              {Icon && <Icon size={14} style={{ color: primaryColor }} strokeWidth={2} />}
              <p className="text-sm font-semibold text-zinc-700">{title}</p>
            </div>
          )}
          {dateLabel && <p className="text-xs text-zinc-400">{dateLabel}</p>}
        </div>
      )}
      <div className="flex gap-3">
        <ClockFace periods={am} color={primaryColor} label="AM" offset={0} primaryLabel={title} />
        <ClockFace periods={pm} color={primaryColor} label="PM" offset={12} primaryLabel={title} />
      </div>
    </div>
  );
}
