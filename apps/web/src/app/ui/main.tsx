import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../model/styles/styles.css'
import App from './App.tsx'
import { enableMocking } from '../providers'

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
