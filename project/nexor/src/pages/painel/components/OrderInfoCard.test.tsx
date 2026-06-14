import { render, screen, within } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
import { OrderInfoCard } from './OrderStepHeader';

const order = {
  id: '11111111-1111-4111-8111-111111111039',
  display_number: 39,
  status: 'awaiting_scheduling',
  statusLabel: 'Aguardando confirmação da consulta',
  stage: 'awaiting_initial_consultation',
  created_at: '2026-06-14T18:17:00.000Z',
  customer: { full_name: 'Cliente Demo', email: 'cliente@nexor.dev', phone: null },
};

function renderCard() {
  return render(
    <ThemeProvider theme={lightTheme}>
      <OrderInfoCard
        order={order}
        orderHelpText="Já passou pela triagem e aguarda escolha do consultório."
      />
    </ThemeProvider>
  );
}

function renderCardWithoutLastUpdate() {
  return render(
    <ThemeProvider theme={lightTheme}>
      <OrderInfoCard
        order={order}
        orderHelpText="Já passou pela triagem e aguarda escolha do consultório."
        showLastUpdate={false}
      />
    </ThemeProvider>
  );
}

describe('OrderInfoCard', () => {
  it('renders the shared order information layout with canonical labels and accented update text', () => {
    renderCard();

    const card = screen.getByTestId('athlete-order-card');
    expect(card).toHaveTextContent('PEDIDO');
    expect(card).toHaveTextContent('#39');
    expect(card).toHaveTextContent('Já passou pela triagem e aguarda escolha do consultório.');
    expect(card).toHaveTextContent('STATUS ATUAL');
    expect(screen.getByTestId('athlete-order-status')).toHaveTextContent('Aguardando confirmação da consulta');
    expect(card).toHaveTextContent('ÚLTIMA ATUALIZAÇÃO');
    expect(card).toHaveTextContent('14/06/2026');
    expect(card).toHaveTextContent('às 15:17');
    expect(card).toHaveTextContent('ETAPA ATUAL');
    expect(card).toHaveTextContent('Consulta inicial');
  });

  it('exposes one semantic group per order information column', () => {
    renderCard();

    const card = screen.getByTestId('athlete-order-card');
    expect(within(card).getByLabelText('Informações do pedido')).toBeInTheDocument();
    expect(within(card).getByLabelText('Status atual do pedido')).toBeInTheDocument();
    expect(within(card).getByLabelText('Última atualização do pedido')).toBeInTheDocument();
    expect(within(card).getByLabelText('Etapa atual do pedido')).toBeInTheDocument();
  });

  it('can hide the last update column for compact purchase success summaries', () => {
    renderCardWithoutLastUpdate();

    const card = screen.getByTestId('athlete-order-card');
    expect(within(card).getByLabelText('Informações do pedido')).toBeInTheDocument();
    expect(within(card).getByLabelText('Status atual do pedido')).toBeInTheDocument();
    expect(within(card).queryByLabelText('Última atualização do pedido')).not.toBeInTheDocument();
    expect(within(card).getByLabelText('Etapa atual do pedido')).toBeInTheDocument();
  });
});
