import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Neutral: Story = { args: { tone: 'neutral', children: 'Neutro' } };
export const Success: Story = { args: { tone: 'success', children: 'Concluído' } };
export const Warning: Story = { args: { tone: 'warning', children: 'Pendente' } };
export const Error: Story = { args: { tone: 'error', children: 'Cancelado' } };
export const Info: Story = { args: { tone: 'info', children: 'Em produção' } };
