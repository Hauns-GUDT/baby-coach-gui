import { useTranslation } from 'react-i18next';

export default function BabyForm({ name, setName, birthday, setBirthday, gender, setGender, isSubmitting, error, fieldErrors = {}, onSubmit, onCancel }) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="font-semibold text-zinc-700 text-sm" htmlFor="name">
          {t('babies.name')}
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-zinc-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {fieldErrors.name && (
          <p role="alert" className="text-sm text-rose-600">{fieldErrors.name}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-zinc-700 text-sm" htmlFor="birthday">
          {t('babies.birthday')}
        </label>
        <input
          id="birthday"
          type="date"
          required
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className="border border-zinc-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {fieldErrors.birthday && (
          <p role="alert" className="text-sm text-rose-600">{fieldErrors.birthday}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-zinc-700 text-sm" htmlFor="gender">
          {t('babies.gender')}
        </label>
        <select
          id="gender"
          required
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border border-zinc-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="" disabled>{t('babies.selectGender')}</option>
          <option value="male">{t('babies.male')}</option>
          <option value="female">{t('babies.female')}</option>
        </select>
        {fieldErrors.gender && (
          <p role="alert" className="text-sm text-rose-600">{fieldErrors.gender}</p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-600">{error}</p>
      )}

      <div className="flex gap-3 mt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-2 transition-colors cursor-pointer"
        >
          {isSubmitting ? t('babies.saving') : t('babies.save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-zinc-600 hover:text-zinc-900 font-medium px-4 py-2 cursor-pointer"
        >
          {t('babies.cancel')}
        </button>
      </div>
    </form>
  );
}
