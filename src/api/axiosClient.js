import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach access token to every request
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401: attempt silent refresh, then retry once
let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  refreshQueue = [];
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Don't retry refresh calls or already-retried requests
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url === '/auth/refresh'
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return axiosClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axiosClient.post('/auth/refresh');
      const newToken = data.accessToken;

      // Decode username from JWT payload
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      useAuthStore.getState().setAuth(newToken, payload.username);

      processQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return axiosClient(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
