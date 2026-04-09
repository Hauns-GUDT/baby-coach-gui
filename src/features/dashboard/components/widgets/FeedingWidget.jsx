import { Milk } from 'lucide-react';
import { useFeedingEvents } from '../../hooks/useFeedingEvents';
import EventWidget from './EventWidget';

const FEEDING_CONFIG = {
  i18nPrefix: 'history.feeding',
  showGapPeriods: false,
  icon: Milk,
  primaryVar: '--chart-feed',          // CSS variable — resolves to correct hex per theme
  svgPrimaryColor: 'var(--chart-feed)',
  svgSecondaryColor: null,
  accentBg: 'bg-light-apricot-50 dark:bg-light-apricot-500/10',
  accentDot: 'bg-light-apricot-500 dark:bg-light-apricot-400',
  accentText: 'text-light-apricot-700 dark:text-light-apricot-300',
  accentSubText: 'text-light-apricot-500 dark:text-light-apricot-400',
  totalText: 'text-light-apricot-500 dark:text-light-apricot-400',
};

export default function FeedingWidget() {
  const { feedingEvents, activeFeeding, isLoading, error, startFeeding, stopFeeding, editFeedingEvent, deleteFeedingEvent, refetch } =
    useFeedingEvents();

  return (
    <EventWidget
      events={feedingEvents}
      activeEvent={activeFeeding}
      isLoading={isLoading}
      error={error}
      onStart={startFeeding}
      onStop={stopFeeding}
      onEdit={editFeedingEvent}
      onDelete={deleteFeedingEvent}
      onRefetch={refetch}
      config={FEEDING_CONFIG}
    />
  );
}
