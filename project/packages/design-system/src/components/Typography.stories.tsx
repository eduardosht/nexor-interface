import type { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';
import { Surface } from './Surface';
import { Typography, type TypographyVariant } from './Typography';

const sampleText =
  'A interface precisa ser clara, confiante e legivel em qualquer ponto de contato com a marca.';

const headingVariants: TypographyVariant[] = [
  'heading-1',
  'heading-2',
  'heading-3',
  'heading-4',
  'heading-5',
  'heading-6',
];

const meta = {
  title: 'Components/Typography',
  component: Typography,
  tags: ['autodocs'],
  args: {
    variant: 'paragraph-md',
    tone: 'default',
    children: sampleText,
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Headings: Story = {
  render: () => (
    <Stack>
      {headingVariants.map((variant) => (
        <Sample key={variant}>
          <Label>{variant}</Label>
          <Typography variant={variant}>Nexor design system heading</Typography>
        </Sample>
      ))}
    </Stack>
  ),
};

export const ContentStyles: Story = {
  render: () => (
    <Stack>
      <Sample>
        <Label>paragraph-lg</Label>
        <Typography variant="paragraph-lg">{sampleText}</Typography>
      </Sample>
      <Sample>
        <Label>paragraph-md</Label>
        <Typography variant="paragraph-md">{sampleText}</Typography>
      </Sample>
      <Sample>
        <Label>paragraph-sm</Label>
        <Typography variant="paragraph-sm">{sampleText}</Typography>
      </Sample>
      <Sample>
        <Label>description-lg</Label>
        <Typography variant="description-lg" tone="muted">
          Copy de apoio para explicar contexto, beneficios ou proximos passos.
        </Typography>
      </Sample>
      <Sample>
        <Label>description-md</Label>
        <Typography variant="description-md" tone="muted">
          Texto curto de suporte com contraste mais suave e leitura fluida.
        </Typography>
      </Sample>
      <Sample>
        <Label>caption-md</Label>
        <Typography variant="caption-md" tone="accent">
          System label
        </Typography>
      </Sample>
      <Sample>
        <Label>caption-sm</Label>
        <Typography variant="caption-sm" tone="soft">
          Metadata
        </Typography>
      </Sample>
    </Stack>
  ),
};

export const InContext: Story = {
  render: () => (
    <Card>
      <Typography variant="caption-md" tone="accent">
        Performance System
      </Typography>
      <Typography variant="heading-3">Componentes com hierarquia tipografica consistente</Typography>
      <Typography variant="description-lg" tone="muted">
        Headlines, paragrafos, descritions e legendas agora compartilham uma escala unica por
        marca dentro do design system.
      </Typography>
      <Typography variant="paragraph-md">
        Isso facilita a composicao de landing pages, paineis e documentacao sem espalhar tamanhos
        arbitrarios pelo codigo.
      </Typography>
    </Card>
  ),
};

const Stack = styled.div`
  display: grid;
  gap: 18px;
  width: min(900px, 100%);
`;

const Sample = styled.div`
  display: grid;
  gap: 8px;
  padding: 18px 20px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.6);
`;

const Label = styled.span`
  font-family: monospace;
  font-size: 12px;
  opacity: 0.7;
`;

const Card = styled(Surface)`
  display: grid;
  gap: 12px;
  width: min(640px, 100%);
`;
