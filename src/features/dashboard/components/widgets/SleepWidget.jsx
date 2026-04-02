import { useTranslation } from 'react-i18next';
import { useSleep } from '../../../../shared/domain/sleep/useSleep';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatHours(h) {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

/**
 * Transform a `today` array from the API into clock-ready {fromH, toH} pairs
 * where fromH/toH are hours within the 0-24 range of the current day.
 */
function parseTodayPeriods(periods) {
  const now = new Date();
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);
  const tomorrowMidnight = new Date(todayMidnight);
  tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);

  return periods.map((p) => {
    const fromDate = new Date(p.from);
    const toDate = p.to ? new Date(p.to) : now;

    const fromH =
      fromDate < todayMidnight
        ? 0
        : fromDate.getHours() + fromDate.getMinutes() / 60;

    const toH =
      toDate >= tomorrowMidnight
        ? 24
        : toDate.getHours() + toDate.getMinutes() / 60;

    return { fromH, toH };
  });
}

// ─── Clock chart (SVG 24-hour ring) ─────────────────────────────────────────

function SleepClockChart({ periods }) {
  const CX = 100;
  const CY = 100;
  const R = 66;
  const SW = 20;
  const LABEL_R = 90;

  /** (hours 0-24) → {x, y} on the ring */
  const pointAt = (hours) => {
    const angle = (hours / 24) * 2 * Math.PI - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  };

  /** Build an SVG arc path for a sleep period */
  const makeArc = (fromH, toH) => {
    // Span in hours (handles wrap through 24)
    const span = ((toH - fromH) % 24 + 24) % 24;
    if (span < 1 / 60) return null; // less than a minute – skip

    const { x: sx, y: sy } = pointAt(fromH % 24);
    const { x: ex, y: ey } = pointAt(toH % 24);
    const largeArc = span > 12 ? 1 : 0;
    return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  };

  const quadrantLabels = [
    { h: 0, text: '0' },
    { h: 6, text: '6' },
    { h: 12, text: '12' },
    { h: 18, text: '18' },
  ];

  return (
    <svg viewBox="0 0 200 200" className="w-44 h-44 shrink-0">
      {/* Background ring */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e5e7eb" strokeWidth={SW} />

      {/* Sleep period arcs */}
      {periods.map((p, i) => {
        const d = makeArc(p.fromH, p.toH);
        if (!d) return null;
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#6366f1"
            strokeWidth={SW}
            strokeLinecap="round"
          />
        );
      })}

      {/* Hour labels at 0 / 6 / 12 / 18 */}
      {quadrantLabels.map(({ h, text }) => {
        const angle = (h / 24) * 2 * Math.PI - Math.PI / 2;
        const x = CX + LABEL_R * Math.cos(angle);
        const y = CY + LABEL_R * Math.sin(angle);
        return (
          <text
            key={h}
            x={x.toFixed(1)}
            y={y.toFixed(1)}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#9ca3af"
            fontSize="10"
          >
            {text}
          </text>
        );
      })}

      {/* Tick marks every 3 hours */}
      {Array.from({ length: 8 }, (_, i) => i * 3).map((h) => {
        const angle = (h / 24) * 2 * Math.PI - Math.PI / 2;
        const inner = R - SW / 2;
        const outer = R + SW / 2;
        return (
          <line
            key={h}
            x1={(CX + inner * Math.cos(angle)).toFixed(2)}
            y1={(CY + inner * Math.sin(angle)).toFixed(2)}
            x2={(CX + outer * Math.cos(angle)).toFixed(2)}
            y2={(CY + outer * Math.sin(angle)).toFixed(2)}
            stroke="#f3f4f6"
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}

// ─── Weekly bar chart ────────────────────────────────────────────────────────

function WeeklyBars({ history }) {
  const maxH = Math.max(...history, 1);
  const BAR_MAX_PX = 72;

  // Build day labels from today backwards
  const dayLabels = Array.from({ length: history.length }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (history.length - 1 - i));
    return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(d);
  });

  return (
    <div className="flex items-end justify-between gap-1">
      {history.map((h, i) => {
        const barH = Math.max((h / maxH) * BAR_MAX_PX, 3);
        const isToday = i === history.length - 1;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-[10px] text-gray-400 leading-none">{h.toFixed(1)}</span>
            <div
              className={`w-full rounded-sm ${isToday ? 'bg-indigo-500' : 'bg-indigo-200'}`}
              style={{ height: `${barH}px` }}
            />
            <span className="text-[10px] text-gray-400 leading-none truncate">{dayLabels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main widget ─────────────────────────────────────────────────────────────

export default function SleepWidget() {
  const { t } = useTranslation();
  const { sleepData, sleepLoading, sleepError, refetch } = useSleep();

  const clockPeriods = sleepData ? parseTodayPeriods(sleepData.today ?? []) : [];
  const todayTotal = clockPeriods.reduce((sum, p) => sum + Math.max(0, p.toH - p.fromH), 0);
  const history = sleepData?.hoursHistory ?? [];

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-5">
      {/* Widget header */}
      <h2 className="font-semibold text-gray-900 text-lg">{t('tracking.sleep.title')}</h2>

      {/* Loading / error states */}
      {sleepLoading && (
        <p className="text-sm text-gray-400">{t('tracking.sleep.loading')}</p>
      )}
      {sleepError && !sleepLoading && (
        <div className="flex items-center gap-3">
          <p className="text-sm text-red-500">{t('tracking.sleep.error')}</p>
          <button
            onClick={refetch}
            className="text-xs text-indigo-600 hover:underline cursor-pointer"
          >
            {t('tracking.sleep.retry')}
          </button>
        </div>
      )}

      {/* Clock + today total (shown even while loading if we have cached data) */}
      {(sleepData || sleepLoading) && (
        <div className="flex items-center gap-5">
          <SleepClockChart periods={clockPeriods} />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              {t('tracking.sleep.todayTotal')}
            </p>
            <p className="text-4xl font-bold text-indigo-600 leading-none">
              {formatHours(todayTotal)}
            </p>
          </div>
        </div>
      )}

      {/* Weekly bar chart */}
      {history.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            {t('tracking.sleep.thisWeek')}
          </p>
          <WeeklyBars history={history} />
        </div>
      )}
    </div>
  );
}
