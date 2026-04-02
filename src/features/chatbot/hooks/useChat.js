import { useTranslation } from 'react-i18next';
import { useChatStore } from '../store/useChatStore';
import { sendMessage } from '../api/chatService';

export function useChat() {
  const { t } = useTranslation();
  const { apiUrl, prompt, answer, error, isLoading, setPrompt, setAnswer, setError, setIsLoading } =
    useChatStore();

  const submit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError(t('chatbot.error.empty'));
      return;
    }

    setIsLoading(true);
    setError('');
    setAnswer('');

    try {
      const result = await sendMessage(apiUrl, prompt);
      setAnswer(result);
    } catch (err) {
      setError(err.message || t('chatbot.error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return { prompt, answer, error, isLoading, setPrompt, submit };
}
