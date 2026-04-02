import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../../../../../shared/components/Button';
import IconButton from '../../../../../shared/components/IconButton';
import ConfirmDialog from '../../../../../shared/components/ConfirmDialog';
import { parseApiError } from '../../../../../shared/utils/parseApiError';
import {
  formatHours,
  formatElapsed,
  formatTime,
  formatSessionLabel,
  toDatetimeLocal,
  computeTodayPeriods,
  computeGapPeriods,
  computeWeeklyHistory,
} from './eventWidgetHelpers';

// ─── Clock chart ─────────────────────────────────────────────────────────────

function ClockFace({ primaryPeriods, secondaryPeriods, primaryColor, secondaryColor, label }) {
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
        {secondaryColor && renderArcs(secondaryPeriods, secondaryColor)}
        {renderArcs(primaryPeriods, primaryColor)}
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

function EventClockChart({ primaryPeriods, secondaryPeriods, svgPrimaryColor, svgSecondaryColor }) {
  const primary = splitPeriods(primaryPeriods);
  const secondary = splitPeriods(secondaryPeriods);

  return (
    <div className="flex gap-3 shrink-0 mx-auto">
      <ClockFace
        primaryPeriods={primary.am}
        secondaryPeriods={secondary.am}
        primaryColor={svgPrimaryColor}
        secondaryColor={svgSecondaryColor}
        label="AM"
      />
      <ClockFace
        primaryPeriods={primary.pm}
        secondaryPeriods={secondary.pm}
        primaryColor={svgPrimaryColor}
        secondaryColor={svgSecondaryColor}
        label="PM"
      />
    </div>
  );
}

// ─── Weekly bar chart ─────────────────────────────────────────────────────────

function WeeklyBars({ history, barActive, barInactive }) {
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
            className={`w-full rounded-sm ${i === history.length - 1 ? barActive : barInactive}`}
            style={{ height: `${Math.max((h / maxH) * BAR_MAX_PX, 3)}px` }}
          />
          <span className="text-[10px] text-zinc-400 leading-none truncate">{dayLabels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Edit dialog ──────────────────────────────────────────────────────────────

function EditEventDialog({ event, onSave, onCancel, i18nPrefix, inputRingClass }) {
  const { t } = useTranslation();
  const [startedAt, setStartedAt] = useState(toDatetimeLocal(event.startedAt));
  const [endedAt, setEndedAt] = useState(event.endedAt ? toDatetimeLocal(event.endedAt) : '');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsSaving(true);
    try {
      await onSave({
        startedAt: new Date(startedAt).toISOString(),
        ...(endedAt ? { endedAt: new Date(endedAt).toISOString() } : {}),
      });
    } catch (err) {
      const { fieldErrors: fe, code } = parseApiError(err);
      if (fe && Object.keys(fe).length > 0) {
        const translated = {};
        for (const [field, errorCode] of Object.entries(fe)) {
          translated[field] = t(`validation.${errorCode}`, t('validation.fallback'));
        }
        setFieldErrors(translated);
      } else if (code) {
        setError(t(`validation.${code}`, t(`${i18nPrefix}.saveFailed`)));
      } else {
        setError(t(`${i18nPrefix}.saveFailed`));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = `border border-zinc-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 ${inputRingClass}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-lg font-bold text-zinc-900">{t(`${i18nPrefix}.editSession`)}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-zinc-700">Start</label>
            <input
              type="datetime-local"
              required
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              className={inputClass}
            />
            {fieldErrors.startedAt && (
              <p className="text-sm text-rose-600" role="alert">{fieldErrors.startedAt}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-zinc-700">{t(`${i18nPrefix}.end`)}</label>
            <input
              type="datetime-local"
              value={endedAt}
              onChange={(e) => setEndedAt(e.target.value)}
              className={inputClass}
            />
            {fieldErrors.endedAt && (
              <p className="text-sm text-rose-600" role="alert">{fieldErrors.endedAt}</p>
            )}
          </div>
          {error && <p className="text-sm text-rose-600" role="alert">{error}</p>}
          <div className="flex gap-3 justify-end mt-1">
            <Button variant="secondary" className="py-2 text-sm" type="button" onClick={onCancel}>
              {t(`${i18nPrefix}.cancel`)}
            </Button>
            <Button variant="primary" className="py-2 text-sm" type="submit" disabled={isSaving}>
              {isSaving ? t(`${i18nPrefix}.saving`) : t(`${i18nPrefix}.save`)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Generic event widget ─────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {Array}   props.events
 * @param {object|null} props.activeEvent
 * @param {boolean} props.isLoading
 * @param {string}  props.error
 * @param {Function} props.onStart
 * @param {Function} props.onStop
 * @param {Function} props.onEdit    async (id, payload) => void — throws on error
 * @param {Function} props.onDelete  async (id) => void
 * @param {Function} props.onRefetch
 * @param {object}  props.config
 * @param {string}  props.config.i18nPrefix      e.g. 'tracking.sleep'
 * @param {boolean} props.config.showGapPeriods  show gaps between events as secondary arcs
 * @param {string}  props.config.svgPrimaryColor  e.g. '#818cf8'
 * @param {string|null} props.config.svgSecondaryColor e.g. '#38bdf8' or null
 * @param {string}  props.config.accentBg         Tailwind class
 * @param {string}  props.config.accentDot        Tailwind class
 * @param {string}  props.config.accentText       Tailwind class
 * @param {string}  props.config.accentSubText    Tailwind class
 * @param {string}  props.config.totalText        Tailwind class
 * @param {string}  props.config.barActive        Tailwind class
 * @param {string}  props.config.barInactive      Tailwind class
 * @param {string}  props.config.inputRingClass   Tailwind class e.g. 'focus:ring-indigo-400'
 */
export default function EventWidget({
  events,
  activeEvent,
  isLoading,
  error,
  onStart,
  onStop,
  onEdit,
  onDelete,
  onRefetch,
  config,
}) {
  const {
    i18nPrefix,
    showGapPeriods,
    icon: Icon,
    svgPrimaryColor,
    svgSecondaryColor,
    accentBg,
    accentDot,
    accentText,
    accentSubText,
    totalText,
    barActive,
    barInactive,
    inputRingClass,
  } = config;

  const { t } = useTranslation();
  const [now, setNow] = useState(() => new Date());
  const [editingEvent, setEditingEvent] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const clockPeriods = computeTodayPeriods(events, now);
  const secondaryPeriods = showGapPeriods ? computeGapPeriods(clockPeriods, now) : [];
  const todayTotal = clockPeriods.reduce((sum, p) => sum + Math.max(0, p.toH - p.fromH), 0);
  const weeklyHistory = computeWeeklyHistory(events);
  const recentSessions = events.filter((e) => e.endedAt).slice(0, 7);
  const activeElapsed = activeEvent ? formatElapsed(now - new Date(activeEvent.startedAt), t, i18nPrefix) : null;

  const handleEdit = async (payload) => {
    await onEdit(editingEvent.id, payload);
    setEditingEvent(null);
  };

  const handleDelete = async () => {
    await onDelete(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-5">
      <h2 className="font-semibold text-zinc-900 text-lg flex items-center gap-2">
        {Icon && <Icon size={20} className={totalText} strokeWidth={2} />}
        {t(`${i18nPrefix}.title`)}
      </h2>

      {/* Active event banner */}
      {activeEvent && (
        <div className={`flex items-center justify-between ${accentBg} rounded-xl px-4 py-3`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${accentDot} animate-pulse`} />
            <div>
              <p className={`text-sm font-medium ${accentText}`}>{t(`${i18nPrefix}.active`)}</p>
              <p className={`text-xs ${accentSubText}`}>
                {t(`${i18nPrefix}.since`)} {formatTime(activeEvent.startedAt)} · {activeElapsed}
              </p>
            </div>
          </div>
          <Button variant="danger" className="py-1.5 px-4 text-sm" onClick={onStop}>
            Stop
          </Button>
        </div>
      )}

      {/* Loading / error */}
      {isLoading && <p className="text-sm text-zinc-400">{t(`${i18nPrefix}.loading`)}</p>}
      {error && !isLoading && (
        <div className="flex items-center gap-3">
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={onRefetch} className="text-xs text-indigo-600 hover:underline cursor-pointer">
            {t(`${i18nPrefix}.retry`)}
          </button>
        </div>
      )}

      {/* Clocks + today total + start button */}
      <div className="flex flex-col gap-3">
        <EventClockChart
          primaryPeriods={clockPeriods}
          secondaryPeriods={secondaryPeriods}
          svgPrimaryColor={svgPrimaryColor}
          svgSecondaryColor={svgSecondaryColor}
        />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
              {t(`${i18nPrefix}.todayTotal`)}
            </p>
            <p className={`text-3xl font-bold ${totalText} leading-none`}>
              {formatHours(todayTotal)}
            </p>
          </div>
          {!activeEvent && (
            <Button variant="primary" className="py-2 px-4 text-sm" onClick={onStart}>
              {t(`${i18nPrefix}.start`)}
            </Button>
          )}
        </div>
      </div>

      {/* Weekly bar chart */}
      {weeklyHistory.some((h) => h > 0) && (
        <div>
          <p className="text-xs text-zinc-400 uppercase tracking-wide mb-3 border-t-2 border-dashed border-gray-100 pt-4">
            {t(`${i18nPrefix}.thisWeek`)}
          </p>
          <WeeklyBars history={weeklyHistory} barActive={barActive} barInactive={barInactive} />
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">{t(`${i18nPrefix}.recentSessions`)}</p>
          <div className="flex flex-col gap-1">
            {recentSessions.map((e) => {
              const duration = (new Date(e.endedAt) - new Date(e.startedAt)) / 3_600_000;
              return (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                  <div>
                    <p className="text-sm text-zinc-700">
                      {formatSessionLabel(e.startedAt, t, i18nPrefix)} · {formatTime(e.startedAt)}–{formatTime(e.endedAt)}
                    </p>
                    <p className="text-xs text-zinc-400">{formatHours(duration)}</p>
                  </div>
                  <div className="flex gap-1">
                    <IconButton icon={Pencil} label={t(`${i18nPrefix}.editSession`)} onClick={() => setEditingEvent(e)} />
                    <IconButton
                      icon={Trash2}
                      label={t(`${i18nPrefix}.delete`)}
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
        <EditEventDialog
          event={editingEvent}
          onSave={handleEdit}
          onCancel={() => setEditingEvent(null)}
          i18nPrefix={i18nPrefix}
          inputRingClass={inputRingClass}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title={t(`${i18nPrefix}.deleteSession`)}
        message={t(`${i18nPrefix}.deleteSessionMessage`)}
        confirmLabel={t(`${i18nPrefix}.delete`)}
        cancelLabel={t(`${i18nPrefix}.cancel`)}
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
