import { RouterProvider } from 'react-router-dom';
import { initDesignSystem } from '@nexor/design-system';
import { ThemeProvider } from 'styled-components';
import { publicRouter } from './routes/publicRouter';
import { GlobalStyles } from './styles/GlobalStyles';
import { lightTheme } from './styles/theme';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

export function PublicApp() {
  return (
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <GlobalStyles />
        <RouterProvider router={publicRouter} />
      </DesignSystemRoot>
    </ThemeProvider>
  );
}
