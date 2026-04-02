import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
import { useSleepEvents } from '../../hooks/useSleepEvents';
import Button from '../../../../shared/components/Button';
import IconButton from '../../../../shared/components/IconButton';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatHours(h) {
  const totalMins = Math.round(h * 60);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

function formatElapsed(ms, t) {
  const totalMins = Math.round(ms / 60_000);
  if (totalMins < 1) return t('tracking.sleep.lessThanOneMin');
  return formatHours(ms / 3_600_000);
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatSessionLabel(isoString, t) {
  const d = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return t('tracking.sleep.today');
  if (d.toDateString() === yesterday.toDateString()) return t('tracking.sleep.yesterday');
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function toDatetimeLocal(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function computeTodayPeriods(events, now) {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  return events
    .filter((e) => {
      const from = new Date(e.startedAt);
      const to = e.endedAt ? new Date(e.endedAt) : now;
      return to > todayStart && from < todayEnd;
    })
    .map((e) => {
      const fromDate = new Date(e.startedAt);
      const toDate = e.endedAt ? new Date(e.endedAt) : now;
      const fromH =
        fromDate < todayStart ? 0 : fromDate.getHours() + fromDate.getMinutes() / 60;
      const toH =
        toDate >= todayEnd ? 24 : toDate.getHours() + toDate.getMinutes() / 60;
      return { fromH, toH };
    });
}

function computeTodayAwakePeriods(sleepPeriods, now) {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const nowH = (now.getTime() - todayStart.getTime()) / 3_600_000;

  const sorted = [...sleepPeriods].sort((a, b) => a.fromH - b.fromH);
  const awake = [];
  let cursor = 0;

  for (const { fromH, toH } of sorted) {
    if (cursor < fromH) awake.push({ fromH: cursor, toH: fromH });
    cursor = Math.max(cursor, toH);
  }
  if (cursor < nowH) awake.push({ fromH: cursor, toH: nowH });

  return awake;
}

function computeWeeklyHistory(events) {
  return Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - (6 - i));
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    return events
      .filter((e) => e.endedAt)
      .reduce((total, e) => {
        const from = new Date(e.startedAt).getTime();
        const to = new Date(e.endedAt).getTime();
        const clampedFrom = Math.max(from, dayStart.getTime());
        const clampedTo = Math.min(to, dayEnd.getTime());
        return clampedTo > clampedFrom ? total + (clampedTo - clampedFrom) / 3_600_000 : total;
      }, 0);
  });
}

// ─── Clock chart (two 12-hour rings: AM and PM) ──────────────────────────────

function ClockFace({ sleepPeriods, awakePeriods, label }) {
  const CX = 60, CY = 60, R = 42, SW = 11, LABEL_R = 53;

  const pointAt = (h) => {
    const angle = (h / 12) * 2 * Math.PI - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  };

  const makeArc = (fromH, toH) => {
    const span = toH - fromH;
    if (span < 1 / 60) return null;
    const { x: sx, y: sy } = pointAt(fromH);
    const { x: ex, y: ey } = pointAt(toH);
    return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${R} ${R} 0 ${span > 6 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  };

  const renderArcs = (periods, color) =>
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
        {renderArcs(awakePeriods, '#38bdf8')}
        {renderArcs(sleepPeriods, '#818cf8')}
        {[{ h: 0, text: '12' }, { h: 3, text: '3' }, { h: 6, text: '6' }, { h: 9, text: '9' }].map(({ h, text }) => {
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

function splitPeriods(periods, offset = 0) {
  return {
    am: periods.flatMap((p) => {
      const from = Math.max(offset, p.fromH);
      const to = Math.min(offset + 12, p.toH);
      return from < to ? [{ fromH: from - offset, toH: to - offset }] : [];
    }),
    pm: periods.flatMap((p) => {
      const from = Math.max(offset + 12, p.fromH);
      const to = Math.min(offset + 24, p.toH);
      return from < to ? [{ fromH: from - offset - 12, toH: to - offset - 12 }] : [];
    }),
  };
}

function SleepClockChart({ sleepPeriods, awakePeriods }) {
  const sleep = splitPeriods(sleepPeriods);
  const awake = splitPeriods(awakePeriods);

  return (
    <div className="flex gap-3 shrink-0 mx-auto">
      <ClockFace sleepPeriods={sleep.am} awakePeriods={awake.am} label="AM" />
      <ClockFace sleepPeriods={sleep.pm} awakePeriods={awake.pm} label="PM" />
    </div>
  );
}

// ─── Weekly bar chart ────────────────────────────────────────────────────────

function WeeklyBars({ history }) {
  const { i18n } = useTranslation();
  const maxH = Math.max(...history, 1);
  const BAR_MAX_PX = 72;
  const dayLabels = Array.from({ length: history.length }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (history.length - 1 - i));
    return new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(d);
  });

  return (
    <div className="flex items-end justify-between gap-1">
      {history.map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-[10px] text-zinc-400 leading-none">{h.toFixed(1)}</span>
          <div
            className={`w-full rounded-sm ${i === history.length - 1 ? 'bg-indigo-500' : 'bg-indigo-200'}`}
            style={{ height: `${Math.max((h / maxH) * BAR_MAX_PX, 3)}px` }}
          />
          <span className="text-[10px] text-zinc-400 leading-none truncate">{dayLabels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Edit dialog ─────────────────────────────────────────────────────────────

function EditSleepDialog({ event, onSave, onCancel }) {
  const { t } = useTranslation();
  const [startedAt, setStartedAt] = useState(toDatetimeLocal(event.startedAt));
  const [endedAt, setEndedAt] = useState(event.endedAt ? toDatetimeLocal(event.endedAt) : '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      await onSave({
        startedAt: new Date(startedAt).toISOString(),
        ...(endedAt ? { endedAt: new Date(endedAt).toISOString() } : {}),
      });
    } catch (err) {
      setError(err.message || t('tracking.sleep.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-lg font-bold text-zinc-900">{t('tracking.sleep.editSession')}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-zinc-700">Start</label>
            <input
              type="datetime-local"
              required
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              className="border border-zinc-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-zinc-700">{t('tracking.sleep.end')}</label>
            <input
              type="datetime-local"
              value={endedAt}
              onChange={(e) => setEndedAt(e.target.value)}
              className="border border-zinc-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {error && <p className="text-sm text-rose-600" role="alert">{error}</p>}
          <div className="flex gap-3 justify-end mt-1">
            <Button variant="secondary" className="py-2 text-sm" type="button" onClick={onCancel}>
              {t('tracking.sleep.cancel')}
            </Button>
            <Button variant="primary" className="py-2 text-sm" type="submit" disabled={isSaving}>
              {isSaving ? t('tracking.sleep.saving') : t('tracking.sleep.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main widget ─────────────────────────────────────────────────────────────

export default function SleepWidget() {
  const { t } = useTranslation();
  const { sleepEvents, activeSleep, isLoading, error, startSleep, stopSleep, editSleepEvent, deleteSleepEvent, refetch } =
    useSleepEvents();

  const [now, setNow] = useState(() => new Date());
  const [editingEvent, setEditingEvent] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const clockPeriods = computeTodayPeriods(sleepEvents, now);
  const clockAwakePeriods = computeTodayAwakePeriods(clockPeriods, now);
  const todayTotal = clockPeriods.reduce((sum, p) => sum + Math.max(0, p.toH - p.fromH), 0);
  const weeklyHistory = computeWeeklyHistory(sleepEvents);
  const recentSessions = sleepEvents.filter((e) => e.endedAt).slice(0, 7);

  const activeElapsed = activeSleep
    ? formatElapsed(now - new Date(activeSleep.startedAt), t)
    : null;

  const handleEdit = async (payload) => {
    await editSleepEvent(editingEvent.id, payload); // throws on error — dialog catches and stays open
    setEditingEvent(null);
  };

  const handleDelete = async () => {
    await deleteSleepEvent(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-5">
      <h2 className="font-semibold text-zinc-900 text-lg">{t('tracking.sleep.title')}</h2>

      {/* Active sleep banner */}
      {activeSleep && (
        <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-indigo-700">{t('tracking.sleep.sleeping')}</p>
              <p className="text-xs text-indigo-500">
                {t('tracking.sleep.since')} {formatTime(activeSleep.startedAt)} · {activeElapsed}
              </p>
            </div>
          </div>
          <Button variant="danger" className="py-1.5 px-4 text-sm" onClick={stopSleep}>
            Stop
          </Button>
        </div>
      )}

      {/* Loading / error */}
      {isLoading && <p className="text-sm text-zinc-400">{t('tracking.sleep.loading')}</p>}
      {error && !isLoading && (
        <div className="flex items-center gap-3">
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={refetch} className="text-xs text-indigo-600 hover:underline cursor-pointer">
            {t('tracking.sleep.retry')}
          </button>
        </div>
      )}

      {/* Clocks + today total + start button */}
      <div className="flex flex-col gap-3">
        <SleepClockChart sleepPeriods={clockPeriods} awakePeriods={clockAwakePeriods} />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
              {t('tracking.sleep.todayTotal')}
            </p>
            <p className="text-3xl font-bold text-indigo-600 leading-none">
              {formatHours(todayTotal)}
            </p>
          </div>
          {!activeSleep && (
            <Button variant="primary" className="py-2 px-4 text-sm" onClick={startSleep}>
              {t('tracking.sleep.startSleep')}
            </Button>
          )}
        </div>
      </div>

      {/* Weekly bar chart */}
      {weeklyHistory.some((h) => h > 0) && (
        <div>
          <p className="text-xs text-zinc-400 uppercase tracking-wide mb-3 border-t-2 border-dashed border-gray-100 pt-4">
            {t('tracking.sleep.thisWeek')}
          </p>
          <WeeklyBars history={weeklyHistory} />
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">{t('tracking.sleep.recentSessions')}</p>
          <div className="flex flex-col gap-1">
            {recentSessions.map((e) => {
              const duration = (new Date(e.endedAt) - new Date(e.startedAt)) / 3_600_000;
              return (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                  <div>
                    <p className="text-sm text-zinc-700">
                      {formatSessionLabel(e.startedAt, t)} · {formatTime(e.startedAt)}–{formatTime(e.endedAt)}
                    </p>
                    <p className="text-xs text-zinc-400">{formatHours(duration)}</p>
                  </div>
                  <div className="flex gap-1">
                    <IconButton icon={Pencil} label={t('tracking.sleep.editSession')} onClick={() => setEditingEvent(e)} />
                    <IconButton
                      icon={Trash2}
                      label={t('tracking.sleep.delete')}
                      className="hover:text-red-500"
                      onClick={() => setPendingDeleteId(e.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit dialog */}
      {editingEvent && (
        <EditSleepDialog
          event={editingEvent}
          onSave={handleEdit}
          onCancel={() => setEditingEvent(null)}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title={t('tracking.sleep.deleteSession')}
        message={t('tracking.sleep.deleteSessionMessage')}
        confirmLabel={t('tracking.sleep.delete')}
        cancelLabel={t('tracking.sleep.cancel')}
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
