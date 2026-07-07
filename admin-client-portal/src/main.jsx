import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WorkRequestProvider } from "./context/WorkRequestContext";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WorkRequestProvider>
      <App />
    </WorkRequestProvider>
  </StrictMode>
);