import { useEffect } from 'react';
import { useEventVersion } from '../store/useEventVersion';

const POLL_INTERVAL_MS = 15_000;

/**
 * Bumps eventVersion every 15 seconds while the tab is visible.
 * Pauses when the tab is hidden, resumes and immediately refetches when visible again.
 * Mount once in ProtectedRoute so all authenticated pages benefit.
 */
export function useEventPolling() {
  const bumpEventVersion = useEventVersion((s) => s.bumpEventVersion);

  useEffect(() => {
    let intervalId = null;

    const start = () => {
      if (intervalId !== null) return;
      intervalId = setInterval(bumpEventVersion, POLL_INTERVAL_MS);
    };

    const stop = () => {
      clearInterval(intervalId);
      intervalId = null;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        bumpEventVersion(); // catch up on changes while hidden
        start();
      } else {
        stop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (document.visibilityState === 'visible') {
      start();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stop();
    };
  }, [bumpEventVersion]);
}
