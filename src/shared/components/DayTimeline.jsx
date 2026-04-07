import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const TIME_MARKERS = [
  { h: 0, icon: Moon },
  { h: 6, label: '6AM' },
  { h: 12, icon: Sun },
  { h: 18, label: '6PM' },
  { h: 24, label: '12AM' },
];

function TimelineRow({ label, color, icon: Icon, periods, nowH }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const [clickIdx, setClickIdx] = useState(null);

  const openIdx = hoverIdx ?? clickIdx;

  // Close click-open on any outside tap
  useEffect(() => {
    if (clickIdx === null) return;
    const close = () => setClickIdx(null);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [clickIdx]);

  const openPeriod = openIdx !== null ? periods[openIdx] : null;
  const tooltipCenter = openPeriod
    ? ((openPeriod.fromH + openPeriod.toH) / 2 / 24) * 100
    : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="w-3 flex items-center shrink-0">
        {Icon && <Icon size={11} style={{ color }} strokeWidth={2} title={label} />}
      </div>

      {/* Positioning context — overflow-visible so tooltip isn't clipped */}
      <div className="relative flex-1 h-5" style={{ overflow: 'visible' }}>

        {/* Clipped track */}
        <div className="absolute inset-0 bg-blue-grey-200 rounded-full overflow-hidden">
          {periods.map((p, i) => (
            <div
              key={i}
              onPointerDown={(e) => {
                e.stopPropagation();
                setClickIdx(i === clickIdx ? null : i);
              }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              className="absolute top-0 h-full rounded-full cursor-pointer active:brightness-90 transition-[filter]"
              style={{
                left: `${(p.fromH / 24) * 100}%`,
                width: `${((p.toH - p.fromH) / 24) * 100}%`,
                minWidth: '6px',
                backgroundColor: color,
              }}
            />
          ))}
        </div>

        {/* Current-time marker */}
        <div
          className="absolute top-0 h-full pointer-events-none z-10"
          style={{ left: `${(nowH / 24) * 100}%`, transform: 'translateX(-50%)', width: '1px', background: 'repeating-linear-gradient(to bottom, #6e9dc4 0px, #6e9dc4 2px, transparent 2px, transparent 5px)' }}
        />

        {/* Tooltip — sibling of the clipped track, so it can overflow upward */}
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
    </div>
  );
}

/**
 * Horizontal 24-hour timeline showing one row per event type.
 *
 * @param {{ label: string, color: string, icon?: ComponentType, periods: { fromH: number, toH: number, tooltip: string }[] }[]} rows
 */
export default function DayTimeline({ rows }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const nowH = now.getHours() + now.getMinutes() / 60;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Time axis */}
      <div className="flex items-end pl-5">
        <div className="relative flex-1 h-4">
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
          {/* Now marker on axis */}
          <div
            className="absolute bottom-0 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-grey-400"
            style={{ left: `${(nowH / 24) * 100}%` }}
          />
        </div>
      </div>

      {/* Event rows */}
      {rows.map((row) => (
        <TimelineRow key={row.label} {...row} nowH={nowH} />
      ))}
    </div>
  );
}
