import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useBabyForm } from '../hooks/useBabyForm';
import BabyForm from '../components/BabyForm';
import Dialog from '../../../shared/components/design/Dialog';

export default function BabyFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { name, setName, birthday, setBirthday, gender, setGender, weightGrams, setWeightGrams, isLoading, isSubmitting, error, fieldErrors, submit } =
    useBabyForm(id);

  const back = () => navigate('/app/profile/babies');

  return (
      <Dialog isOpen onClose={back} title={t(id ? 'babies.editBaby' : 'babies.addBaby')}>
        {isLoading ? (
          <p className="text-sm text-blue-grey-400 dark:text-navy-200">{t('babies.loading')}</p>
        ) : (
          <BabyForm
            name={name}
            setName={setName}
            birthday={birthday}
            setBirthday={setBirthday}
            gender={gender}
            setGender={setGender}
            weightGrams={weightGrams}
            setWeightGrams={setWeightGrams}
            isSubmitting={isSubmitting}
            error={error}
            fieldErrors={fieldErrors}
            onSubmit={submit}
            onCancel={back}
          />
        )}
      </Dialog>
  );
}
