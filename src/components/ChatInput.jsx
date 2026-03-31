import { useTranslation } from 'react-i18next';
import { useChatStore } from '../store/useAppStore';

export default function ChatInput() {
  const { t } = useTranslation();
  const { apiUrl, prompt, answer, error, isLoading, setPrompt, setAnswer, setError, setIsLoading } =
    useChatStore();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!prompt.trim()) {
      setError(t('chatbot.error.empty'));
      return;
    }

    setIsLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

      const data = await response.json();
      setAnswer(data.answer ?? data.message ?? JSON.stringify(data, null, 2));
    } catch (requestError) {
      setError(requestError.message || t('chatbot.error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <label className="font-semibold text-gray-700" htmlFor="prompt">
        {t('chatbot.prompt')}
      </label>
      <textarea
        id="prompt"
        rows={5}
        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-base resize-y min-h-30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={t('chatbot.placeholder.prompt')}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-fit bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-xl text-base cursor-pointer"
      >
        {isLoading ? t('chatbot.sending') : t('chatbot.submit')}
      </button>

      {error && (
        <div className="rounded-xl p-3 bg-red-100 text-red-700" role="alert">
          {error}
        </div>
      )}

      {answer && (
        <article className="rounded-xl p-3 bg-cyan-50 text-cyan-800">
          <h2 className="font-semibold mb-2">{t('chatbot.answer')}</h2>
          <pre className="whitespace-pre-wrap m-0">{answer}</pre>
        </article>
      )}
    </form>
  );
}
