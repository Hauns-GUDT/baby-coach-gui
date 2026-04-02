import { axiosClient } from '../../../shared/api/axiosClient';

export async function sendMessage(url, prompt) {
  const { data } = await axiosClient.post(url, { prompt });
  return data.answer ?? data.message ?? JSON.stringify(data, null, 2);
}
