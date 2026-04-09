import { Moon } from 'lucide-react';
import { useSleepEvents } from '../../hooks/useSleepEvents';
import EventWidget from './EventWidget';

const SLEEP_CONFIG = {
  i18nPrefix: 'history.sleep',
  showGapPeriods: true,
  icon: Moon,
  primaryVar: '--chart-sleep',         // CSS variable — resolves to correct hex per theme
  svgPrimaryColor: 'var(--chart-sleep)',
  svgSecondaryColor: null,
  accentBg: 'bg-twilight-indigo-50 dark:bg-sky-500/10',
  accentDot: 'bg-twilight-indigo-500 dark:bg-sky-500',
  accentText: 'text-twilight-indigo-700 dark:text-sky-300',
  accentSubText: 'text-twilight-indigo-500 dark:text-sky-400',
  totalText: 'text-twilight-indigo-600 dark:text-sky-400',
};

export default function SleepWidget() {
  const { sleepEvents, activeSleep, isLoading, error, startSleep, stopSleep, editSleepEvent, deleteSleepEvent, refetch } =
    useSleepEvents();

  return (
    <EventWidget
      events={sleepEvents}
      activeEvent={activeSleep}
      isLoading={isLoading}
      error={error}
      onStart={startSleep}
      onStop={stopSleep}
      onEdit={editSleepEvent}
      onDelete={deleteSleepEvent}
      onRefetch={refetch}
      config={SLEEP_CONFIG}
    />
  );
}
