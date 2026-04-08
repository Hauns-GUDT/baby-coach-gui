import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AiInputBar({ inputValue, onChange, onKeyDown, onSend, placeholder, isChatLoading }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-blue-grey-100 shrink-0">
      <input
        type="text"
        value={inputValue}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="flex-1 text-sm bg-blue-grey-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-twilight-indigo-300 placeholder:text-blue-grey-400"
      />
      <button
        onClick={onSend}
        aria-label={t('aiAssistant.send')}
        disabled={!inputValue.trim() || isChatLoading}
        className="w-9 h-9 rounded-full bg-twilight-indigo-600 text-white flex items-center justify-center hover:bg-twilight-indigo-700 active:scale-95 transition-all disabled:opacity-40"
      >
        <Send size={15} />
      </button>
    </div>
  );
}
