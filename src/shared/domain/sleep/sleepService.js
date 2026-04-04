import { axiosClient } from '../../api/axiosClient';

const SLEEP_API_URL = '/api/sleep';

export async function getSleepData() {
  const { data } = await axiosClient.get(SLEEP_API_URL);
  return data;
}

export async function getPrediction(babyId) {
  const { data } = await axiosClient.get(`/babies/${babyId}/prediction`);
  return data;
}
