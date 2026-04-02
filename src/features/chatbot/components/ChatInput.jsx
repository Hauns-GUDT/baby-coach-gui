import { useTranslation } from 'react-i18next';
import { useChat } from '../hooks/useChat';

export default function ChatInput() {
  const { t } = useTranslation();
  const { prompt, answer, error, isLoading, setPrompt, submit } = useChat();

  return (
    <form onSubmit={submit} className="grid gap-3">
      <label className="font-semibold text-zinc-700" htmlFor="prompt">
        {t('chatbot.prompt')}
      </label>
      <textarea
        id="prompt"
        rows={5}
        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-base resize-y min-h-30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
        <div className="rounded-xl p-3 bg-rose-50 text-rose-700" role="alert">
          {error}
        </div>
      )}

      {answer && (
        <article className="rounded-xl p-3 bg-indigo-50 text-indigo-900">
          <h2 className="font-semibold mb-2">{t('chatbot.answer')}</h2>
          <pre className="whitespace-pre-wrap m-0">{answer}</pre>
        </article>
      )}
    </form>
  );
}
