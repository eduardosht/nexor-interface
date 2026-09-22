import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PublicApp } from './publicApp';

function bootstrap() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <PublicApp />
    </StrictMode>
  );
}

bootstrap();
