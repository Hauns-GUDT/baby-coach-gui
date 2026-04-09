import { computePeriodsForDate, computeDayDuration, formatTime, formatHours } from '../../utils/eventWidgetHelpers';

export default function DayEventSummary({ events, date, color, icon: Icon, label }) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const dayEvents = events.filter((e) => {
    const from = new Date(e.startedAt);
    const to = e.endedAt ? new Date(e.endedAt) : dayEnd;
    return to > dayStart && from < dayEnd;
  });

  const periods = computePeriodsForDate(events, date);
  const totalH = computeDayDuration(events, date); // ms-precise, matches chart bar calculation

  if (dayEvents.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-blue-grey-100 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-blue-grey-900 flex items-center gap-2">
          {Icon && <Icon size={18} style={{ color }} strokeWidth={2} />}
          {label}
          <span className="text-xs font-normal text-blue-grey-400">{dayEvents.length}×</span>
        </h3>
        <span className="text-xl font-bold" style={{ color }}>{formatHours(totalH)}</span>
      </div>

      <div className="flex flex-col">
        {dayEvents.map((e) => {
          // Full event duration, not clamped to day boundaries
          const from = new Date(e.startedAt).getTime();
          const to = e.endedAt ? new Date(e.endedAt).getTime() : Date.now();
          const durationH = (to - from) / 3_600_000;
          return (
            <div key={e.id} className="flex items-center justify-between py-2 border-b border-blue-grey-50 last:border-0">
              <p className="text-sm text-blue-grey-700">
                {formatTime(e.startedAt)} – {e.endedAt ? formatTime(e.endedAt) : '…'}
              </p>
              <p className="text-xs text-blue-grey-400">{formatHours(durationH)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
