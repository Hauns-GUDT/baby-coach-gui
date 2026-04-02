import { useTranslation } from 'react-i18next';
import { useChatStore } from '../store/useChatStore';
import ChatInput from '../components/ChatInput';

export default function ChatBot() {
  const { t } = useTranslation();
  const { apiUrl, setApiUrl } = useChatStore();

  return (
    <main className="min-h-[calc(100vh-65px)] grid place-items-center p-6">
      <section className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">{t('chatbot.title')}</h1>
        <p className="text-zinc-500 mb-6">{t('chatbot.subtitle')}</p>

        <div className="grid gap-3 mb-6">
          <label className="font-semibold text-zinc-700" htmlFor="apiUrl">
            {t('chatbot.apiUrl')}
          </label>
          <input
            id="apiUrl"
            className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder={t('chatbot.placeholder.url')}
          />
        </div>

        <ChatInput />
      </section>
    </main>
  );
}
