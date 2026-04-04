import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useBabyForm } from '../hooks/useBabyForm';
import BabyForm from '../components/BabyForm';

export default function BabyFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { name, setName, birthday, setBirthday, gender, setGender, isLoading, isSubmitting, error, fieldErrors, submit } =
    useBabyForm(id);

  return (
    <main className="min-h-[calc(100vh-65px)] p-6">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
        {isLoading ? (
          <p className="text-sm text-zinc-400">{t('babies.loading')}</p>
        ) : (
          <BabyForm
            name={name}
            setName={setName}
            birthday={birthday}
            setBirthday={setBirthday}
            gender={gender}
            setGender={setGender}
            isSubmitting={isSubmitting}
            error={error}
            fieldErrors={fieldErrors}
            onSubmit={submit}
            onCancel={() => navigate('/app/profile/babies')}
          />
        )}
      </div>
    </main>
  );
}
