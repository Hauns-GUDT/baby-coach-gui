import { Milk } from 'lucide-react';
import { useFeedingEvents } from '../../hooks/useFeedingEvents';
import EventWidget from './shared/EventWidget';

const FEEDING_CONFIG = {
  i18nPrefix: 'history.feeding',
  showGapPeriods: false,
  icon: Milk,
  svgPrimaryColor: '#f5b20a', // light-apricot-500
  svgSecondaryColor: null,
  accentBg: 'bg-light-apricot-50',
  accentDot: 'bg-light-apricot-500',
  accentText: 'text-light-apricot-700',
  accentSubText: 'text-light-apricot-500',
  totalText: 'text-light-apricot-500',
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
