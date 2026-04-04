import { axiosClient } from '../../../shared/api/axiosClient';

export async function getUsers({ page = 1, limit = 20, search = '' } = {}) {
  const params = { page, limit };
  if (search) params.search = search;
  const { data } = await axiosClient.get('/admin/users', { params });
  return data;
}

export async function createUser(payload) {
  const { data } = await axiosClient.post('/admin/users', payload);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await axiosClient.patch(`/admin/users/${id}`, payload);
  return data;
}
