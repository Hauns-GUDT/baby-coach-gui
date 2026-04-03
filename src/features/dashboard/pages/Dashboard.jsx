import { useTranslation } from 'react-i18next';
import DayWidget from '../components/widgets/DayWidget';

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">{t('nav.dashboard')}</h1>
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        <DayWidget />
      </div>
    </main>
  );
}
