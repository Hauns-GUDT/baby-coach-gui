import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBabies } from '../hooks/useBabies';
import BabyList from '../components/BabyList';

export default function BabiesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { babies, isLoading, error, deleteBaby } = useBabies();

  return (
    <main className="min-h-[calc(100vh-65px)] p-6">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t('babies.title')}</h1>
          <button
            onClick={() => navigate('/profile/babies/new')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors"
          >
            + {t('babies.addBaby')}
          </button>
        </div>

        {isLoading && <p className="text-sm text-gray-400">{t('babies.loading')}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {!isLoading && <BabyList babies={babies} onDelete={deleteBaby} />}

        <button
          onClick={() => navigate('/profile')}
          className="text-sm text-gray-500 hover:text-gray-800 self-start"
        >
          ← {t('babies.backToProfile')}
        </button>
      </div>
    </main>
  );
}
