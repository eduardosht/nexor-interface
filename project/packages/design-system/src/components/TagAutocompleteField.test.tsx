import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
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

  it('closes the option list when the input loses focus', () => {
    renderField();
    const input = screen.getByLabelText('Esporte ou atividade');

    input.focus();
    fireEvent.change(input, { target: { value: 'bo' } });
    expect(screen.getByRole('option', { name: 'Boxe' })).toBeInTheDocument();

    fireEvent.blur(input);

    expect(screen.queryByRole('option', { name: 'Boxe' })).not.toBeInTheDocument();
  });

  it('disables native browser autocomplete suggestions on the search input', () => {
    renderField();

    expect(screen.getByLabelText('Esporte ou atividade')).toHaveAttribute('autocomplete', 'off');
  });

  it('removes selected tags through the delete action', () => {
    const handleChange = renderField(['boxe', 'jiu-jitsu']);

    fireEvent.click(screen.getByRole('button', { name: /remover boxe/i }));

    expect(handleChange).toHaveBeenCalledWith(['jiu-jitsu']);
  });

  it('does not keep the required error after selecting a tag', () => {
    function ControlledRequiredField() {
      const [value, setValue] = useState<string[]>([]);
      const [error, setError] = useState('');

      return (
        <DesignSystemProvider brand="nexor">
          <TagAutocompleteField
            label="Esporte ou atividade"
            value={value}
            options={options}
            required
            error={error}
            onBlur={() => {
              setError(value.length === 0 ? 'Campo obrigatório' : '');
            }}
            onChange={(nextValue) => {
              setValue(nextValue);
              setError(nextValue.length === 0 ? 'Campo obrigatório' : '');
            }}
          />
        </DesignSystemProvider>
      );
    }

    render(<ControlledRequiredField />);
    const input = screen.getByLabelText('Esporte ou atividade (*)');

    fireEvent.blur(input);
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();

    input.focus();
    fireEvent.change(input, { target: { value: 'box' } });
    fireEvent.click(screen.getByRole('option', { name: 'Boxe' }));

    expect(screen.getByRole('button', { name: /remover boxe/i })).toBeInTheDocument();
    expect(screen.queryByText('Campo obrigatório')).not.toBeInTheDocument();
  });
  it('adds a custom typed value with Enter when free values are allowed', () => {
    const handleChange = vi.fn();

    render(
      <DesignSystemProvider brand="nexor">
        <TagAutocompleteField
          label="Esporte ou atividade"
          value={[]}
          options={options}
          onChange={handleChange}
          allowCustomValue
        />
      </DesignSystemProvider>,
    );

    const input = screen.getByLabelText('Esporte ou atividade');
    fireEvent.change(input, { target: { value: 'Beach Tennis' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleChange).toHaveBeenCalledWith(['Beach Tennis']);
    expect(input).not.toHaveFocus();
  });

  it('adds a custom typed value on blur when free values are allowed', () => {
    const handleChange = vi.fn();

    render(
      <DesignSystemProvider brand="nexor">
        <TagAutocompleteField
          label="Esporte ou atividade"
          value={[]}
          options={options}
          onChange={handleChange}
          allowCustomValue
        />
      </DesignSystemProvider>,
    );

    const input = screen.getByLabelText('Esporte ou atividade');
    fireEvent.change(input, { target: { value: 'Escalada indoor' } });
    fireEvent.blur(input);

    expect(handleChange).toHaveBeenCalledWith(['Escalada indoor']);
  });
});
