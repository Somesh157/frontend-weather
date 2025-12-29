import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WeatherDashboard from './App.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WeatherDashboard />
  </StrictMode>,
)
