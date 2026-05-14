import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

async function bootstrap() {
  if (import.meta.env.VITE_MOCK === 'true') {
    const { startMockServer } = await import('./mocks/server');
    startMockServer();
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

void bootstrap();
