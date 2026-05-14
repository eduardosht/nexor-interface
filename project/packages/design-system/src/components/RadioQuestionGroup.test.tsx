import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DesignSystemProvider } from '../provider';
import { RadioQuestionGroup } from './RadioQuestionGroup';

describe('RadioQuestionGroup', () => {
  it('renders compact inline options and emits selected value', () => {
    const handleChange = vi.fn();

    render(
      <DesignSystemProvider brand="nexor">
        <RadioQuestionGroup
          name="minor"
          label="O usuario final e menor de idade?"
          value="no"
          onChange={handleChange}
          options={[
            { value: 'no', label: 'Nao' },
            { value: 'yes', label: 'Sim' },
          ]}
        />
      </DesignSystemProvider>,
    );

    expect(screen.getByRole('radio', { name: 'Nao' })).toBeChecked();

    fireEvent.click(screen.getByRole('radio', { name: 'Sim' }));

    expect(handleChange).toHaveBeenCalledWith('yes');
  });

  it('renders card options with descriptions and emits selected value', () => {
    const handleChange = vi.fn();

    render(
      <DesignSystemProvider brand="nexor">
        <RadioQuestionGroup
          name="documentType"
          label="Documento do produto"
          variant="cards"
          columns={2}
          value="cpf"
          onChange={handleChange}
          options={[
            { value: 'cpf', label: 'CPF', description: 'Documento brasileiro' },
            { value: 'rne', label: 'RNE / estrangeiro', description: 'Documento de estrangeiro' },
          ]}
        />
      </DesignSystemProvider>,
    );

    expect(screen.getByText('Documento brasileiro')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'CPF' })).toBeChecked();

    fireEvent.click(screen.getByRole('radio', { name: 'RNE / estrangeiro' }));

    expect(handleChange).toHaveBeenCalledWith('rne');
  });

  it('can force options to stay inline', () => {
    render(
      <DesignSystemProvider brand="nexor">
        <RadioQuestionGroup
          name="answer"
          label="Resposta"
          inline
          value="no"
          onChange={vi.fn()}
          options={[
            { value: 'no', label: 'Nao' },
            { value: 'yes', label: 'Sim' },
            { value: 'unknown', label: 'Nao sei' },
          ]}
        />
      </DesignSystemProvider>,
    );

    expect(screen.getByTestId('radio-question-options-answer')).toHaveStyle({
      display: 'flex',
    });
  });
});
