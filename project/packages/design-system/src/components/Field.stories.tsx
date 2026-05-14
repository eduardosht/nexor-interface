import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';
import { Field, useDesignSystem } from '../index';
import type { BrandTokens } from '../tokens';

const meta = {
  title: 'Components/Field',
  component: Field,
  tags: ['autodocs'],
  args: {
    label: 'Nome',
    placeholder: 'Digite aqui',
    hint: 'Texto auxiliar do campo',
    error: '',
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Input: Story = {
  args: {
    as: 'input',
  },
};

export const WithError: Story = {
  args: {
    as: 'input',
    error: 'Este campo e obrigatorio',
  },
};

export const Select: Story = {
  render: (args) => (
    <Field {...args} as="select" label="Assunto" hint="Selecione uma opcao">
      <option>Produto</option>
      <option>Parceria</option>
      <option>Suporte</option>
    </Field>
  ),
};

export const Textarea: Story = {
  args: {
    as: 'textarea',
    label: 'Mensagem',
    placeholder: 'Escreva a sua mensagem',
  },
};

export const Group: Story = {
  render: () => (
    <Stack>
      <Field as="input" label="Nome" placeholder="Seu nome" />
      <Field as="input" label="E-mail" placeholder="voce@empresa.com" />
      <Field as="select" label="Tipo">
        <option>Cliente</option>
        <option>Parceiro</option>
      </Field>
      <Field as="textarea" label="Observacoes" placeholder="Detalhes adicionais" />
    </Stack>
  ),
};

function Stack({ children }: { children: ReactNode }) {
  const { tokens } = useDesignSystem();

  return (
    <StackWrap $tokens={tokens}>
      {children}
    </StackWrap>
  );
}

const StackWrap = styled.div<{ $tokens: BrandTokens }>`
  display: grid;
  gap: ${({ $tokens }) => $tokens.spacing.form.fieldGap};
  width: min(420px, 100%);
`;
