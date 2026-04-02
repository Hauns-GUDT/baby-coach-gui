import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import IconButton from '../../../shared/components/IconButton';

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
          <div className="flex gap-1">
            <IconButton
              icon={Pencil}
              label={t('babies.edit')}
              onClick={() => navigate(`/profile/babies/${baby.id}/edit`)}
            />
            <IconButton
              icon={Trash2}
              label={t('babies.delete')}
              onClick={() => onDelete(baby.id)}
              className="hover:text-red-500"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
