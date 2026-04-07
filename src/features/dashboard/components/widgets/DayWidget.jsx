import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Milk, CirclePlay } from 'lucide-react';
import Button from '../../../../shared/components/Button';
import DayTimeline from '../../../../shared/components/DayTimeline';
import { useSleepEvents } from '../../hooks/useSleepEvents';
import { useFeedingEvents } from '../../hooks/useFeedingEvents';
import { computeTodayPeriods, formatHours, formatTime, formatElapsed } from './shared/eventWidgetHelpers';

const CONFIGS = [
  {
    key: 'sleep',
    icon: Moon,
    color: '#425bbd', // twilight-indigo-500
    i18nPrefix: 'history.sleep',
    accentBg: 'bg-twilight-indigo-50',
    accentDot: 'bg-twilight-indigo-500',
    accentText: 'text-twilight-indigo-700',
    accentSubText: 'text-twilight-indigo-500',
    totalText: 'text-twilight-indigo-600',
  },
  {
    key: 'feeding',
    icon: Milk,
    color: '#f5b20a', // light-apricot-500
    i18nPrefix: 'history.feeding',
    accentBg: 'bg-light-apricot-50',
    accentDot: 'bg-light-apricot-500',
    accentText: 'text-light-apricot-700',
    accentSubText: 'text-light-apricot-500',
    totalText: 'text-light-apricot-600',
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
    <div className={`flex items-center justify-between ${accentBg} rounded-xl px-4 py-3`}>
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
    color: config.color,
    icon: config.icon,
    periods,
  }));

  return (
    <div className="bg-white rounded-2xl border border-blue-grey-100 p-5 flex flex-col gap-4">
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
          const { icon: Icon, color, totalText, i18nPrefix } = config;
          const total = periods.reduce((sum, p) => sum + Math.max(0, p.toH - p.fromH), 0);
          const count = periods.length;
          const timeSince = !active ? getTimeSinceLastEnded(events, now) : null;

          return (
            <div key={config.key} className="bg-blue-grey-50 rounded-xl p-3 flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon size={13} style={{ color }} strokeWidth={2} />
                  <span className="text-xs font-medium text-blue-grey-400">{t(`${i18nPrefix}.title`)}</span>
                </div>
                {!anyActive && (
                  <button
                    onClick={onStart}
                    aria-label={t(`${i18nPrefix}.start`)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    style={{ backgroundColor: color + '22' }}
                  >
                    <CirclePlay size={22} style={{ color }} strokeWidth={1.5} />
                  </button>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold leading-tight ${totalText}`}>{formatHours(total)}</span>
                <span className="text-xs font-medium text-blue-grey-400">×{count}</span>
              </div>
              {timeSince !== null && (
                <span className="text-xs text-blue-grey-400">{statusLabel} · {formatHours(timeSince)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
