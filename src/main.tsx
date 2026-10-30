import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// BLINDAJE DE SEGURIDAD TOTAL: Destruir de inmediato cualquier residuo de localStorage
if (typeof window !== 'undefined') {
  try {
    localStorage.clear();
  } catch (e) {
    console.warn("Storage wipe on init:", e);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
