import { useTranslation } from 'react-i18next';
import WeeklyWidget from '../components/widgets/WeeklyWidget';

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <main className="p-6 flex flex-col gap-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900">{t('nav.dashboard')}</h1>
      <WeeklyWidget />
    </main>
  );
}
