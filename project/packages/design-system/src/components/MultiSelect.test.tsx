import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DesignSystemProvider } from '../provider';
import { MultiSelect } from './MultiSelect';

describe('MultiSelect', () => {
  it('shows previously selected options as checked when reopening the dropdown', () => {
    const handleChange = vi.fn();

    render(
      <DesignSystemProvider brand="nexor">
        <MultiSelect
          label="Status"
          options={[
            { value: 'active', label: 'Ativo' },
            { value: 'paused', label: 'Pausado' },
          ]}
          value={['active']}
          onChange={handleChange}
        />
      </DesignSystemProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ativo' }));

    const activeOption = screen.getByRole('option', { name: 'Ativo' });

    expect(activeOption).toHaveAttribute('aria-selected', 'true');
    expect(activeOption.firstChild).toHaveStyle({
      background: 'rgb(23, 23, 23)',
    });
  });

  it('removes a selected item from its chip without opening the dropdown', () => {
    const handleChange = vi.fn();

    render(
      <DesignSystemProvider brand="nexor">
        <MultiSelect
          label="Status"
          options={[
            { value: 'active', label: 'Ativo' },
            { value: 'paused', label: 'Pausado' },
            { value: 'draft', label: 'Rascunho' },
          ]}
          value={['active', 'paused']}
          onChange={handleChange}
        />
      </DesignSystemProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /remover ativo/i }));

    expect(handleChange).toHaveBeenCalledWith(['paused']);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders every selected item with a remove action', () => {
    render(
      <DesignSystemProvider brand="nexor">
        <MultiSelect
          label="Etapa"
          options={[
            { value: 'one', label: 'Etapa 1' },
            { value: 'two', label: 'Etapa 2' },
            { value: 'three', label: 'Etapa 3' },
          ]}
          value={['one', 'two', 'three']}
          onChange={vi.fn()}
        />
      </DesignSystemProvider>,
    );

    expect(screen.getByRole('button', { name: /remover etapa 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remover etapa 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remover etapa 3/i })).toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });
});
