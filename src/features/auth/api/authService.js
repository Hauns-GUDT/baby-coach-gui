import { axiosClient } from '../../../shared/api/axiosClient';

function parseJwtUsername(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username ?? null;
  } catch {
    return null;
  }
}

export async function login(credentials) {
  const { data } = await axiosClient.post('/auth/login', credentials);
  return { accessToken: data.accessToken, username: parseJwtUsername(data.accessToken) };
}

export async function logout() {
  await axiosClient.post('/auth/logout');
}

export async function refresh() {
  const { data } = await axiosClient.post('/auth/refresh');
  return { accessToken: data.accessToken, username: parseJwtUsername(data.accessToken) };
}

export async function register(data) {
  await axiosClient.post('/auth/register', data);
}
