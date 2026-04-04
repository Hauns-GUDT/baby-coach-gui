import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import IconButton from '../../../shared/components/IconButton';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';

export default function BabyList({ babies, onDelete }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const pendingBaby = babies.find((b) => b.id === pendingDeleteId);

  if (babies.length === 0) {
    return <p className="text-zinc-400 text-sm">{t('babies.empty')}</p>;
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {babies.map((baby) => (
          <li
            key={baby.id}
            className="flex items-center justify-between bg-zinc-50 rounded-xl px-4 py-3"
          >
            <div>
              <p className="font-semibold text-zinc-900">{baby.name}</p>
              <p className="text-sm text-zinc-500">
                {new Date(baby.birthday).toLocaleDateString()} · {t(`babies.${baby.gender}`)}
              </p>
            </div>
            <div className="flex gap-1">
              <IconButton
                icon={Pencil}
                label={t('babies.edit')}
                onClick={() => navigate(`/app/profile/babies/${baby.id}/edit`)}
              />
              <IconButton
                icon={Trash2}
                label={t('babies.delete')}
                onClick={() => setPendingDeleteId(baby.id)}
                className="hover:text-rose-500"
              />
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title={t('babies.deleteConfirm.title')}
        message={pendingBaby ? t('babies.deleteConfirm.message', { name: pendingBaby.name }) : ''}
        confirmLabel={t('babies.deleteConfirm.confirm')}
        cancelLabel={t('babies.deleteConfirm.cancel')}
        onConfirm={() => {
          onDelete(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
  );
}
