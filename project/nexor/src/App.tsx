import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { initDesignSystem } from '@nexor/design-system';
import { lightTheme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider } from './hooks/useAuth';
import { router } from './routes/index';
import { queryClient } from './lib/queryClient';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

export function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <GlobalStyles />
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </DesignSystemRoot>
    </ThemeProvider>
  );
}
