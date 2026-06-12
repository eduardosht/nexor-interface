import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { FeedbackPrompt } from './FeedbackPrompt';
import { PendingFeedbackPrompt } from './PendingFeedbackPrompt';
import type { PendingReviewOpportunity } from '../biteplanerReviewForms';

const opportunity: PendingReviewOpportunity = {
  id: 'review-1',
  orderId: 'BP-DEMO-001',
  formId: 'review-1',
  templateKey: 'partner_review_by_customer',
  actorMode: 'user',
  title: 'Avalie o parceiro indicador',
  context: 'Cadastro via link de recomendação',
  route: '/painel/biteplaner/avaliacoes?mode=user&surveyId=review-1',
  releasedAt: '2026-05-01T10:08:00.000Z',
  priority: 80,
};

function renderPrompt(onDismiss = vi.fn()) {
  render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <FeedbackPrompt opportunity={opportunity} onDismiss={onDismiss} />
      </ThemeProvider>
    </MemoryRouter>
  );

  return { onDismiss };
}

describe('FeedbackPrompt', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders a subtle optional feedback callout with a deep link to the survey', () => {
    renderPrompt();

    expect(screen.getByText(/sua avaliação ajuda a qualificar a rede biteplaner/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /avaliar agora/i })).toHaveAttribute('href', opportunity.route);
    expect(screen.getByRole('button', { name: /responder depois/i })).toBeInTheDocument();
  });

  it('dismisses without submitting the survey', async () => {
    const user = userEvent.setup();
    const { onDismiss } = renderPrompt();

    await user.click(screen.getByRole('button', { name: /responder depois/i }));

    expect(onDismiss).toHaveBeenCalledWith(opportunity);
  });

  it('filters, renders and suppresses pending opportunities locally', async () => {
    const user = userEvent.setup();
    const form = {
      id: 'review-1',
      orderId: 'BP-DEMO-001',
      templateKey: 'partner_review_by_customer',
      stepKey: 'partner_review_by_customer',
      status: 'pending' as const,
      canViewPayload: true,
      summary: null,
      releasedAt: '2026-05-01T10:08:00.000Z',
      submittedAt: null,
      payload: null,
    };
    const order = {
      id: 'BP-DEMO-001',
      status: 'completed',
      stage: 'completed',
      created_at: '2026-05-01T10:00:00.000Z',
    };

    const view = render(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <PendingFeedbackPrompt mode="user" orders={[order]} forms={[form]} />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/avalie o parceiro indicador/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /responder depois/i }));
    expect(screen.queryByText(/avalie o parceiro indicador/i)).not.toBeInTheDocument();

    view.rerender(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <PendingFeedbackPrompt mode="user" orders={[order]} forms={[form]} />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.queryByText(/avalie o parceiro indicador/i)).not.toBeInTheDocument();
  });
});
