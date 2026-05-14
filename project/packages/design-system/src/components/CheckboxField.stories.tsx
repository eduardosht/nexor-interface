import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CheckboxField } from './CheckboxField';

const meta = {
  title: 'Components/CheckboxField',
  component: CheckboxField,
  tags: ['autodocs'],
} satisfies Meta<typeof CheckboxField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <CheckboxField
        label="Li e aceito os termos"
        description="Obrigatorio para continuar."
        checked={checked}
        onChange={setChecked}
      />
    );
  },
};
