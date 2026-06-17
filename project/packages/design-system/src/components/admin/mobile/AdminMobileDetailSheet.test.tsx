import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { initDesignSystem } from '../../../provider';
import { AdminMobileDetailSheet } from './AdminMobileDetailSheet';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

describe('AdminMobileDetailSheet', () => {
  it('renders details and closes from the overlay', () => {
    const onClose = vi.fn();

    render(
      <DesignSystemRoot>
        <AdminMobileDetailSheet
          open
          title="Analisar solicitação"
          description="Revise os dados enviados."
          footer={<button type="button">Aprovar</button>}
          onClose={onClose}
        >
          Conteúdo da solicitação
        </AdminMobileDetailSheet>
      </DesignSystemRoot>
    );

    expect(screen.getByRole('dialog', { name: 'Analisar solicitação' })).toBeInTheDocument();
    expect(screen.getByText('Conteúdo da solicitação')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('presentation'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
