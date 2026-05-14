import type { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';
import { Surface } from './Surface';

const meta = {
  title: 'Components/Surface',
  component: Surface,
  tags: ['autodocs'],
  args: {
    tone: 'default',
    padding: 'md',
    interactive: false,
  },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Surface {...args}>
      <Title>Surface title</Title>
      <Text>Reusable container for cards, panels and grouped content.</Text>
    </Surface>
  ),
};

export const Tones: Story = {
  render: (args) => (
    <Grid>
      <Surface {...args} tone="default"><CardContent title="Default" /></Surface>
      <Surface {...args} tone="subtle"><CardContent title="Subtle" /></Surface>
      <Surface {...args} tone="accent"><CardContent title="Accent" /></Surface>
    </Grid>
  ),
};

export const Interactive: Story = {
  render: (args) => (
    <Surface {...args} interactive>
      <CardContent title="Interactive surface" />
    </Surface>
  ),
};

function CardContent({ title }: { title: string }) {
  return (
    <>
      <Title>{title}</Title>
      <Text>Use this family for cards, summaries, panels and grouped interface blocks.</Text>
    </>
  );
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  width: min(960px, 100%);
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 16px;
`;

const Text = styled.p`
  margin: 0;
  line-height: 1.6;
  font-size: 14px;
`;
