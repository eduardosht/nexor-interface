import type { RouteConfig } from '@react-router/dev/routes';

export default [
  {
    path: '/',
    file: './routes/public-layout.tsx',
    children: [
      { index: true, file: './routes/home.tsx' },
      { path: 'sobre', file: './routes/sobre.tsx' },
      { path: 'biteplaner', file: './routes/biteplaner.tsx' },
      { path: 'conheca-biteplaner', file: './routes/conheca-biteplaner.tsx' },
      { path: 'parceiros', file: './routes/parceiros.tsx' },
      { path: 'privacidade', file: './routes/privacidade.tsx' },
      { path: 'termos', file: './routes/termos.tsx' },
      { path: 'cookies', file: './routes/cookies.tsx' },
    ],
  },
] satisfies RouteConfig;
