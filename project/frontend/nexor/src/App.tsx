import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { initDesignSystem } from '@nexor/design-system';
import { lightTheme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider } from './hooks/useAuth';
import { router } from './routes';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

export function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <AuthProvider>
          <GlobalStyles />
          <RouterProvider router={router} />
        </AuthProvider>
      </DesignSystemRoot>
    </ThemeProvider>
  );
}
