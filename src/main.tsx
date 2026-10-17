import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { InvoiceProvider } from './context/InvoiceContext'
import { ToastProvider } from './components/ui'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <InvoiceProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </InvoiceProvider>
    </BrowserRouter>
  </StrictMode>,
)
