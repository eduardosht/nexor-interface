// project/frontend/nexor/src/mocks/server.ts
import { createServer, type Server } from 'miragejs';
import { authHandlers } from './handlers/auth';
import { productHandlers } from './handlers/products';
import { orderHandlers } from './handlers/orders';
import { partnerHandlers } from './handlers/partner';
import { contactHandlers } from './handlers/contact';
import { cepHandlers } from './handlers/cep';
import { reportHandlers } from './handlers/reports';
import { resetDemoState } from './demoState';

let activeMockServer: Server | null = null;

export function startMockServer() {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const urlPrefix = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

  resetDemoState();
  activeMockServer?.shutdown();

  activeMockServer = createServer({
    environment: 'development',
    routes() {
      this.urlPrefix = urlPrefix;
      this.namespace = '';
      this.timing = 1000;

      authHandlers(this);
      productHandlers(this);
      orderHandlers(this);
      partnerHandlers(this);
      contactHandlers(this);
      cepHandlers(this);
      reportHandlers(this);

      this.passthrough('https://*.supabase.co/**');
      this.passthrough();
    }
  });

  return activeMockServer;
}
