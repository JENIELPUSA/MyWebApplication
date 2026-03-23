import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'; // Import your Tailwind CSS here

createRoot(document.getElementById('root')).render(
<<<<<<< HEAD
    <App />
=======
  <StrictMode>
    <App />
  </StrictMode>,
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
)
