import './global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import ErrorBoundary from '@/components/ErrorBoundary';
import Providers from '@/providers.tsx';
import Router from '@/router.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Providers>
          <Router />
        </Providers>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
