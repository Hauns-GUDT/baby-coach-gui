import { useTranslation } from 'react-i18next';

export default function Tracking() {
  const { t } = useTranslation();

  return (
    <main className="min-h-[calc(100vh-65px)] grid place-items-center p-6">
      <section className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('tracking.title')}</h1>
        <p className="text-gray-500">{t('tracking.comingSoon')}</p>
      </section>
    </main>
  );
}
