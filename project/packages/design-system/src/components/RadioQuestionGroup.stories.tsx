import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RadioQuestionGroup } from './RadioQuestionGroup';

const meta = {
  title: 'Components/RadioQuestionGroup',
  component: RadioQuestionGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof RadioQuestionGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  render: () => {
    const [value, setValue] = useState('no');

    return (
      <RadioQuestionGroup
        name="minor"
        label="O usuario final e menor de idade?"
        required
        value={value}
        onChange={setValue}
        options={[
          { value: 'no', label: 'Nao' },
          { value: 'yes', label: 'Sim' },
        ]}
      />
    );
  },
};

export const Cards: Story = {
  render: () => {
    const [value, setValue] = useState('cpf');

    return (
      <RadioQuestionGroup
        name="documentType"
        label="Documento do produto"
        hint="Selecione o tipo de documento"
        variant="cards"
        columns={2}
        required
        value={value}
        onChange={setValue}
        options={[
          { value: 'cpf', label: 'CPF', description: 'Documento brasileiro' },
          { value: 'rne', label: 'RNE / estrangeiro', description: 'Documento de estrangeiro' },
        ]}
      />
    );
  },
};
