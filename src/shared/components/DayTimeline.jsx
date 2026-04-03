import { Moon, Sun } from 'lucide-react';

const TIME_MARKERS = [
  { h: 0, icon: Moon },
  { h: 6, label: '6AM' },
  { h: 12, icon: Sun },
  { h: 18, label: '6PM' },
  { h: 24, label: '12AM' },
];

/**
 * Horizontal 24-hour timeline showing one row per event type.
 *
 * @param {{ label: string, color: string, icon?: ComponentType, periods: { fromH: number, toH: number }[] }[]} rows
 */
export default function DayTimeline({ rows }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Time axis */}
      <div className="flex items-end pl-16">
        <div className="relative flex-1 h-4">
          {TIME_MARKERS.map(({ h, icon: Icon, label }) => (
            <div
              key={h}
              className="absolute bottom-0 flex flex-col items-center -translate-x-1/2"
              style={{ left: `${(h / 24) * 100}%` }}
            >
              {Icon
                ? <Icon size={11} className="text-zinc-400" />
                : <span className="text-[10px] leading-none text-zinc-400 font-medium">{label}</span>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Event rows */}
      {rows.map(({ label, color, icon: Icon, periods }) => (
        <div key={label} className="flex items-center gap-2">
          <div className="w-16 flex items-center justify-end gap-1 shrink-0">
            {Icon && <Icon size={11} style={{ color }} strokeWidth={2} />}
            <span className="text-xs text-zinc-500 font-medium truncate">{label}</span>
          </div>
          <div className="relative flex-1 h-5 bg-zinc-200 rounded-full overflow-hidden">
            {periods.map((p, i) => (
              <div
                key={i}
                className="absolute top-0 h-full rounded-full"
                style={{
                  left: `${(p.fromH / 24) * 100}%`,
                  width: `${(p.toH - p.fromH) / 24 * 100}%`,
                  minWidth: '4px',
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
