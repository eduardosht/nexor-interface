import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DesignSystemProvider } from '../provider';
import { TagAutocompleteField, type TagAutocompleteOption } from './TagAutocompleteField';

const options: TagAutocompleteOption[] = [
  { value: 'boxe', label: 'Boxe' },
  { value: 'jiu-jitsu', label: 'Jiu-jitsu' },
  { value: 'karate', label: 'Karate' },
  { value: 'rugby', label: 'Rugby' },
  { value: 'natacao', label: 'Natacao' },
];

const meta: Meta<typeof TagAutocompleteField> = {
  title: 'Components/TagAutocompleteField',
  component: TagAutocompleteField,
};

export default meta;

type Story = StoryObj<typeof TagAutocompleteField>;

function ControlledExample() {
  const [value, setValue] = useState<string[]>(['boxe']);

  return (
    <DesignSystemProvider brand="nexor">
      <div style={{ maxWidth: 520 }}>
        <TagAutocompleteField
          label="Esporte ou atividade"
          value={value}
          options={options}
          onChange={setValue}
          placeholder="Buscar esporte..."
          hint="Pressione Enter para adicionar o primeiro resultado."
        />
      </div>
    </DesignSystemProvider>
  );
}

export const Default: Story = {
  render: () => <ControlledExample />,
};
