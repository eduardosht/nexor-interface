import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ThemeProvider } from 'styled-components';
import { Contato } from './Contato';
import { lightTheme } from '../../styles/theme';

const fetchMock = vi.hoisted(() => vi.fn());

function renderContato(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ThemeProvider theme={lightTheme}><Contato /></ThemeProvider>
    </MemoryRouter>
  );
}

describe('Contato', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_CONTACT_EMAIL', 'contato@nexoradvance.com.br');
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  });

  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  function fillContact() {
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { name: 'nome', value: 'Maria Cliente' } });
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { name: 'email', value: 'maria@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /assunto/i }));
    fireEvent.click(screen.getByRole('option', { name: /^parcerias$/i }));
    fireEvent.change(screen.getByLabelText(/mensagem/i), { target: { name: 'mensagem', value: 'Mensagem para a Nexor Advance.' } });
  }

  it('aguarda confirmação de envio e bloqueia cliques repetidos', async () => {
    let resolve!: (response: Response) => void;
    fetchMock.mockImplementationOnce(() => new Promise<Response>((done) => { resolve = done; }));
    renderContato();
    fillContact();
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }));
    expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /enviando/i }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/mensagem enviada/i)).not.toBeInTheDocument();
    resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    expect(await screen.findByText(/mensagem enviada/i)).toBeInTheDocument();
  });

  it.each([200, 429])('não mostra sucesso para resposta sem confirmação (%s)', async (status) => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status }));
    renderContato();
    fillContact();
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByText(/mensagem enviada/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar mensagem/i })).toBeEnabled();
    expect(screen.getByLabelText(/mensagem/i)).toHaveValue('Mensagem para a Nexor Advance.');
  });

  it('renderiza heading', () => {
    renderContato();
    expect(screen.getByRole('heading', { name: /fale com/i })).toBeInTheDocument();
  });

  it('renderiza link de email', () => {
    renderContato();
    expect(screen.getByTestId('contact-email')).toHaveAttribute('href', 'mailto:contato@nexoradvance.com.br');
  });

  it('tem id contato para âncora', () => {
    const { container } = renderContato();
    expect(container.querySelector('#contato')).toBeInTheDocument();
  });

  it('preseleciona o assunto LGPD quando a home abre na ancora de contato com query', () => {
    renderContato('/?assunto=lgpd#contato');

    expect(screen.getByText('LGPD', { exact: true })).toBeInTheDocument();
  });

  it('rola para a secao do formulario quando a home abre na ancora de contato', () => {
    const scrollIntoView = vi.fn();
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = scrollIntoView;

    renderContato('/?assunto=lgpd#contato');

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    Element.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('remove numeros do campo nome', () => {
    renderContato();

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'Cliente 456 Teste' },
    });

    expect(screen.getByLabelText(/nome/i)).toHaveValue('Cliente  Teste');
  });

  it('envia o formulário para a API de contato institucional', async () => {
    renderContato();

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { name: 'nome', value: 'Maria Cliente' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { name: 'email', value: 'maria@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /assunto/i }));
    fireEvent.click(screen.getByRole('option', { name: /^parcerias$/i }));
    fireEvent.change(screen.getByLabelText(/mensagem/i), {
      target: { name: 'mensagem', value: 'Gostaria de falar sobre parceria.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }));

    expect(await screen.findByText(/mensagem enviada/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('https://nexor-contact.eduardoshoitifujiwara.workers.dev/v1/contact', expect.objectContaining({ method: 'POST' }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      nome: 'Maria Cliente',
      email: 'maria@example.com',
      assunto: 'parceria',
      mensagem: 'Gostaria de falar sobre parceria.',
      website: '',
    });
  });

  it('mostra erro quando a API de contato falha', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 502 }));
    renderContato();

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { name: 'nome', value: 'Maria Cliente' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { name: 'email', value: 'maria@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /assunto/i }));
    fireEvent.click(screen.getByRole('option', { name: /^parcerias$/i }));
    fireEvent.change(screen.getByLabelText(/mensagem/i), {
      target: { name: 'mensagem', value: 'Gostaria de falar sobre parceria.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }));

    expect(await screen.findByText(/não foi possível enviar/i)).toBeInTheDocument();
  });
});
