import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEventHistory } from '../hooks/useEventHistory';
import DayWidget from '../../dashboard/components/widgets/DayWidget';
import SessionsWidget, { AddEventDialog } from '../components/SessionsWidget';

export default function TrackingPage() {
  const { t } = useTranslation();
  const { events, page, totalPages, isLoading, goToPage, addEvent, editEvent, removeEvent, continueEvent, hasActiveEvent, selectedTypes, toggleType } = useEventHistory();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAdd = async (payload) => {
    await addEvent(payload);
    setIsAddOpen(false);
  };

  return (
    <main className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
      <DayWidget />
      <SessionsWidget
        events={events}
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
        isLoading={isLoading}
        onEdit={editEvent}
        onDelete={removeEvent}
        onContinue={continueEvent}
        hasActiveEvent={hasActiveEvent}
        selectedTypes={selectedTypes}
        onTypeToggle={toggleType}
        onAdd={() => setIsAddOpen(true)}
      />
      {isAddOpen && (
        <AddEventDialog onCreate={handleAdd} onCancel={() => setIsAddOpen(false)} />
      )}
    </main>
  );
}
