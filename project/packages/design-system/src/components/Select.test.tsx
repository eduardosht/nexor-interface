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
});
