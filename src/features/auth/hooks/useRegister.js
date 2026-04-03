import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register } from '../api/authService';
import { parseApiError } from '../../../shared/utils/parseApiError';

export function useRegister() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (data) => {
    setError('');
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await register(data);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const { fieldErrors: fe, code } = parseApiError(err);
      if (fe && Object.keys(fe).length > 0) {
        const translated = {};
        for (const [field, errorCode] of Object.entries(fe)) {
          translated[field] = t(`validation.${errorCode}`, t('validation.fallback'));
        }
        setFieldErrors(translated);
      } else if (code) {
        setError(t(`validation.${code}`, t('registration.error.generic')));
      } else {
        setError(t('registration.error.generic'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, error, fieldErrors, isSubmitting };
}
