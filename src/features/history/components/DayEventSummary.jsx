import { computePeriodsForDate, formatTime, formatHours } from '../../dashboard/components/widgets/shared/eventWidgetHelpers';

export default function DayEventSummary({ events, date, color, icon: Icon, label }) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  // Only events that overlap this day
  const dayEvents = events.filter((e) => {
    const from = new Date(e.startedAt);
    const to = e.endedAt ? new Date(e.endedAt) : dayEnd;
    return to > dayStart && from < dayEnd;
  });

  // Total clamped to day boundaries
  const periods = computePeriodsForDate(events, date);
  const totalH = periods.reduce((sum, p) => sum + (p.toH - p.fromH), 0);

  if (dayEvents.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
          {Icon && <Icon size={18} style={{ color }} strokeWidth={2} />}
          {label}
          <span className="text-xs font-normal text-zinc-400">{dayEvents.length}×</span>
        </h3>
        <span className="text-xl font-bold" style={{ color }}>{formatHours(totalH)}</span>
      </div>

      <div className="flex flex-col">
        {dayEvents.map((e) => {
          const durationH = e.endedAt
            ? (new Date(e.endedAt) - new Date(e.startedAt)) / 3_600_000
            : null;
          return (
            <div key={e.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
              <p className="text-sm text-zinc-700">
                {formatTime(e.startedAt)} – {e.endedAt ? formatTime(e.endedAt) : '…'}
              </p>
              {durationH !== null && (
                <p className="text-xs text-zinc-400">{formatHours(durationH)}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
