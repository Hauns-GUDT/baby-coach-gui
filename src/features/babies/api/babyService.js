import { axiosClient } from '../../../shared/api/axiosClient';

export async function getBabies() {
  const { data } = await axiosClient.get('/babies');
  return data;
}

export async function getBaby(id) {
  const { data } = await axiosClient.get(`/babies/${id}`);
  return data;
}

export async function createBaby(payload) {
  const { data } = await axiosClient.post('/babies', payload);
  return data;
}

export async function updateBaby(id, payload) {
  const { data } = await axiosClient.patch(`/babies/${id}`, payload);
  return data;
}

export async function deleteBaby(id) {
  await axiosClient.delete(`/babies/${id}`);
}
