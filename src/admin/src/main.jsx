import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './admin-theme.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// El panel se puede instalar como aplicación. El service worker solo se
// registra en producción para no interferir con el servidor de desarrollo.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Sin service worker la app sigue funcionando; solo se pierde el modo offline.
    })
  })
}
