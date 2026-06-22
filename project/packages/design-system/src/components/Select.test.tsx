import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DesignSystemProvider } from '../provider';
import { Select } from './Select';

describe('Select', () => {
  it('opens a styled dropdown and selects an option', () => {
    const handleChange = vi.fn();

    render(
      <DesignSystemProvider brand="nexor">
        <Select
          label="Ano"
          value="2026"
          onChange={handleChange}
          options={[
            { value: '2026', label: '2026' },
            { value: '2025', label: '2025' },
          ]}
        />
      </DesignSystemProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ano' }));

    const option = screen.getByRole('option', { name: '2025' });
    expect(option).toBeInTheDocument();

    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith('2025');
  });

  it('anchors the options to the control before helper text', () => {
    render(
      <DesignSystemProvider brand="nexor">
        <Select
          label="Ano"
          hint="DescriÃ§Ã£o longa do campo"
          value=""
          onChange={() => undefined}
          options={[
            { value: '2026', label: '2026', description: 'Base atual' },
            { value: '2025', label: '2025', description: 'Base histÃ³rica' },
          ]}
        />
      </DesignSystemProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'Ano' });
    fireEvent.click(trigger);

    const listbox = screen.getByRole('listbox', { name: 'Ano' });
    const hint = screen.getByText(/descri/i);
    const controlShell = trigger.parentElement;

    expect(controlShell).toContainElement(listbox);
    expect(controlShell).not.toContainElement(hint);
  });

  it('renders an optional leading icon inside the trigger', () => {
    render(
      <DesignSystemProvider brand="nexor">
        <Select
          label="Status"
          value=""
          onChange={() => undefined}
          leadingIcon={<span data-testid="filter-icon" aria-hidden="true">#</span>}
          options={[{ value: '', label: 'Todos' }]}
        />
      </DesignSystemProvider>,
    );

    expect(screen.getByRole('button', { name: 'Status' })).toContainElement(screen.getByTestId('filter-icon'));
  });
});
