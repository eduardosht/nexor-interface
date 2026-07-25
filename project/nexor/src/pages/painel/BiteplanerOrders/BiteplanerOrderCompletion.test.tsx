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
  label: slotKey === 'upper_scan' ? 'Scan superior' : slotKey === 'lower_scan' ? 'Scan inferior' : 'Registro de mordida',
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
    slots: input.slots ?? [slot('upper_scan'), slot('lower_scan'), slot('bite_registration')],
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
    vi.mocked(uploadCompletionSlotFile).mockResolvedValue({ fileRef: { id: 'attachment-1', slotKey: 'upper_scan' } });
    vi.mocked(submitBiteplanerOrderCompletion).mockResolvedValue(completionResponse());
  });

  it('renders the three required scan slots in order with the design system upload field', async () => {
    renderPage();

    const slots = await screen.findAllByTestId(/completion-slot-/);
    expect(slots.map((slotElement) => within(slotElement).getByRole('heading').textContent)).toEqual([
      'Scan superior',
      'Scan inferior',
      'Registro de mordida',
    ]);
    expect(screen.getAllByText(/arraste e solte o\(s\) arquivo\(s\) para enviar/i)).toHaveLength(3);
  });

  it('blocks submit until all three slots have files', async () => {
    renderPage({ slots: [slot('upper_scan', true), slot('lower_scan', false), slot('bite_registration', false)] });

    expect(await screen.findByRole('button', { name: /enviar complemento/i })).toBeDisabled();
  });

  it('shows the Nexor correction observation when present', async () => {
    renderPage({ correctionMessage: 'Reenvie o registro de mordida.' });

    expect(await screen.findByText(/reenvie o registro de mordida/i)).toBeInTheDocument();
  });

  it('respects backend canSubmit when every slot is complete', async () => {
    renderPage({
      canSubmit: false,
      slots: [slot('upper_scan', true), slot('lower_scan', true), slot('bite_registration', true)],
    });

    expect(await screen.findByRole('button', { name: /enviar complemento/i })).toBeDisabled();
  });
  it('shows attached files inside the upload field and allows removing them locally before replacement', async () => {
    renderPage({
      slots: [slot('upper_scan', true), slot('lower_scan', true), slot('bite_registration', true)],
    });

    const upperSlot = await screen.findByTestId('completion-slot-upper_scan');
    expect(within(upperSlot).getByText('upper_scan.stl')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar complemento/i })).toBeEnabled();

    fireEvent.click(within(upperSlot).getByRole('button', { name: /remover arquivo upper_scan\.stl/i }));

    expect(within(upperSlot).queryByText('upper_scan.stl')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar complemento/i })).toBeDisabled();
  });

  it('shows a slot-level error when an upload fails', async () => {
    vi.mocked(uploadCompletionSlotFile).mockRejectedValueOnce(new Error('s3 failed'));
    renderPage({ slots: [slot('upper_scan', true), slot('lower_scan', true), slot('bite_registration', false)] });

    const file = new File(['scan'], 'mordida.stl', { type: 'model/stl' });
    fireEvent.change(await screen.findByLabelText(/registro de mordida/i), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /enviar complemento/i }));

    expect(await within(screen.getByTestId('completion-slot-bite_registration')).findByText(/não foi possível enviar este arquivo/i)).toBeInTheDocument();
    expect(submitBiteplanerOrderCompletion).not.toHaveBeenCalled();
  });

  it('clears selected files when navigating to another order completion', async () => {
    vi.mocked(fetchBiteplanerOrderCompletion)
      .mockResolvedValueOnce(completionResponse({
        slots: [slot('upper_scan', true), slot('lower_scan', true), slot('bite_registration', false)],
      }))
      .mockResolvedValueOnce(completionResponse({
        slots: [slot('upper_scan', true), slot('lower_scan', true), slot('bite_registration', false)],
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
    fireEvent.change(await screen.findByLabelText(/registro de mordida/i), { target: { files: [file] } });
    expect(screen.getByRole('button', { name: /enviar complemento/i })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /ir para ordem 2/i }));

    await waitFor(() => {
      expect(fetchBiteplanerOrderCompletion).toHaveBeenLastCalledWith('order-2', 'tok');
    });
    expect(await screen.findByRole('button', { name: /enviar complemento/i })).toBeDisabled();
  });
  it('uploads selected files and submits the completion', async () => {
    renderPage({ slots: [slot('upper_scan', true), slot('lower_scan', true), slot('bite_registration', false)] });

    const file = new File(['scan'], 'mordida.stl', { type: 'model/stl' });
    fireEvent.change(await screen.findByLabelText(/registro de mordida/i), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /enviar complemento/i }));

    await waitFor(() => {
      expect(uploadCompletionSlotFile).toHaveBeenCalledWith({
        orderId: 'order-1',
        slotKey: 'bite_registration',
        file,
        token: 'tok',
      });
    });
    expect(submitBiteplanerOrderCompletion).toHaveBeenCalledWith('order-1', 'tok');
    expect(await screen.findByText('Detalhe da ordem')).toBeInTheDocument();
  });
});