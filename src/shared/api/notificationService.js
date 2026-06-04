import { axiosClient } from './axiosClient';

/**
 * Register a device push token with the backend.
 * Called once after login when running inside the native app.
 *
 * @param {{ token: string, platform: 'ios' | 'android' }} params
 */
export async function registerDeviceToken({ token, platform }) {
  await axiosClient.post('/devices/register', { token, platform });
}
