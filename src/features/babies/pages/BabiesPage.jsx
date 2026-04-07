import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBabies } from '../hooks/useBabies';
import BabyList from '../components/BabyList';
import Button from '../../../shared/components/Button';

export default function BabiesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { babies, isLoading, error, deleteBaby } = useBabies();

  return (
    <main className="min-h-[calc(100vh-65px)] p-6">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/app/profile/babies/new')}
            className="bg-twilight-indigo-600 hover:bg-twilight-indigo-700 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors cursor-pointer"
          >
            + {t('babies.addBaby')}
          </button>
        </div>

        {isLoading && <p className="text-sm text-blue-grey-400">{t('babies.loading')}</p>}
        {error && <p className="text-sm text-rose-500">{error}</p>}

        {!isLoading && <BabyList babies={babies} onDelete={deleteBaby} />}

        <Button variant="secondary" className="self-start text-sm py-2" onClick={() => navigate('/app/profile')}>
          ← {t('babies.backToProfile')}
        </Button>
      </div>
    </main>
  );
}
