import type { Meta, StoryObj } from '@storybook/react';
import { Select } from '../index';

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  args: {
    label: 'Ano',
    value: '2026',
    placeholder: 'Selecione o ano',
    options: [
      { value: '2026', label: '2026' },
      { value: '2025', label: '2025' },
      { value: '2024', label: '2024', description: 'Base historica para comparacao' },
    ],
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onChange: () => undefined,
  },
};
