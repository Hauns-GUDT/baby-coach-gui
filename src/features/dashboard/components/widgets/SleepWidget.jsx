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

function formatElapsed(ms) {
  const totalMins = Math.round(ms / 60_000);
  if (totalMins < 1) return '< 1 min';
  return formatHours(ms / 3_600_000);
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatSessionLabel(isoString) {
  const d = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
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

// ─── Clock chart (SVG 24-hour ring) ─────────────────────────────────────────

function SleepClockChart({ periods }) {
  const CX = 100, CY = 100, R = 66, SW = 20, LABEL_R = 90;

  const pointAt = (hours) => {
    const angle = (hours / 24) * 2 * Math.PI - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  };

  const makeArc = (fromH, toH) => {
    const span = ((toH - fromH) % 24 + 24) % 24;
    if (span < 1 / 60) return null;
    const { x: sx, y: sy } = pointAt(fromH % 24);
    const { x: ex, y: ey } = pointAt(toH % 24);
    return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${R} ${R} 0 ${span > 12 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  };

  return (
    <svg viewBox="0 0 200 200" className="w-44 h-44 shrink-0">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e5e7eb" strokeWidth={SW} />
      {periods.map((p, i) => {
        const d = makeArc(p.fromH, p.toH);
        return d ? (
          <path key={i} d={d} fill="none" stroke="#6366f1" strokeWidth={SW} strokeLinecap="round" />
        ) : null;
      })}
      {[{ h: 0, text: '0' }, { h: 6, text: '6' }, { h: 12, text: '12' }, { h: 18, text: '18' }].map(({ h, text }) => {
        const angle = (h / 24) * 2 * Math.PI - Math.PI / 2;
        return (
          <text
            key={h}
            x={(CX + LABEL_R * Math.cos(angle)).toFixed(1)}
            y={(CY + LABEL_R * Math.sin(angle)).toFixed(1)}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#9ca3af"
            fontSize="10"
          >
            {text}
          </text>
        );
      })}
      {Array.from({ length: 8 }, (_, i) => i * 3).map((h) => {
        const angle = (h / 24) * 2 * Math.PI - Math.PI / 2;
        return (
          <line
            key={h}
            x1={(CX + (R - SW / 2) * Math.cos(angle)).toFixed(2)}
            y1={(CY + (R - SW / 2) * Math.sin(angle)).toFixed(2)}
            x2={(CX + (R + SW / 2) * Math.cos(angle)).toFixed(2)}
            y2={(CY + (R + SW / 2) * Math.sin(angle)).toFixed(2)}
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
  const dayLabels = Array.from({ length: history.length }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (history.length - 1 - i));
    return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(d);
  });

  return (
    <div className="flex items-end justify-between gap-1">
      {history.map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-[10px] text-gray-400 leading-none">{h.toFixed(1)}</span>
          <div
            className={`w-full rounded-sm ${i === history.length - 1 ? 'bg-indigo-500' : 'bg-indigo-200'}`}
            style={{ height: `${Math.max((h / maxH) * BAR_MAX_PX, 3)}px` }}
          />
          <span className="text-[10px] text-gray-400 leading-none truncate">{dayLabels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Edit dialog ─────────────────────────────────────────────────────────────

function EditSleepDialog({ event, onSave, onCancel }) {
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
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900">Edit Sleep Session</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Start</label>
            <input
              type="datetime-local"
              required
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">End</label>
            <input
              type="datetime-local"
              value={endedAt}
              onChange={(e) => setEndedAt(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <div className="flex gap-3 justify-end mt-1">
            <Button variant="secondary" className="py-2 text-sm" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" className="py-2 text-sm" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save'}
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
  const todayTotal = clockPeriods.reduce((sum, p) => sum + Math.max(0, p.toH - p.fromH), 0);
  const weeklyHistory = computeWeeklyHistory(sleepEvents);
  const recentSessions = sleepEvents.filter((e) => e.endedAt).slice(0, 7);

  const activeElapsed = activeSleep
    ? formatElapsed(now - new Date(activeSleep.startedAt))
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
      <h2 className="font-semibold text-gray-900 text-lg">{t('tracking.sleep.title')}</h2>

      {/* Active sleep banner */}
      {activeSleep && (
        <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-indigo-700">Sleeping</p>
              <p className="text-xs text-indigo-500">
                Since {formatTime(activeSleep.startedAt)} · {activeElapsed}
              </p>
            </div>
          </div>
          <Button variant="danger" className="py-1.5 px-4 text-sm" onClick={stopSleep}>
            Stop
          </Button>
        </div>
      )}

      {/* Loading / error */}
      {isLoading && <p className="text-sm text-gray-400">{t('tracking.sleep.loading')}</p>}
      {error && !isLoading && (
        <div className="flex items-center gap-3">
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={refetch} className="text-xs text-indigo-600 hover:underline cursor-pointer">
            {t('tracking.sleep.retry')}
          </button>
        </div>
      )}

      {/* Clock + today total + start button */}
      <div className="flex items-center gap-5">
        <SleepClockChart periods={clockPeriods} />
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              {t('tracking.sleep.todayTotal')}
            </p>
            <p className="text-4xl font-bold text-indigo-600 leading-none">
              {formatHours(todayTotal)}
            </p>
          </div>
          {!activeSleep && (
            <Button variant="primary" className="py-2 px-4 text-sm" onClick={startSleep}>
              Start Sleep
            </Button>
          )}
        </div>
      </div>

      {/* Weekly bar chart */}
      {weeklyHistory.some((h) => h > 0) && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            {t('tracking.sleep.thisWeek')}
          </p>
          <WeeklyBars history={weeklyHistory} />
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Recent sessions</p>
          <div className="flex flex-col gap-1">
            {recentSessions.map((e) => {
              const duration = (new Date(e.endedAt) - new Date(e.startedAt)) / 3_600_000;
              return (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm text-gray-700">
                      {formatSessionLabel(e.startedAt)} · {formatTime(e.startedAt)}–{formatTime(e.endedAt)}
                    </p>
                    <p className="text-xs text-gray-400">{formatHours(duration)}</p>
                  </div>
                  <div className="flex gap-1">
                    <IconButton icon={Pencil} label="Edit" onClick={() => setEditingEvent(e)} />
                    <IconButton
                      icon={Trash2}
                      label="Delete"
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
        title="Delete Session"
        message="Are you sure you want to delete this sleep session?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
