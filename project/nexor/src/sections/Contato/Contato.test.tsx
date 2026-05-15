import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { Contato } from './Contato';
import { lightTheme } from '../../styles/theme';

vi.mock('../../config/env', () => ({
  env: {
    contactEmail: 'nexor@nexor.com',
    contactWhatsapp: 'https://wa.me/5511999999999',
  },
}));

describe('Contato', () => {
  it('renderiza heading', () => {
    render(<ThemeProvider theme={lightTheme}><Contato /></ThemeProvider>);
    expect(screen.getByRole('heading', { name: /fale com/i })).toBeInTheDocument();
  });

  it('renderiza link de email', () => {
    render(<ThemeProvider theme={lightTheme}><Contato /></ThemeProvider>);
    expect(screen.getByTestId('contact-email')).toHaveAttribute('href', 'mailto:nexor@nexor.com');
  });

  it('tem id contato para âncora', () => {
    const { container } = render(<ThemeProvider theme={lightTheme}><Contato /></ThemeProvider>);
    expect(container.querySelector('#contato')).toBeInTheDocument();
  });

  it('remove numeros do campo nome', () => {
    render(<ThemeProvider theme={lightTheme}><Contato /></ThemeProvider>);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'Cliente 456 Teste' },
    });

    expect(screen.getByLabelText(/nome/i)).toHaveValue('Cliente  Teste');
  });
});
