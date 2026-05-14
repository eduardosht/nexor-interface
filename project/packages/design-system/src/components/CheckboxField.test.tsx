import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DesignSystemProvider } from '../provider';
import { CheckboxField } from './CheckboxField';

describe('CheckboxField', () => {
  it('emits checked state when toggled', () => {
    const handleChange = vi.fn();

    render(
      <DesignSystemProvider brand="nexor">
        <CheckboxField
          label="Aceito os termos"
          description="Obrigatorio para continuar"
          checked={false}
          onChange={handleChange}
        />
      </DesignSystemProvider>,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Aceito os termos' }));

    expect(handleChange).toHaveBeenCalledWith(true);
    expect(screen.getByText('Obrigatorio para continuar')).toBeInTheDocument();
  });

  it('keeps the native input positioned over the visible checkbox mark', () => {
    render(
      <DesignSystemProvider brand="nexor">
        <CheckboxField
          label="Aceito os termos"
          checked={false}
          onChange={vi.fn()}
        />
      </DesignSystemProvider>,
    );

    expect(screen.getByTestId('checkbox-field-card')).toHaveStyle({
      position: 'relative',
    });
    expect(screen.getByRole('checkbox', { name: 'Aceito os termos' })).toHaveStyle({
      width: '22px',
      height: '22px',
      opacity: '0',
    });
  });

  it('renders an emphasis badge when provided', () => {
    render(
      <DesignSystemProvider brand="nexor">
        <CheckboxField
          label="Aceite obrigatorio"
          checked={false}
          onChange={vi.fn()}
          badge="Obrigatorio"
          badgeTone="required"
        />
      </DesignSystemProvider>,
    );

    expect(screen.getByText('Obrigatorio')).toBeInTheDocument();
  });
});
