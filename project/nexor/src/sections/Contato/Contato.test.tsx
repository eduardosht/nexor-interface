import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { Contato } from './Contato';
import { lightTheme } from '../../styles/theme';

const apiPost = vi.hoisted(() => vi.fn());

vi.mock('../../lib/api', () => ({
  api: {
    post: apiPost,
  },
}));

vi.mock('../../config/env', () => ({
  env: {
    contactEmail: 'nexor@nexor.com',
    contactWhatsapp: 'https://wa.me/5511999999999',
  },
}));

describe('Contato', () => {
  beforeEach(() => {
    apiPost.mockReset();
    apiPost.mockResolvedValue({ ok: true });
  });

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

  it('envia o formulário para a API de contato institucional', async () => {
    render(<ThemeProvider theme={lightTheme}><Contato /></ThemeProvider>);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { name: 'nome', value: 'Maria Cliente' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { name: 'email', value: 'maria@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /assunto/i }));
    fireEvent.click(screen.getByRole('option', { name: /parceria comercial/i }));
    fireEvent.change(screen.getByLabelText(/mensagem/i), {
      target: { name: 'mensagem', value: 'Gostaria de falar sobre parceria.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }));

    expect(await screen.findByText(/mensagem enviada/i)).toBeInTheDocument();
    expect(apiPost).toHaveBeenCalledWith('/v1/contact', {
      nome: 'Maria Cliente',
      email: 'maria@example.com',
      assunto: 'parceria',
      mensagem: 'Gostaria de falar sobre parceria.',
    });
  });

  it('mostra erro quando a API de contato falha', async () => {
    apiPost.mockRejectedValueOnce(new Error('Falha'));
    render(<ThemeProvider theme={lightTheme}><Contato /></ThemeProvider>);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { name: 'nome', value: 'Maria Cliente' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { name: 'email', value: 'maria@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /assunto/i }));
    fireEvent.click(screen.getByRole('option', { name: /parceria comercial/i }));
    fireEvent.change(screen.getByLabelText(/mensagem/i), {
      target: { name: 'mensagem', value: 'Gostaria de falar sobre parceria.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }));

    expect(await screen.findByText(/não foi possível enviar/i)).toBeInTheDocument();
  });
});
