import { useTranslation } from 'react-i18next';
import Button from '../../../shared/components/Button';

const inputClass = 'border border-blue-grey-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-twilight-indigo-300 dark:bg-navy-500 dark:border-navy-400 dark:text-navy-50 dark:focus:ring-sky-500';
const labelClass = 'font-semibold text-blue-grey-700 dark:text-navy-100 text-sm';

export default function BabyForm({ name, setName, birthday, setBirthday, gender, setGender, weightGrams, setWeightGrams, isSubmitting, error, fieldErrors = {}, onSubmit, onCancel }) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="name">
          {t('babies.name')}
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        {fieldErrors.name && (
          <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{fieldErrors.name}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="birthday">
          {t('babies.birthday')}
        </label>
        <input
          id="birthday"
          type="date"
          required
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className={inputClass}
        />
        {fieldErrors.birthday && (
          <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{fieldErrors.birthday}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="gender">
          {t('babies.gender')}
        </label>
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
        {fieldErrors.gender && (
          <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{fieldErrors.gender}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="weightGrams">
          {t('babies.weight')}
        </label>
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
        {fieldErrors.weightGrams && (
          <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{fieldErrors.weightGrams}</p>
        )}
      </div>

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
