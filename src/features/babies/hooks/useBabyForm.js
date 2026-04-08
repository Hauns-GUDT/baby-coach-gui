import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBabyStore } from '../store/useBabyStore';
import { getBaby, createBaby, updateBaby as updateBabyApi } from '../api/babyService';
import { parseApiError } from '../../../shared/utils/parseApiError';

export function useBabyForm(babyId, { onSuccess } = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { babies, addBaby, updateBaby, setHasFetched } = useBabyStore();

  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [weightGrams, setWeightGrams] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!babyId) return;

    const existing = babies.find((b) => b.id === babyId);
    if (existing) {
      setName(existing.name);
      setBirthday(existing.birthday.slice(0, 10));
      setGender(existing.gender);
      setWeightGrams(existing.weightGrams ?? '');
      return;
    }

    setIsLoading(true);
    getBaby(babyId)
      .then((baby) => {
        setName(baby.name);
        setBirthday(baby.birthday.slice(0, 10));
        setGender(baby.gender);
        setWeightGrams(baby.weightGrams ?? '');
      })
      .catch(() => setError(t('babies.error.notFound')))
      .finally(() => setIsLoading(false));
  }, [babyId]);

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    const payload = {
      name,
      birthday,
      gender,
      // send null to clear, or parse to int
      weightGrams: weightGrams !== '' ? parseInt(weightGrams, 10) : null,
    };

    try {
      if (babyId) {
        const updated = await updateBabyApi(babyId, payload);
        updateBaby(babyId, updated);
      } else {
        const created = await createBaby(payload);
        addBaby(created);
        setHasFetched(false);
      }
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/app/profile/babies');
      }
    } catch (err) {
      const { fieldErrors: fe, code } = parseApiError(err);
      if (fe && Object.keys(fe).length > 0) {
        const translated = {};
        for (const [field, errorCode] of Object.entries(fe)) {
          translated[field] = t(`validation.${errorCode}`, t('validation.fallback'));
        }
        setFieldErrors(translated);
      } else if (code) {
        setError(t(`validation.${code}`, t('babies.error.saveFailed')));
      } else {
        setError(t('babies.error.saveFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { name, setName, birthday, setBirthday, gender, setGender, weightGrams, setWeightGrams, isLoading, isSubmitting, error, fieldErrors, submit };
}
