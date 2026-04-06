import { axiosClient } from './axiosClient';

export async function askChat(prompt) {
  const { data } = await axiosClient.post('/chat/ask', { prompt });
  return data.answer;
}
