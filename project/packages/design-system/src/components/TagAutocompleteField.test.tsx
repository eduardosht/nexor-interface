import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DesignSystemProvider } from '../provider';
import { TagAutocompleteField } from './TagAutocompleteField';

const options = [
  { value: 'boxe', label: 'Boxe' },
  { value: 'jiu-jitsu', label: 'Jiu-jitsu' },
  { value: 'natacao', label: 'Natacao' },
];

function renderField(value: string[] = [], onChange = vi.fn()) {
  render(
    <DesignSystemProvider brand="nexor">
      <TagAutocompleteField
        label="Esporte ou atividade"
        value={value}
        options={options}
        onChange={onChange}
        placeholder="Buscar esporte..."
      />
    </DesignSystemProvider>,
  );

  return onChange;
}

describe('TagAutocompleteField', () => {
  it('adds a matching option with Enter', () => {
    const handleChange = renderField();
    const input = screen.getByLabelText('Esporte ou atividade');

    input.focus();
    fireEvent.change(input, {
      target: { value: 'box' },
    });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleChange).toHaveBeenCalledWith(['boxe']);
    expect(input).not.toHaveFocus();
  });

  it('adds a matching option by click and avoids duplicates', () => {
    const handleChange = renderField(['boxe']);
    const input = screen.getByLabelText('Esporte ou atividade');

    input.focus();
    fireEvent.change(input, {
      target: { value: 'nat' },
    });
    fireEvent.click(screen.getByRole('option', { name: 'Natacao' }));

    expect(handleChange).toHaveBeenCalledWith(['boxe', 'natacao']);
    expect(screen.queryByRole('option', { name: 'Boxe' })).not.toBeInTheDocument();
    expect(input).not.toHaveFocus();
  });

  it('removes selected tags through the delete action', () => {
    const handleChange = renderField(['boxe', 'jiu-jitsu']);

    fireEvent.click(screen.getByRole('button', { name: /remover boxe/i }));

    expect(handleChange).toHaveBeenCalledWith(['jiu-jitsu']);
  });
});
