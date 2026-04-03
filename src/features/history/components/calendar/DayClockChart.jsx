import {
  CLOCK,
  CLOCK_HOUR_LABELS,
  clockPointAt,
  clockMakeArc,
  clockSplitPeriods,
} from '../../../dashboard/components/widgets/shared/eventWidgetHelpers';

const { CX, CY, R, SW, LABEL_R } = CLOCK;

function ClockFace({ periods, color, label }) {
  const renderArcs = () =>
    periods.map((p, i) => {
      if (p.toH - p.fromH >= 11.99)
        return <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={color} strokeWidth={SW} />;
      const d = clockMakeArc(p.fromH, p.toH);
      return d ? <path key={i} d={d} fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" /> : null;
    });

  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 120 120" className="w-24 h-24">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e4e4e7" strokeWidth={SW} />
        {renderArcs()}
        {CLOCK_HOUR_LABELS.map(({ h, text }) => {
          const angle = (h / 12) * 2 * Math.PI - Math.PI / 2;
          return (
            <text
              key={h}
              x={(CX + LABEL_R * Math.cos(angle)).toFixed(1)}
              y={(CY + LABEL_R * Math.sin(angle)).toFixed(1)}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#a1a1aa"
              fontSize="9"
            >
              {text}
            </text>
          );
        })}
      </svg>
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
        <ClockFace periods={am} color={primaryColor} label="AM" />
        <ClockFace periods={pm} color={primaryColor} label="PM" />
      </div>
    </div>
  );
}
