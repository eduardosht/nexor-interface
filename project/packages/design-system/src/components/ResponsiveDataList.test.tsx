import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { initDesignSystem } from '../provider';
import { ResponsiveDataList } from './ResponsiveDataList';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

describe('ResponsiveDataList', () => {
  it('renders desktop content and mobile cards from the same wrapper', () => {
    render(
      <DesignSystemRoot>
        <ResponsiveDataList
          desktop={<table><tbody><tr><td>Desktop BP-001</td></tr></tbody></table>}
          data={[{ id: 'BP-001', name: 'Marina Demo' }]}
          keyExtractor={(row) => row.id}
          renderCard={(row) => <article>{row.id} {row.name}</article>}
          emptyMessage="Nenhum registro"
        />
      </DesignSystemRoot>
    );

    expect(screen.getByText('Desktop BP-001')).toBeInTheDocument();
    expect(screen.getByText(/bp-001 marina demo/i)).toBeInTheDocument();
    expect(screen.getByTestId('responsive-data-list-desktop')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-data-list-mobile')).toBeInTheDocument();
  });

  it('renders the mobile empty message when data is empty', () => {
    render(
      <DesignSystemRoot>
        <ResponsiveDataList
          desktop={<div>Tabela vazia</div>}
          data={[]}
          keyExtractor={(row: { id: string }) => row.id}
          renderCard={(row: { id: string }) => <article>{row.id}</article>}
          emptyMessage="Nenhuma ordem encontrada"
        />
      </DesignSystemRoot>
    );

    expect(screen.getByText('Nenhuma ordem encontrada')).toBeInTheDocument();
  });
});
