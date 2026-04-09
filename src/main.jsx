import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n/index.js';
import './styles.css';

// Apply saved theme before first render to prevent flash
;(function () {
  const mode = localStorage.getItem('themeMode') ?? 'auto';
  let dark;
  if (mode === 'dark') {
    dark = true;
  } else if (mode === 'light') {
    dark = false;
  } else {
    // Auto: simple time-based fallback (geo runs later in the store)
    const h = new Date().getHours() + new Date().getMinutes() / 60;
    dark = h < 7 || h >= 20;
  }
  document.documentElement.classList.toggle('dark', dark);
}());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
