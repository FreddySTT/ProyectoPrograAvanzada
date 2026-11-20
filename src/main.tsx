import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Limpieza de caches de Service Worker desactualizados
if (typeof window !== 'undefined' && 'caches' in window) {
  try {
    caches.keys().then((names) => {
      names.forEach((name) => {
        if (name !== 'riqsi-rutas-v4' && name !== 'riqsi-api-v4') {
          caches.delete(name);
        }
      });
    });
  } catch {}
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// REGISTRO DE SERVICE WORKER PWA (Offline & Cache)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Forzar actualización inmediata para evitar quedarse en versiones viejas
        reg.update();
        console.log('✅ ServiceWorker PWA registrado con éxito:', reg.scope);
      })
      .catch((err) => {
        console.warn('⚠️ Error al registrar ServiceWorker PWA:', err);
      });
  });
}

