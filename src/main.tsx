import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppWithLoader } from './AppWithLoader.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithLoader />
  </StrictMode>
);
