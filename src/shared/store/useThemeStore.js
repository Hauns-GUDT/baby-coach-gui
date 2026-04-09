import { create } from 'zustand';

// Approximate sunrise/sunset using solar angle formula (no external dep)
function getSunTimes(lat, lon, date = new Date()) {
  const rad = Math.PI / 180;
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 86_400_000
  );
  // Solar declination
  const decl = -23.45 * Math.cos(rad * (360 / 365) * (dayOfYear + 10));
  // Hour angle at horizon
  const cosH =
    (Math.sin(rad * -0.83) - Math.sin(rad * lat) * Math.sin(rad * decl)) /
    (Math.cos(rad * lat) * Math.cos(rad * decl));

  // Sun never rises or sets (polar extremes)
  if (cosH < -1) return { sunrise: 0, sunset: 24 };   // always day
  if (cosH > 1)  return { sunrise: 12, sunset: 12 };  // always night

  const H = Math.acos(cosH) / rad;
  // Equation of time correction (minutes)
  const B = rad * (360 / 365) * (dayOfYear - 81);
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const solarNoon = 12 - lon / 15 - eot / 60 - (date.getTimezoneOffset() / 60);
  return {
    sunrise: solarNoon - H / 15,
    sunset:  solarNoon + H / 15,
  };
}

function shouldBeDark(mode, geo) {
  if (mode === 'dark')  return true;
  if (mode === 'light') return false;

  // Auto: use geo + solar formula if available, else simple time window
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;

  if (geo) {
    const { sunrise, sunset } = getSunTimes(geo.lat, geo.lon, now);
    return h < sunrise || h >= sunset;
  }

  // Fallback: dark before 7am or after 8pm
  return h < 7 || h >= 20;
}

const savedMode = localStorage.getItem('themeMode') ?? 'auto'; // light | dark | auto

export const useThemeStore = create((set, get) => {
  let geoCoords = null;
  let intervalId = null;

  // Request geolocation once if mode is or becomes auto
  function requestGeo() {
    if (!navigator.geolocation || geoCoords) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        geoCoords = { lat: coords.latitude, lon: coords.longitude };
        applyTheme(get().mode);
      },
      () => { /* denied — fall back to time-only */ }
    );
  }

  function applyTheme(mode) {
    const isDark = shouldBeDark(mode, geoCoords);
    document.documentElement.classList.toggle('dark', isDark);
    set({ isDark });
  }

  function startInterval() {
    if (intervalId) return;
    // Re-evaluate every 5 minutes for auto mode
    intervalId = setInterval(() => {
      const { mode } = get();
      if (mode === 'auto') applyTheme(mode);
    }, 5 * 60_000);
  }

  // Init — main.jsx already applied the class before render; just sync state
  // and kick off geo/interval for auto mode
  const initialIsDark = shouldBeDark(savedMode, null);
  if (savedMode === 'auto') { requestGeo(); startInterval(); }

  return {
    mode: savedMode,
    isDark: initialIsDark,

    setMode: (mode) => {
      localStorage.setItem('themeMode', mode);
      applyTheme(mode);
      set({ mode });
      if (mode === 'auto') {
        requestGeo();
        startInterval();
      } else {
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
      }
    },
  };
});
