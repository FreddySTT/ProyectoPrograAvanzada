import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// BLINDAJE DE SEGURIDAD ZERO-STORAGE: Destruir de inmediato cualquier residuo
if (typeof window !== 'undefined') {
  try {
    if (window.localStorage) {
      window.localStorage.clear();
      window.localStorage.setItem = () => {};
    }
    if (window.sessionStorage) {
      window.sessionStorage.clear();
      window.sessionStorage.setItem = () => {};
    }
  } catch (e) {
    console.warn("Storage wipe on init:", e);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// REGISTRO DE SERVICE WORKER PWA (Offline & Cache)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('✅ ServiceWorker PWA registrado con éxito:', reg.scope);
      })
      .catch((err) => {
        console.warn('⚠️ Error al registrar ServiceWorker PWA:', err);
      });
  });
}

