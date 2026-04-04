import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useEventHistory } from '../hooks/useEventHistory';
import DayWidget from '../../dashboard/components/widgets/DayWidget';
import SessionsWidget, { AddEventDialog } from '../components/SessionsWidget';
import SleepAssistantPanel from '../components/SleepAssistantPanel';

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
      />
      <button
        onClick={() => setIsAddOpen(true)}
        aria-label={t('tracking.addEvent')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all z-40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
      {isAddOpen && (
        <AddEventDialog onCreate={handleAdd} onCancel={() => setIsAddOpen(false)} />
      )}
      <SleepAssistantPanel />
    </main>
  );
}
