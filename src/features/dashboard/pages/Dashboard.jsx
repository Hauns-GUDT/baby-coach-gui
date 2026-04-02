import { useTranslation } from 'react-i18next';
import SleepWidget from '../components/widgets/SleepWidget';

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">{t('nav.dashboard')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SleepWidget />
      </div>
    </main>
  );
}
