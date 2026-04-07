import { Moon } from 'lucide-react';
import { useSleepEvents } from '../../hooks/useSleepEvents';
import EventWidget from './shared/EventWidget';

const SLEEP_CONFIG = {
  i18nPrefix: 'history.sleep',
  showGapPeriods: true,
  icon: Moon,
  svgPrimaryColor: '#425bbd', // twilight-indigo-500
  svgSecondaryColor: '#8e9cd7', // twilight-indigo-300
  accentBg: 'bg-twilight-indigo-50',
  accentDot: 'bg-twilight-indigo-500',
  accentText: 'text-twilight-indigo-700',
  accentSubText: 'text-twilight-indigo-500',
  totalText: 'text-twilight-indigo-600',
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
