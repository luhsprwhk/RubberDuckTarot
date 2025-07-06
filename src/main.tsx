import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';

function AppWithLoader() {
  useEffect(() => {
    // Add loaded class once React has mounted and styles are applied
    const root = document.getElementById('root');
    if (root) {
      // Small delay to ensure styles are loaded
      setTimeout(() => {
        root.classList.add('loaded');
      }, 50);
    }
  }, []);

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithLoader />
  </StrictMode>
);
