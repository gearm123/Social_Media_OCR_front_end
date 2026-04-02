import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import PayCheckoutPage from './PayCheckoutPage.tsx'
import './index.css'

const isPayRoute = /^\/pay\/?$/i.test(window.location.pathname)

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isPayRoute ? <PayCheckoutPage /> : <App />}</StrictMode>,
)
