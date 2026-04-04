import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Baby } from 'lucide-react';
import Button from '../../../shared/components/Button';

export default function NoBabyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-50 grid place-items-center p-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <Baby className="w-16 h-16 text-indigo-300" />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-zinc-900">{t('noBaby.title')}</h1>
          <p className="text-zinc-500">{t('noBaby.description')}</p>
        </div>
        <Link to="/app/profile/babies/new">
          <Button>{t('noBaby.cta')}</Button>
        </Link>
      </div>
    </div>
  );
}
