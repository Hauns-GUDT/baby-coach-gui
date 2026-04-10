import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { askChat, listConversations, getConversationMessages, deleteConversation } from '../api/chatService';
import { useBabyStore } from '../../babies/store/useBabyStore';
import { useSleepPrediction } from '../hooks/useSleepPrediction';
import { SCREEN_HOME, SCREEN_ANSWER } from '../constants';
import AiDrawerHeader from './AiDrawerHeader';
import AiHomeScreen from './AiHomeScreen';
import AiAnswerScreen from './AiAnswerScreen';
import AiInputBar from './AiInputBar';

export default function AiAssistantDrawer({ isOpen, onClose }) {
  const { t } = useTranslation();
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const { prediction, isLoading: isSleepLoading, errorKey, fetchPrediction, reset: resetPrediction } = useSleepPrediction();

  const [screen, setScreen]                             = useState(SCREEN_HOME);
  const [isChatLoading, setIsChatLoading]               = useState(false);
  const [chatError, setChatError]                       = useState(null);
  const [inputValue, setInputValue]                     = useState('');
  // 'chat' | 'prediction' — which kind of result is on screen 2
  const [answerMode, setAnswerMode]                     = useState('chat');

  const [messages, setMessages]                         = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversations, setConversations]               = useState([]);
  const [isHistoryLoading, setIsHistoryLoading]         = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load recent conversations when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    listConversations(selectedBabyId)
      .then(setConversations)
      .catch(() => setConversations([]));
  }, [isOpen, selectedBabyId]);

  const resetAnswerState = () => {
    setChatError(null);
    resetPrediction();
  };

  const handleClose = () => {
    resetAnswerState();
    setInputValue('');
    setScreen(SCREEN_HOME);
    onClose();
  };

  const continueConversation = async (conversationId) => {
    setActiveConversationId(conversationId);
    setIsHistoryLoading(true);
    setAnswerMode('chat');
    setScreen(SCREEN_ANSWER);
    try {
      const history = await getConversationMessages(conversationId);
      setMessages(history);
    } catch {
      setMessages([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      // Reset screen if currently viewing the deleted conversation
      if (activeConversationId === conversationId) {
        setMessages([]);
        setActiveConversationId(null);
        setScreen(SCREEN_HOME);
      }
    } catch {
      // silently ignore — conversation list will refresh on next open
    }
  };

  const sendChatPrompt = async (prompt, displayQuestion) => {
    setChatError(null);
    setAnswerMode('chat');
    setScreen(SCREEN_ANSWER);

    // Optimistically append user message so the UI responds immediately
    setMessages((prev) => [...prev, {
      id: `local-${Date.now()}`,
      role: 'user',
      content: displayQuestion || prompt,
      createdAt: new Date().toISOString(),
    }]);
    setIsChatLoading(true);

    try {
      const { answer, conversationId } = await askChat(prompt, selectedBabyId, activeConversationId);
      setActiveConversationId(conversationId);
      setMessages((prev) => [...prev, {
        id: `local-${Date.now() + 1}`,
        role: 'assistant',
        content: answer,
        createdAt: new Date().toISOString(),
      }]);
    } catch {
      setChatError(t('chatbot.error.generic'));
    } finally {
      setIsChatLoading(false);
    }
  };

  // Sleep quick action — uses the full algorithm + optional AI pipeline
  const handleSleepQuickAction = () => {
    resetAnswerState();
    setAnswerMode('prediction');
    setScreen(SCREEN_ANSWER);
    fetchPrediction();
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    sendChatPrompt(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBack = () => {
    if (screen === SCREEN_ANSWER) {
      resetAnswerState();
      setScreen(SCREEN_HOME);
    }
  };

  const placeholder = screen === SCREEN_ANSWER
    ? t('aiAssistant.placeholderFollowUp')
    : t('aiAssistant.placeholder');

  const isAnswerLoading = answerMode === 'prediction' ? isSleepLoading : isChatLoading;
  const answerError     = answerMode === 'prediction' && errorKey ? t(errorKey) : chatError;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-40" onClick={handleClose} />}

      {/* h-[72vh] (not just max-h) so flex-1 on the viewport has a defined parent height to fill */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-blue-grey-50 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out h-[72vh] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <AiDrawerHeader
          screen={screen}
          backLabel={t('aiAssistant.back')}
          onBack={handleBack}
          onClose={handleClose}
        />

        {/* Screen switcher — render only the active screen */}
        <div className="flex-1 min-h-0">
          {screen === SCREEN_HOME && (
            <AiHomeScreen
              conversations={conversations}
              onSleepQuickAction={handleSleepQuickAction}
              onContinueConversation={continueConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          )}
          {screen === SCREEN_ANSWER && (
            <AiAnswerScreen
              answerMode={answerMode}
              messages={messages}
              prediction={prediction}
              isSleepLoading={isSleepLoading}
              isChatLoading={isChatLoading}
              isHistoryLoading={isHistoryLoading}
              errorKey={errorKey}
              chatError={chatError}
              messagesEndRef={messagesEndRef}
              isAnswerLoading={isAnswerLoading}
              answerError={answerError}
            />
          )}
        </div>

        <AiInputBar
          inputValue={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
          placeholder={placeholder}
          isChatLoading={isChatLoading}
        />
      </div>
    </>
  );
}
