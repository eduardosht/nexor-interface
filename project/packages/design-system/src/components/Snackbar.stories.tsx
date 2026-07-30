import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Snackbar, SnackbarStack } from './Snackbar';

const meta = {
  title: 'Components/Snackbar',
  component: Snackbar,
  args: {
    title: 'Rascunho salvo',
    message: 'As alteracoes foram persistidas e ja podem ser retomadas depois.',
  },
} satisfies Meta<typeof Snackbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    tone: 'success',
  },
};

export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Pendencia clinica',
    message: 'Ainda falta anexar a prescricao assinada para concluir o envio.',
  },
};

export const Error: Story = {
  args: {
    tone: 'error',
    title: 'Falha ao salvar',
    message: 'Nao foi possivel persistir o formulario agora. Tente novamente.',
  },
};

export const Stacked: Story = {
  render: () => (
    <SnackbarStack>
      <Snackbar tone="success" title="Pedido encaminhado" message="A ordem BP-DEMO-004 foi enviada para produção externa." />
      <Snackbar
        tone="warning"
        title="Aguardando confirmacao"
        message="A operação Nexor ainda aguarda retorno externo da produção."
        action={<Button variant="ghost" size="sm">Abrir detalhes</Button>}
      />
    </SnackbarStack>
  ),
};
