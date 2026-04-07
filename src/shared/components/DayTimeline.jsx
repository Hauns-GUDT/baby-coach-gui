import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const TIME_MARKERS = [
  { h: 0, icon: Moon },
  { h: 6, label: '6AM' },
  { h: 12, icon: Sun },
  { h: 18, label: '6PM' },
  { h: 24, label: '12AM' },
];

/**
 * Horizontal 24-hour timeline — all event types on a single straight track,
 * with a colour-coded legend below.
 *
 * @param {{ label: string, color: string, icon: ComponentType, periods: { fromH: number, toH: number, tooltip: string }[] }[]} rows
 */
export default function DayTimeline({ rows, isToday = false }) {
  const [now, setNow] = useState(() => new Date());
  const [openPeriod, setOpenPeriod] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Close tooltip on outside tap
  useEffect(() => {
    if (!openPeriod) return;
    const close = () => setOpenPeriod(null);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [openPeriod]);

  const nowH = now.getHours() + now.getMinutes() / 60;

  // Flatten all rows into one sorted list of periods
  const allPeriods = rows
    .flatMap((row) => row.periods.map((p) => ({ ...p, color: row.color })))
    .sort((a, b) => a.fromH - b.fromH);

  const tooltipCenter = openPeriod
    ? ((openPeriod.fromH + openPeriod.toH) / 2 / 24) * 100
    : 0;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Time axis */}
      <div className="relative h-4">
        {TIME_MARKERS.map(({ h, icon: Icon, label }) => (
          <div
            key={h}
            className="absolute bottom-0 flex flex-col items-center -translate-x-1/2"
            style={{ left: `${(h / 24) * 100}%` }}
          >
            {Icon
              ? <Icon size={11} className="text-blue-grey-400" />
              : <span className="text-[10px] leading-none text-blue-grey-400 font-medium">{label}</span>
            }
          </div>
        ))}
      </div>

      {/* Single unified track — rounded ends, straight internal segments */}
      <div className="relative h-6" style={{ overflow: 'visible' }}>
        <div className="absolute inset-0 bg-blue-grey-100 rounded-full overflow-hidden">
          {allPeriods.map((p, i) => (
            <div
              key={i}
              onPointerDown={(e) => {
                e.stopPropagation();
                setOpenPeriod(openPeriod === p ? null : p);
              }}
              className="absolute top-0 h-full cursor-pointer active:brightness-90 transition-[filter]"
              style={{
                left: `${(p.fromH / 24) * 100}%`,
                width: `${((p.toH - p.fromH) / 24) * 100}%`,
                minWidth: '3px',
                backgroundColor: p.color,
              }}
            />
          ))}
        </div>

        {/* Current-time marker — only for today */}
        {isToday && (
          <div
            className="absolute top-0 h-full pointer-events-none z-10"
            style={{
              left: `${(nowH / 24) * 100}%`,
              transform: 'translateX(-50%)',
              width: '1px',
              background: 'repeating-linear-gradient(to bottom, #6e9dc4 0px, #6e9dc4 2px, transparent 2px, transparent 5px)',
            }}
          />
        )}

        {/* Tooltip */}
        {openPeriod && (
          <div
            className="absolute z-50 pointer-events-none inline-block"
            style={{
              bottom: 'calc(100% + 8px)',
              left: `${tooltipCenter}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-blue-grey-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
              {openPeriod.tooltip}
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: '-5px',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid #1e3548',
              }}
            />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 pt-0.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-1.5">
            <row.icon size={12} style={{ color: row.color }} strokeWidth={2} />
            <span className="text-[10px] text-blue-grey-400 font-medium">{row.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
