// AM/PM dual clock chart for a selected calendar day.
// Replicates the visual from EventWidget's clock but as a standalone component.

const CX = 60, CY = 60, R = 42, SW = 11, LABEL_R = 53;

function pointAt(h) {
  const angle = (h / 12) * 2 * Math.PI - Math.PI / 2;
  return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
}

function makeArc(fromH, toH) {
  const span = toH - fromH;
  if (span < 1 / 60) return null;
  const { x: sx, y: sy } = pointAt(fromH);
  const { x: ex, y: ey } = pointAt(toH);
  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${R} ${R} 0 ${span > 6 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
}

function splitPeriods(periods) {
  return {
    am: periods.flatMap((p) => {
      const from = Math.max(0, p.fromH);
      const to = Math.min(12, p.toH);
      return from < to ? [{ fromH: from, toH: to }] : [];
    }),
    pm: periods.flatMap((p) => {
      const from = Math.max(12, p.fromH);
      const to = Math.min(24, p.toH);
      return from < to ? [{ fromH: from - 12, toH: to - 12 }] : [];
    }),
  };
}

const HOUR_LABELS = [
  { h: 0, text: '12' },
  { h: 3, text: '3' },
  { h: 6, text: '6' },
  { h: 9, text: '9' },
];

function ClockFace({ periods, color, label }) {
  const renderArcs = () =>
    periods.map((p, i) => {
      if (p.toH - p.fromH >= 11.99)
        return <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={color} strokeWidth={SW} />;
      const d = makeArc(p.fromH, p.toH);
      return d ? <path key={i} d={d} fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" /> : null;
    });

  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 120 120" className="w-24 h-24">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e4e4e7" strokeWidth={SW} />
        {renderArcs()}
        {HOUR_LABELS.map(({ h, text }) => {
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

/**
 * @param {object}        props
 * @param {Array}         props.periods      array of { fromH, toH } in 0–24h range
 * @param {string}        props.primaryColor hex color for arcs (e.g. '#818cf8')
 * @param {string}        [props.title]      event type label shown in header
 * @param {string}        [props.dateLabel]  formatted date string shown in header
 * @param {ComponentType} [props.icon]       lucide icon component
 */
export default function DayClockChart({ periods, primaryColor, title, dateLabel, icon: Icon }) {
  if (!periods) return null;

  const { am, pm } = splitPeriods(periods);

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center gap-3">
      <div className="flex flex-col items-center gap-0.5 w-full">
        {title && (
          <div className="flex items-center gap-1.5">
            {Icon && <Icon size={14} style={{ color: primaryColor }} strokeWidth={2} />}
            <p className="text-sm font-semibold text-zinc-700">{title}</p>
          </div>
        )}
        {dateLabel && (
          <p className="text-xs text-zinc-400">{dateLabel}</p>
        )}
      </div>
      <div className="flex gap-3">
        <ClockFace periods={am} color={primaryColor} label="AM" />
        <ClockFace periods={pm} color={primaryColor} label="PM" />
      </div>
    </div>
  );
}
