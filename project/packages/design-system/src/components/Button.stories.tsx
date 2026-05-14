import type { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Primary action',
    variant: 'primary',
    tone: 'default',
    size: 'md',
    fullWidth: false,
    loading: false,
    disabled: false,
  },
  argTypes: {
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <Row>
      <Button {...args} variant="primary">Primary action</Button>
      <Button {...args} variant="secondary">Secondary action</Button>
      <Button {...args} variant="ghost">Ghost action</Button>
    </Row>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Row>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </Row>
  ),
};

export const States: Story = {
  render: (args) => (
    <Column>
      <Row>
        <Button {...args} variant="primary">Primary default</Button>
        <Button {...args} variant="primary" loading>Primary loading</Button>
        <Button {...args} variant="primary" disabled>Primary disabled</Button>
      </Row>
      <Row>
        <Button {...args} variant="secondary">Secondary default</Button>
        <Button {...args} variant="secondary" loading>Secondary loading</Button>
        <Button {...args} variant="secondary" disabled>Secondary disabled</Button>
      </Row>
      <Row>
        <Button {...args} variant="ghost">Ghost default</Button>
        <Button {...args} variant="ghost" loading>Ghost loading</Button>
        <Button {...args} variant="ghost" disabled>Ghost disabled</Button>
      </Row>
    </Column>
  ),
};

export const Inverse: Story = {
  render: (args) => (
    <DarkPanel>
      <Row>
        <Button {...args} tone="inverse" variant="primary">Primary inverse</Button>
        <Button {...args} tone="inverse" variant="secondary">Secondary inverse</Button>
        <Button {...args} tone="inverse" variant="ghost">Ghost inverse</Button>
      </Row>
    </DarkPanel>
  ),
};

const Row = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const Column = styled.div`
  display: grid;
  gap: 12px;
`;

const DarkPanel = styled.div`
  background: linear-gradient(160deg, #0d1a0f 0%, #132719 100%);
  padding: 24px;
  border-radius: 16px;
`;
