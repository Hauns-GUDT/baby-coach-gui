import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBabyStore } from '../store/useBabyStore';
import { getBaby, createBaby, updateBaby as updateBabyApi } from '../api/babyService';

export function useBabyForm(babyId) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { babies, addBaby, updateBaby } = useBabyStore();

  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!babyId) return;

    const existing = babies.find((b) => b.id === babyId);
    if (existing) {
      setName(existing.name);
      setBirthday(existing.birthday.slice(0, 10));
      setGender(existing.gender);
      return;
    }

    setIsLoading(true);
    getBaby(babyId)
      .then((baby) => {
        setName(baby.name);
        setBirthday(baby.birthday.slice(0, 10));
        setGender(baby.gender);
      })
      .catch(() => setError(t('babies.error.notFound')))
      .finally(() => setIsLoading(false));
  }, [babyId]);

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const payload = { name, birthday, gender };

    try {
      if (babyId) {
        const updated = await updateBabyApi(babyId, payload);
        updateBaby(babyId, updated);
      } else {
        const created = await createBaby(payload);
        addBaby(created);
      }
      navigate('/profile/babies');
    } catch {
      setError(t('babies.error.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { name, setName, birthday, setBirthday, gender, setGender, isLoading, isSubmitting, error, submit };
}
