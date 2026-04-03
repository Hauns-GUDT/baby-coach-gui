import { useTranslation } from 'react-i18next';
import { useEventHistory } from '../hooks/useEventHistory';
import DayWidget from '../../dashboard/components/widgets/DayWidget';
import SessionsWidget from '../components/SessionsWidget';

export default function TrackingPage() {
  const { t } = useTranslation();
  const { events, page, totalPages, isLoading, goToPage, editEvent, removeEvent, selectedTypes, toggleType } = useEventHistory();

  return (
    <main className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900">{t('nav.tracking')}</h1>
      <DayWidget />
      <SessionsWidget
        events={events}
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
        isLoading={isLoading}
        onEdit={editEvent}
        onDelete={removeEvent}
        selectedTypes={selectedTypes}
        onTypeToggle={toggleType}
      />
    </main>
  );
}
