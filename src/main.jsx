import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './vendor/sneat/assets/vendor/css/core.css'
import './vendor/sneat/assets/vendor/css/theme-default.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
