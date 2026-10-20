import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../model/styles/styles.css'
import App from './App.tsx'
import { enableMocking } from '../providers'
import { holdApiUntil } from '@/shared/api'

// Мок-сервер стартует параллельно с первым рендером: ждут его только запросы к API
holdApiUntil(enableMocking())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
