import { Milk } from 'lucide-react';
import { useFeedingEvents } from '../../hooks/useFeedingEvents';
import EventWidget from './shared/EventWidget';

const FEEDING_CONFIG = {
  i18nPrefix: 'tracking.feeding',
  showGapPeriods: false,
  icon: Milk,
  svgPrimaryColor: '#f97316',
  svgSecondaryColor: null,
  accentBg: 'bg-orange-50',
  accentDot: 'bg-orange-500',
  accentText: 'text-orange-700',
  accentSubText: 'text-orange-500',
  totalText: 'text-orange-500',
  barActive: 'bg-orange-500',
  barInactive: 'bg-orange-200',
  inputRingClass: 'focus:ring-orange-400',
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
