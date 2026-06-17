import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { initDesignSystem } from '../../../provider';
import { AdminMobileRecordCard } from './AdminMobileRecordCard';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

describe('AdminMobileRecordCard', () => {
  it('renders compact operational content and action slots', () => {
    render(
      <DesignSystemRoot>
        <AdminMobileRecordCard
          title="BP-001"
          subtitle="Marina Demo"
          status={<span>Em análise</span>}
          metadata={[
            { label: 'Etapa', value: 'Laboratório' },
            { label: 'Atualizado', value: '17/06/2026' },
          ]}
          primaryAction={<button type="button">Analisar</button>}
          secondaryActions={<button type="button">Mais</button>}
        />
      </DesignSystemRoot>
    );

    expect(screen.getByText('BP-001')).toBeInTheDocument();
    expect(screen.getByText('Marina Demo')).toBeInTheDocument();
    expect(screen.getByText('Em análise')).toBeInTheDocument();
    expect(screen.getByText('Etapa')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analisar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mais' })).toBeInTheDocument();
  });
});
