import { useTranslation } from 'react-i18next';
import { useSleepEvents } from '../../dashboard/hooks/useSleepEvents';
import { useFeedingEvents } from '../../dashboard/hooks/useFeedingEvents';
import DayWidget from '../../dashboard/components/widgets/DayWidget';
import SessionsWidget from '../components/SessionsWidget';

export default function TrackingPage() {
  const { t } = useTranslation();
  const { sleepEvents, editSleepEvent, deleteSleepEvent } = useSleepEvents();
  const { feedingEvents, editFeedingEvent, deleteFeedingEvent } = useFeedingEvents();

  return (
    <main className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900">{t('nav.tracking')}</h1>
      <DayWidget />
      <SessionsWidget
        sleepEvents={sleepEvents}
        feedingEvents={feedingEvents}
        onEditSleep={editSleepEvent}
        onDeleteSleep={deleteSleepEvent}
        onEditFeeding={editFeedingEvent}
        onDeleteFeeding={deleteFeedingEvent}
      />
    </main>
  );
}
