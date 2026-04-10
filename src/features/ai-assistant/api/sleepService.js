import { axiosClient } from "../../../shared/api/axiosClient";

const SLEEP_API_URL = '/api/sleep';

export async function getSleepData() {
  const { data } = await axiosClient.get(SLEEP_API_URL);
  return data;
}

export async function getPrediction(babyId) {
  // Send client's UTC offset so the backend can correctly classify NAP vs BEDTIME in local time
  const utcOffset = -new Date().getTimezoneOffset();
  const { data } = await axiosClient.get(`/babies/${babyId}/prediction`, { params: { utcOffset } });
  return data;
}
