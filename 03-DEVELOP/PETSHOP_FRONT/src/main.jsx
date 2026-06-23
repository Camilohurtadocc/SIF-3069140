import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthContext'

// Diagnostic logs: helpful to know whether main.jsx is executed in the browser
console.log('[main.jsx] loaded')
try {
  const rootEl = document.getElementById('root')
  console.log('[main.jsx] root element:', rootEl)
  if (!rootEl) throw new Error('Elemento #root no encontrado')

  createRoot(rootEl).render(
    <React.StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <App />
          <ToastContainer position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </React.StrictMode>
  )
} catch (err) {
  // Mantener visible el error en la consola para diagnóstico
  // eslint-disable-next-line no-console
  console.error('[main.jsx] Error al montar la app:', err)
}
