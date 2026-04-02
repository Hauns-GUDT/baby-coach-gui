import { axiosClient } from './axiosClient';

const SLEEP_API_URL = '/api/sleep';

export async function getSleepData() {
  const { data } = await axiosClient.get(SLEEP_API_URL);
  return data;
}
