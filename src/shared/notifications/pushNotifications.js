import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { registerDeviceToken } from '../api/notificationService';

/**
 * Initialise push notifications after login.
 * No-op when running in a regular browser — only active inside the native app.
 */
export async function initPushNotifications() {
  if (!Capacitor.isNativePlatform()) return;

  const { receive } = await PushNotifications.requestPermissions();
  if (receive !== 'granted') return;

  await PushNotifications.register();

  // Send FCM/APNs token to backend so it can send pushes to this device
  PushNotifications.addListener('registration', ({ value: token }) => {
    registerDeviceToken({ token, platform: Capacitor.getPlatform() });
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.error('Push registration failed:', err);
  });

  // Foreground: notification arrives while app is open
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.info('Push received in foreground:', notification.title);
    // The web app's own UI handles this — no native banner shown in foreground
  });

  // Background/killed: user taps the notification
  PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
    const { deepLink } = notification.data ?? {};
    if (deepLink && window.location.pathname !== deepLink) {
      window.location.href = deepLink;
    }
  });
}
