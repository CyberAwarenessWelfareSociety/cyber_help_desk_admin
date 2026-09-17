import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ContextAPI from './Context/contextAPI.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <ContextAPI>
  <StrictMode>
   
    <App />
    <Toaster position='top-right' reverseOrder={false}/>
  </StrictMode>,
  </ContextAPI>
)
