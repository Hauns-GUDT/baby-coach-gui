import { useTranslation } from 'react-i18next';
import Button from '../../../shared/components/design/Button';
import FormField from '../../../shared/components/design/FormField';
import { inputClass } from '../../../shared/utils/inputClass';

export default function BabyForm({ name, setName, birthday, setBirthday, gender, setGender, weightGrams, setWeightGrams, isSubmitting, error, fieldErrors = {}, onSubmit, onCancel }) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField label={t('babies.name')} htmlFor="name" error={fieldErrors.name}>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </FormField>

      <FormField label={t('babies.birthday')} htmlFor="birthday" error={fieldErrors.birthday}>
        <input
          id="birthday"
          type="date"
          required
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className={inputClass}
        />
      </FormField>

      <FormField label={t('babies.gender')} htmlFor="gender" error={fieldErrors.gender}>
        <select
          id="gender"
          required
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>{t('babies.selectGender')}</option>
          <option value="male">{t('babies.male')}</option>
          <option value="female">{t('babies.female')}</option>
        </select>
      </FormField>

      <FormField label={t('babies.weight')} htmlFor="weightGrams" error={fieldErrors.weightGrams}>
        <input
          id="weightGrams"
          type="number"
          min="0"
          max="30000"
          value={weightGrams}
          onChange={(e) => setWeightGrams(e.target.value)}
          placeholder={t('babies.weightPlaceholder')}
          className={inputClass}
        />
      </FormField>

      {error && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}
      <div className="flex gap-3 mt-2 justify-end">
        <Button variant="secondary" className="py-2 text-sm" 
          type="button"
          onClick={onCancel}>
          {t('babies.cancel')}
        </Button>
        <Button variant="primary" className="py-2 text-sm" 
          type="submit"
          disabled={isSubmitting}>
          {isSubmitting ? t('babies.saving') : t('babies.save')}
        </Button>
      </div>
    </form>
  );
}
