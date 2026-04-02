import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function BabyList({ babies, onDelete }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (babies.length === 0) {
    return <p className="text-gray-400 text-sm">{t('babies.empty')}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {babies.map((baby) => (
        <li
          key={baby.id}
          className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
        >
          <div>
            <p className="font-semibold text-gray-900">{baby.name}</p>
            <p className="text-sm text-gray-500">
              {new Date(baby.birthday).toLocaleDateString()} · {t(`babies.${baby.gender}`)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/profile/babies/${baby.id}/edit`)}
              className="text-sm text-indigo-600 hover:underline cursor-pointer"
            >
              {t('babies.edit')}
            </button>
            <button
              onClick={() => onDelete(baby.id)}
              className="text-sm text-red-500 hover:underline cursor-pointer"
            >
              {t('babies.delete')}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
