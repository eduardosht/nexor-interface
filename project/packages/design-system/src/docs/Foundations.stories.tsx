import type { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';
import { Typography, getBrandTokens, useDesignSystem } from '../index';

function FoundationsShowcase() {
  const { brand } = useDesignSystem();
  const tokens = getBrandTokens(brand);

  return (
    <Stack>
      <Section>
        <Title>Brand</Title>
        <Text>{brand}</Text>
      </Section>

      <Section>
        <Title>Colors</Title>
        <Grid>
          {[
            ['bg', tokens.colors.bg],
            ['surface', tokens.colors.surface],
            ['surfaceSubtle', tokens.colors.surfaceSubtle],
            ['border', tokens.colors.border],
            ['text', tokens.colors.text],
            ['textMuted', tokens.colors.textMuted],
            ['accent', tokens.colors.accent],
            ['accentSoft', tokens.colors.accentSoft],
            ['danger', tokens.colors.danger],
          ].map(([name, value]) => (
            <Swatch key={name}>
              <ColorBox style={{ background: value }} />
              <SwatchLabel>{name}</SwatchLabel>
              <SwatchValue>{value}</SwatchValue>
            </Swatch>
          ))}
        </Grid>
      </Section>

      <Section>
        <Title>Typography</Title>
        <TypographySample>
          <Typography variant="heading-3">Display sample</Typography>
          <Typography variant="paragraph-md">
            Body sample. The quick brown fox jumps over the lazy dog.
          </Typography>
          <Typography variant="description-md" tone="muted">
            Supporting description for dense UI blocks and contextual guidance.
          </Typography>
          <Typography variant="caption-md" tone="accent">
            Caption label
          </Typography>
        </TypographySample>
      </Section>

      <Section>
        <Title>Spacing</Title>
        <Grid>
          {[
            ['space-2', tokens.spacing['2']],
            ['space-4', tokens.spacing['4']],
            ['space-6', tokens.spacing['6']],
            ['space-8', tokens.spacing['8']],
            ['space-12', tokens.spacing['12']],
            ['text.default', tokens.spacing.text.default],
            ['text.relaxed', tokens.spacing.text.relaxed],
            ['form.fieldGap', tokens.spacing.form.fieldGap],
            ['form.groupGap', tokens.spacing.form.groupGap],
          ].map(([name, value]) => (
            <Swatch key={name}>
              <SpacingBar style={{ width: value }} />
              <SwatchLabel>{name}</SwatchLabel>
              <SwatchValue>{value}</SwatchValue>
            </Swatch>
          ))}
        </Grid>
      </Section>
    </Stack>
  );
}

const meta = {
  title: 'Foundations/Tokens',
  component: FoundationsShowcase,
  tags: ['autodocs'],
} satisfies Meta<typeof FoundationsShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};

const Stack = styled.div`
  display: grid;
  gap: 24px;
  width: min(960px, 100%);
`;

const Section = styled.section`
  display: grid;
  gap: 12px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
`;

const Text = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
`;

const TypographySample = styled.div`
  display: grid;
  gap: 10px;
`;

const Swatch = styled.div`
  display: grid;
  gap: 8px;
`;

const ColorBox = styled.div`
  width: 100%;
  height: 72px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
`;

const SpacingBar = styled.div`
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(22, 163, 74, 0.22), rgba(22, 163, 74, 0.72));
  min-width: 12px;
`;

const SwatchLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
`;

const SwatchValue = styled.span`
  font-size: 12px;
  opacity: 0.7;
`;
