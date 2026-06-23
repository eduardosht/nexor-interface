import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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

  it('places inline validation feedback inside the legend below the question text', () => {
    render(
      <DesignSystemProvider brand="nexor">
        <RadioQuestionGroup
          name="answer"
          label="Resposta"
          inline
          value=""
          error="Campo obrigatorio"
          onChange={vi.fn()}
          options={[
            { value: 'no', label: 'Nao' },
            { value: 'yes', label: 'Sim' },
          ]}
        />
      </DesignSystemProvider>,
    );

    const alert = screen.getByRole('alert');
    const legend = alert.closest('legend');

    expect(legend).not.toBeNull();
    expect(legend).toHaveTextContent('Resposta');
    expect(alert).toHaveStyle({ display: 'block' });
  });

  it('keeps radio question text at 12px on small devices', () => {
    const source = readFileSync(join(process.cwd(), 'src/components/RadioQuestionGroup.tsx'), 'utf8');

    const mobileFontSizeRules = source.match(/@media \(max-width: 640px\)\s*{\s*font-size: 12px;\s*}/g);

    expect(mobileFontSizeRules).toHaveLength(3);
  });
});
