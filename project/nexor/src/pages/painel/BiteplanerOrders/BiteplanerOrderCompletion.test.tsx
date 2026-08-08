import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchBiteplanerOrderCompletion,
  submitBiteplanerOrderCompletion,
  uploadCompletionSlotFile,
} from '../../../features/commerce/biteplanerOrderCompletion.api';
import type { BiteplanerCompletionSlot, BiteplanerCompletionSlotKey } from '../../../features/commerce/biteplanerOrderCompletion.types';
import { useAuth } from '../../../hooks/useAuth';
import { theme } from '../../../styles/theme';
import { BiteplanerOrderCompletion } from './BiteplanerOrderCompletion';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../features/commerce/biteplanerOrderCompletion.api', () => ({
  fetchBiteplanerOrderCompletion: vi.fn(),
  submitBiteplanerOrderCompletion: vi.fn(),
  uploadCompletionSlotFile: vi.fn(),
}));

const slot = (slotKey: BiteplanerCompletionSlotKey, attached = false): BiteplanerCompletionSlot => ({
  slotKey,
  label: slotKey === 'two_arches_scan' ? 'Escaneamento 3D das duas arcadas' : slotKey === 'lateral_jig_scan' ? 'Escaneamento 3D lateral com JIG' : 'Imagem da prescrição',
  required: true,
  attachment: attached ? {
    id: `attachment-${slotKey}`,
    fileName: `${slotKey}.stl`,
    mimeType: 'model/stl',
    sizeBytes: 2048,
    status: 'confirmed',
    uploadedAt: '2026-07-22T10:05:00.000Z',
  } : null,
});

const completionResponse = (input: {
  slots?: BiteplanerCompletionSlot[];
  correctionMessage?: string | null;
  canSubmit?: boolean;
} = {}) => ({
  order: { id: 'order-1', status: 'awaiting_order_completion' },
  completion: {
    canSubmit: input.canSubmit ?? true,
    correctionMessage: input.correctionMessage ?? null,
    slots: input.slots ?? [slot('two_arches_scan'), slot('lateral_jig_scan'), slot('prescription_image')],
  },
});

const renderPage = (input: Parameters<typeof completionResponse>[0] = {}) => {
  vi.mocked(fetchBiteplanerOrderCompletion).mockResolvedValueOnce(completionResponse(input));

  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/painel/biteplaner/ordens/order-1/complemento']}>
        <Routes>
          <Route path="/painel/biteplaner/ordens/:orderId/complemento" element={<BiteplanerOrderCompletion />} />
          <Route path="/painel/biteplaner/ordens/:orderId" element={<div>Detalhe da ordem</div>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('BiteplanerOrderCompletion', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ session: { access_token: 'tok' } } as ReturnType<typeof useAuth>);
    vi.mocked(fetchBiteplanerOrderCompletion).mockReset();
    vi.mocked(uploadCompletionSlotFile).mockReset();
    vi.mocked(submitBiteplanerOrderCompletion).mockReset();
  vi.mocked(uploadCompletionSlotFile).mockResolvedValue({ fileRef: { id: 'attachment-1', slotKey: 'two_arches_scan' } });
    vi.mocked(submitBiteplanerOrderCompletion).mockResolvedValue(completionResponse());
  });

  it('renders the three required scan slots in order with the design system upload field', async () => {
    renderPage();

    const slots = await screen.findAllByTestId(/completion-slot-/);
    expect(slots.map((slotElement) => within(slotElement).getByRole('heading').textContent)).toEqual([
      'Escaneamento 3D das duas arcadas',
      'Escaneamento 3D lateral com JIG',
      'Imagem da prescrição',
    ]);
    expect(screen.getAllByText(/arraste e solte o\(s\) arquivo\(s\) para enviar/i)).toHaveLength(3);
  });

  it('blocks submit until all three slots have files', async () => {
    renderPage({ slots: [slot('two_arches_scan', true), slot('lateral_jig_scan', false), slot('prescription_image', false)] });

    expect(await screen.findByRole('button', { name: /enviar complemento/i })).toBeDisabled();
  });

  it('shows the Nexor correction observation when present', async () => {
    renderPage({ correctionMessage: 'Reenvie o registro de mordida.' });

    expect(await screen.findByText(/reenvie o registro de mordida/i)).toBeInTheDocument();
  });

  it('respects backend canSubmit when every slot is complete', async () => {
    renderPage({
      canSubmit: false,
      slots: [slot('two_arches_scan', true), slot('lateral_jig_scan', true), slot('prescription_image', true)],
    });

    expect(await screen.findByRole('button', { name: /enviar complemento/i })).toBeDisabled();
  });
  it('shows attached files inside the upload field and allows removing them locally before replacement', async () => {
    renderPage({
      slots: [slot('two_arches_scan', true), slot('lateral_jig_scan', true), slot('prescription_image', true)],
    });

    const upperSlot = await screen.findByTestId('completion-slot-two_arches_scan');
    expect(within(upperSlot).getByText('two_arches_scan.stl')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar complemento/i })).toBeEnabled();

    fireEvent.click(within(upperSlot).getByRole('button', { name: /remover arquivo two_arches_scan\.stl/i }));

    expect(within(upperSlot).queryByText('two_arches_scan.stl')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar complemento/i })).toBeDisabled();
  });

  it('shows a slot-level error when an upload fails', async () => {
    vi.mocked(uploadCompletionSlotFile).mockRejectedValueOnce(new Error('s3 failed'));
    renderPage({ slots: [slot('two_arches_scan', true), slot('lateral_jig_scan', true), slot('prescription_image', false)] });

    const file = new File(['scan'], 'mordida.stl', { type: 'model/stl' });
    fireEvent.change(await screen.findByLabelText(/imagem da prescrição/i), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /enviar complemento/i }));

    expect(await within(screen.getByTestId('completion-slot-prescription_image')).findByText(/não foi possível enviar este arquivo/i)).toBeInTheDocument();
    expect(submitBiteplanerOrderCompletion).not.toHaveBeenCalled();
  });

  it('clears selected files when navigating to another order completion', async () => {
    vi.mocked(fetchBiteplanerOrderCompletion)
      .mockResolvedValueOnce(completionResponse({
        slots: [slot('two_arches_scan', true), slot('lateral_jig_scan', true), slot('prescription_image', false)],
      }))
      .mockResolvedValueOnce(completionResponse({
        slots: [slot('two_arches_scan', true), slot('lateral_jig_scan', true), slot('prescription_image', false)],
      }));

    function NavigateToSecondOrder() {
      const navigate = useNavigate();
      return <button type="button" onClick={() => navigate('/painel/biteplaner/ordens/order-2/complemento')}>Ir para ordem 2</button>;
    }

    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/painel/biteplaner/ordens/order-1/complemento']}>
          <NavigateToSecondOrder />
          <Routes>
            <Route path="/painel/biteplaner/ordens/:orderId/complemento" element={<BiteplanerOrderCompletion />} />
            <Route path="/painel/biteplaner/ordens/:orderId" element={<div>Detalhe da ordem</div>} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    );

    const file = new File(['scan'], 'mordida.stl', { type: 'model/stl' });
    fireEvent.change(await screen.findByLabelText(/imagem da prescrição/i), { target: { files: [file] } });
    expect(screen.getByRole('button', { name: /enviar complemento/i })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /ir para ordem 2/i }));

    await waitFor(() => {
      expect(fetchBiteplanerOrderCompletion).toHaveBeenLastCalledWith('order-2', 'tok');
    });
    expect(await screen.findByRole('button', { name: /enviar complemento/i })).toBeDisabled();
  });
  it('uploads selected files and submits the completion', async () => {
    renderPage({ slots: [slot('two_arches_scan', true), slot('lateral_jig_scan', true), slot('prescription_image', false)] });

    const file = new File(['scan'], 'mordida.stl', { type: 'model/stl' });
    fireEvent.change(await screen.findByLabelText(/imagem da prescrição/i), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /enviar complemento/i }));

    await waitFor(() => {
      expect(uploadCompletionSlotFile).toHaveBeenCalledWith({
        orderId: 'order-1',
        slotKey: 'prescription_image',
        file,
        token: 'tok',
      });
    });
    expect(submitBiteplanerOrderCompletion).toHaveBeenCalledWith('order-1', 'tok');
    expect(await screen.findByText('Detalhe da ordem')).toBeInTheDocument();
  });
});
