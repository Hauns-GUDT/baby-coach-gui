import { axiosClient } from './axiosClient';

export async function askChat(prompt, babyId, conversationId) {
  const { data } = await axiosClient.post('/chat/ask', { prompt, babyId, conversationId });
  return data; // { answer, conversationId }
}

export async function listConversations(babyId) {
  const params = babyId ? { babyId } : {};
  const { data } = await axiosClient.get('/chat/conversations', { params });
  return data; // [{ id, title, lastMessageAt, createdAt }]
}

export async function getConversationMessages(conversationId) {
  const { data } = await axiosClient.get(`/chat/conversations/${conversationId}/messages`);
  return data; // [{ id, role, content, createdAt }]
}

export async function deleteConversation(conversationId) {
  await axiosClient.delete(`/chat/conversations/${conversationId}`);
}
