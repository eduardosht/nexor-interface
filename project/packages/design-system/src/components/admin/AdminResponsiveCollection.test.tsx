import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { initDesignSystem } from '../../provider';
import { AdminResponsiveCollection } from './AdminResponsiveCollection';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

describe('AdminResponsiveCollection', () => {
  it('renders desktop table and mobile cards from the same data', () => {
    render(
      <DesignSystemRoot>
        <AdminResponsiveCollection
          items={[{ id: '1', name: 'Marina' }]}
          getItemKey={(item) => item.id}
          renderTable={(items) => <table><tbody>{items.map((item) => <tr key={item.id}><td>Desktop {item.name}</td></tr>)}</tbody></table>}
          renderCard={(item) => <article>Mobile {item.name}</article>}
        />
      </DesignSystemRoot>
    );

    expect(screen.getByTestId('admin-responsive-collection-desktop')).toBeInTheDocument();
    expect(screen.getByTestId('admin-responsive-collection-mobile')).toBeInTheDocument();
    expect(screen.getByText('Desktop Marina')).toBeInTheDocument();
    expect(screen.getByText('Mobile Marina')).toBeInTheDocument();
  });

  it('renders empty state without making data decisions', () => {
    render(
      <DesignSystemRoot>
        <AdminResponsiveCollection
          items={[]}
          getItemKey={(item: { id: string }) => item.id}
          renderTable={() => <div>Tabela</div>}
          renderCard={(item: { name: string }) => <article>{item.name}</article>}
          emptyState="Sem registros"
        />
      </DesignSystemRoot>
    );

    expect(screen.getAllByText('Sem registros')).toHaveLength(2);
  });
});
