import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '../api/authService';
import { useAuthStore } from '../store/useAuthStore';

export function useLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (credentials) => {
    setError('');
    setIsSubmitting(true);
    try {
      const { accessToken, username } = await login(credentials);
      setAuth(accessToken, username);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.status === 401 ? t('auth.error.invalid') : t('auth.error.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, error, isSubmitting };
}
