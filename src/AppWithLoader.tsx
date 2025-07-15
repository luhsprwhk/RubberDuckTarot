import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

export function AppWithLoader() {
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
