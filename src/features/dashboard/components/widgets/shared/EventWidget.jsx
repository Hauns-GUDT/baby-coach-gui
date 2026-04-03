import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import Button from '../../../../../shared/components/Button';
import IconButton from '../../../../../shared/components/IconButton';
import ConfirmDialog from '../../../../../shared/components/ConfirmDialog';
import { parseApiError } from '../../../../../shared/utils/parseApiError';
import {
  buildDoughnutSegments,
  clockSplitPeriods,
  formatHours,
  formatElapsed,
  formatTime,
  formatSessionLabel,
  toDatetimeLocal,
  computeTodayPeriods,
  computeGapPeriods,
  computeWeeklyHistory,
} from './eventWidgetHelpers';

ChartJS.register(ArcElement, Tooltip, CategoryScale, LinearScale, BarElement);

// ─── Clock chart ─────────────────────────────────────────────────────────────

const CLOCK_OPTIONS = {
  cutout: '60%',
  rotation: -90,
  animation: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  events: [],
};

function ClockFace({ primaryPeriods, secondaryPeriods, primaryColor, secondaryColor, label }) {
  const { data, colors } = buildDoughnutSegments(primaryPeriods, primaryColor, secondaryPeriods, secondaryColor);
  const chartData = {
    datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 0 }],
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <Doughnut data={chartData} options={CLOCK_OPTIONS} />
        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[9px] text-zinc-400 leading-none">12</span>
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 leading-none">3</span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] text-zinc-400 leading-none">6</span>
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 leading-none">9</span>
      </div>
      <span className="text-xs font-semibold text-zinc-400 tracking-wide">{label}</span>
    </div>
  );
}

function EventClockChart({ primaryPeriods, secondaryPeriods, svgPrimaryColor, svgSecondaryColor }) {
  const primary = clockSplitPeriods(primaryPeriods);
  const secondary = clockSplitPeriods(secondaryPeriods);

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

const valueLabelsPlugin = {
  id: 'valueLabels',
  afterDatasetsDraw(chart) {
    const { ctx, data } = chart;
    chart.getDatasetMeta(0).data.forEach((bar, i) => {
      const value = data.datasets[0].data[i];
      if (value > 0) {
        ctx.save();
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(formatHours(value), bar.x, bar.y - 2);
        ctx.restore();
      }
    });
  },
};

function WeeklyBars({ history, primaryColor }) {
  const { i18n } = useTranslation();
  const maxVal = Math.max(...history, 1);

  const dayLabels = Array.from({ length: history.length }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (history.length - 1 - i));
    return new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(d);
  });

  const bgColors = history.map((_, i) =>
    i === history.length - 1 ? primaryColor : primaryColor + '66'
  );

  const chartData = {
    labels: dayLabels,
    datasets: [{ data: history, backgroundColor: bgColors, borderRadius: 4, borderWidth: 0 }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#a1a1aa' },
        border: { display: false },
      },
      y: { display: false, beginAtZero: true, max: maxVal * 1.5 },
    },
  };

  return (
    <div className="h-28 w-full">
      <Bar data={chartData} options={options} plugins={[valueLabelsPlugin]} />
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
 * @param {string}  props.config.i18nPrefix      e.g. 'history.sleep'
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
          <WeeklyBars history={weeklyHistory} primaryColor={svgPrimaryColor} />
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
