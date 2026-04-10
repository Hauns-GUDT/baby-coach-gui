import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../../shared/components/design/Button';

export default function AiInputBar({ inputValue, onChange, onKeyDown, onSend, placeholder, isChatLoading }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-blue-grey-100 dark:border-navy-600 shrink-0">
      <input
        type="text"
        value={inputValue}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="flex-1 text-sm bg-blue-grey-100 dark:bg-navy-700 dark:text-navy-50 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-twilight-indigo-300 dark:focus:ring-twilight-indigo-500 placeholder:text-blue-grey-400 dark:placeholder:text-navy-200"
      />
      <Button
        onClick={onSend}
        variant="primary"
        aria-label={t('aiAssistant.send')}
        disabled={!inputValue.trim() || isChatLoading}
      >
        <Send size={15} />
      </Button>
    </div>
  );
}
