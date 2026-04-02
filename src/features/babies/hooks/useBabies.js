import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBabyStore } from '../store/useBabyStore';
import { getBabies, deleteBaby as deleteBabyApi } from '../api/babyService';

export function useBabies() {
  const { t } = useTranslation();
  const { babies, isLoading, error, setBabies, removeBaby, setIsLoading, setError } =
    useBabyStore();

  useEffect(() => {
    setIsLoading(true);
    getBabies()
      .then(setBabies)
      .catch(() => setError(t('babies.error.loadFailed')))
      .finally(() => setIsLoading(false));
  }, []);

  const deleteBaby = async (id) => {
    removeBaby(id);
    try {
      await deleteBabyApi(id);
    } catch {
      getBabies().then(setBabies).catch(() => {});
    }
  };

  return { babies, isLoading, error, deleteBaby };
}
