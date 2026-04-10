import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { askChat, listConversations, getConversationMessages, deleteConversation } from '../api/chatService';
import { useBabyStore } from '../../babies/store/useBabyStore';
import { useSleepPrediction } from '../hooks/useSleepPrediction';
import { TOPICS, SCREEN_HOME, SCREEN_TOPIC, SCREEN_ANSWER } from '../constants';
import AiDrawerHeader from './AiDrawerHeader';
import AiHomeScreen from './AiHomeScreen';
import AiTopicScreen from './AiTopicScreen';
import AiAnswerScreen from './AiAnswerScreen';
import AiInputBar from './AiInputBar';

export default function AiAssistantDrawer({ isOpen, onClose }) {
  const { t } = useTranslation();
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const { prediction, isLoading: isSleepLoading, errorKey, fetchPrediction, reset: resetPrediction } = useSleepPrediction();

  const [screen, setScreen]                             = useState(SCREEN_HOME);
  const [activeTopic, setActiveTopic]                   = useState(null);
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
    setActiveTopic(null);
    onClose();
  };

  const goHome = () => {
    resetAnswerState();
    setActiveTopic(null);
    setScreen(SCREEN_HOME);
  };

  const goToTopic = (key) => {
    resetAnswerState();
    setActiveTopic(key);
    setScreen(SCREEN_TOPIC);
  };

  const continueConversation = async (conversationId) => {
    setActiveConversationId(conversationId);
    setIsHistoryLoading(true);
    setAnswerMode('chat');
    setActiveTopic(null);
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

  // Used for topic questions and free-text input
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
    setActiveTopic(null);
    setScreen(SCREEN_ANSWER);
    fetchPrediction();
  };

  // Feeding quick action — uses chat (no dedicated algorithm yet)
  const handleFeedingQuickAction = () => {
    sendChatPrompt(
      t('aiAssistant.quickActions.feeding.prompt'),
      t('aiAssistant.quickActions.feeding.question'),
    );
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
    if (screen === SCREEN_TOPIC) { goHome(); return; }
    if (screen === SCREEN_ANSWER) {
      resetAnswerState();
      setScreen(activeTopic ? SCREEN_TOPIC : SCREEN_HOME);
    }
  };

  const backLabel = screen === SCREEN_ANSWER && activeTopic
    ? t(`aiAssistant.topics.${activeTopic}.label`)
    : t('aiAssistant.back');

  const placeholder = screen === SCREEN_ANSWER
    ? t('aiAssistant.placeholderFollowUp')
    : screen === SCREEN_TOPIC && activeTopic
      ? t('aiAssistant.placeholderTopic', { topic: t(`aiAssistant.topics.${activeTopic}.label`).toLowerCase() })
      : t('aiAssistant.placeholder');

  const topicData = TOPICS.find((tp) => tp.key === activeTopic);
  const topicQuestions = activeTopic
    ? t(`aiAssistant.topics.${activeTopic}.questions`, { returnObjects: true })
    : [];

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
          backLabel={backLabel}
          onBack={handleBack}
          onClose={handleClose}
        />

        {/* Screen switcher — render only the active screen */}
        <div className="flex-1 min-h-0">
          {screen === SCREEN_HOME && (
            <AiHomeScreen
              conversations={conversations}
              onSleepQuickAction={handleSleepQuickAction}
              onFeedingQuickAction={handleFeedingQuickAction}
              onGoToTopic={goToTopic}
              onContinueConversation={continueConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          )}
          {screen === SCREEN_TOPIC && (
            <AiTopicScreen
              activeTopic={activeTopic}
              topicData={topicData}
              topicQuestions={topicQuestions}
              onSendQuestion={sendChatPrompt}
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
              activeTopic={activeTopic}
              messagesEndRef={messagesEndRef}
              isAnswerLoading={isAnswerLoading}
              answerError={answerError}
              onMoreQuestions={() => { resetAnswerState(); setScreen(SCREEN_TOPIC); }}
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
