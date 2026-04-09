import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Milk, CirclePlay } from 'lucide-react';
import Button from '../../../../shared/components/Button';
import DayTimeline from '../../../../shared/components/DayTimeline';
import { useSleepEvents } from '../../hooks/useSleepEvents';
import { useFeedingEvents } from '../../hooks/useFeedingEvents';
import { computeTodayPeriods, formatHours, formatTime, formatElapsed } from '../../utils/eventWidgetHelpers';

const CONFIGS = [
  {
    key: 'sleep',
    icon: Moon,
    colorVar: '--chart-sleep', // resolves per theme
    i18nPrefix: 'history.sleep',
    accentBg: 'bg-twilight-indigo-50 dark:bg-sky-500/10',
    accentDot: 'bg-twilight-indigo-500 dark:bg-sky-500',
    accentText: 'text-twilight-indigo-700 dark:text-sky-300',
    accentSubText: 'text-twilight-indigo-500 dark:text-sky-400',
    totalText: 'text-twilight-indigo-600 dark:text-sky-400',
  },
  {
    key: 'feeding',
    icon: Milk,
    colorVar: '--chart-feed', // resolves per theme
    i18nPrefix: 'history.feeding',
    accentBg: 'bg-light-apricot-50 dark:bg-light-apricot-500/10',
    accentDot: 'bg-light-apricot-500 dark:bg-light-apricot-400',
    accentText: 'text-light-apricot-700 dark:text-light-apricot-300',
    accentSubText: 'text-light-apricot-500 dark:text-light-apricot-400',
    totalText: 'text-light-apricot-500 dark:text-light-apricot-400',
  },
];

function getTimeSinceLastEnded(events, now) {
  const last = events
    .filter((e) => e.endedAt)
    .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))[0];
  if (!last) return null;
  return (now - new Date(last.endedAt)) / 3_600_000;
}

function ActiveBanner({ config, activeEvent, now, onStop, t }) {
  const { accentBg, accentDot, accentText, accentSubText, i18nPrefix } = config;
  const elapsed = formatElapsed(now - new Date(activeEvent.startedAt), t, i18nPrefix);
  return (
    <div className={`flex items-center justify-between ${accentBg} border border-black/5 dark:border-white/5 rounded-xl px-4 py-3`}>
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${accentDot} animate-pulse`} />
        <div>
          <p className={`text-sm font-medium ${accentText}`}>{t(`${i18nPrefix}.active`)}</p>
          <p className={`text-xs ${accentSubText}`}>
            {t(`${i18nPrefix}.since`)} {formatTime(activeEvent.startedAt)} · {elapsed}
          </p>
        </div>
      </div>
      <Button variant="danger" className="py-1.5 px-4 text-sm" onClick={onStop}>
        Stop
      </Button>
    </div>
  );
}

export default function DayWidget() {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => new Date());

  const sleep = useSleepEvents();
  const feeding = useFeedingEvents();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const anyActive = !!(sleep.activeSleep || feeding.activeFeeding);

  // Resolve CSS variable hex at render time (updates when theme class changes)
  const getColor = (varName) =>
    getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

  const data = [
    {
      config: CONFIGS[0],
      events: sleep.sleepEvents,
      periods: computeTodayPeriods(sleep.sleepEvents, now),
      active: sleep.activeSleep,
      onStart: sleep.startSleep,
      onStop: sleep.stopSleep,
      statusLabel: t('dashboard.awake'),
    },
    {
      config: CONFIGS[1],
      events: feeding.feedingEvents,
      periods: computeTodayPeriods(feeding.feedingEvents, now),
      active: feeding.activeFeeding,
      onStart: feeding.startFeeding,
      onStop: feeding.stopFeeding,
      statusLabel: t('dashboard.lastMeal'),
    },
  ];

  const timelineRows = data.map(({ config, periods }) => ({
    label: t(`${config.i18nPrefix}.title`),
    color: getColor(config.colorVar),
    icon: config.icon,
    periods,
  }));

  return (
    <div className="bg-white rounded-2xl border border-blue-grey-100 dark:bg-navy-700 dark:border-navy-600 p-5 flex flex-col gap-4">
      {/* Active banners */}
      {data.map(({ config, active, onStop }) =>
        active ? (
          <ActiveBanner key={config.key} config={config} activeEvent={active} now={now} onStop={onStop} t={t} />
        ) : null
      )}

      {/* Timeline */}
      <DayTimeline rows={timelineRows} isToday />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {data.map(({ config, events, periods, active, onStart, statusLabel }) => {
          const { icon: Icon, colorVar, totalText, i18nPrefix } = config;
          const color = getColor(colorVar);
          const total = periods.reduce((sum, p) => sum + Math.max(0, p.toH - p.fromH), 0);
          const count = periods.length;
          const timeSince = !active ? getTimeSinceLastEnded(events, now) : null;

          return (
            <div key={config.key} className="bg-blue-grey-50 dark:bg-navy-600 dark:border-transparent rounded-xl p-3 flex flex-col gap-0.5 relative">
              {!anyActive && (
                <button
                  onClick={onStart}
                  aria-label={t(`${i18nPrefix}.start`)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <CirclePlay size={26} style={{ color }} strokeWidth={1.5} />
                </button>
              )}
              <div className="flex items-center gap-1.5">
                <Icon size={13} style={{ color }} strokeWidth={2} />
                <span className="text-xs font-medium text-blue-grey-400 dark:text-white">{t(`${i18nPrefix}.title`)}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold leading-tight ${totalText}`}>{formatHours(total)}</span>
                <span className="text-xs font-medium text-blue-grey-400 dark:text-navy-200">×{count}</span>
              </div>
              {timeSince !== null && (
                <span className="text-xs text-blue-grey-400 dark:text-navy-200">{statusLabel} · {formatHours(timeSince)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
