import { Moon } from 'lucide-react';
import { useSleepEvents } from '../../hooks/useSleepEvents';
import EventWidget from './shared/EventWidget';

const SLEEP_CONFIG = {
  i18nPrefix: 'tracking.sleep',
  showGapPeriods: true,
  icon: Moon,
  svgPrimaryColor: '#818cf8',
  svgSecondaryColor: '#38bdf8',
  accentBg: 'bg-indigo-50',
  accentDot: 'bg-indigo-500',
  accentText: 'text-indigo-700',
  accentSubText: 'text-indigo-500',
  totalText: 'text-indigo-600',
  barActive: 'bg-indigo-500',
  barInactive: 'bg-indigo-200',
  inputRingClass: 'focus:ring-indigo-400',
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
