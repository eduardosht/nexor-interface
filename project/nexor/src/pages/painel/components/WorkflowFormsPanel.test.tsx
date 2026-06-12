import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
import { TestQueryClientProvider } from '../../../test/renderWithQueryClient';
import { WorkflowFormsPanel } from './WorkflowFormsPanel';

function workflowForm(payload: Record<string, unknown> = {}) {
  return {
    id: 'BP-WF-ONBOARDING',
    orderId: 'BP-DEMO-ONBOARDING',
    templateKey: 'customer_new_user_onboarding',
    stepKey: 'new_user_onboarding',
    status: 'pending' as const,
    canViewPayload: true,
    summary: null,
    releasedAt: '2026-05-01T10:00:00.000Z',
    submittedAt: null,
    payload,
  };
}

function renderPanel({
  forms = [workflowForm()],
  defaultValues = { fullName: 'Joao Demo', email: 'joao@nexor.dev', phone: '11999999999' },
} = {}) {
  return render(
    <TestQueryClientProvider>
      <ThemeProvider theme={lightTheme}>
        <WorkflowFormsPanel
          orderId="BP-DEMO-ONBOARDING"
          token="tok"
          templateFilter={['customer_new_user_onboarding']}
          defaultValues={defaultValues}
          forms={forms}
          actorRole="user"
          formPresentation="flat"
          showFormHeader={false}
          variant="embedded"
        />
      </ThemeProvider>
    </TestQueryClientProvider>
  );
}

function getTextField(label: RegExp) {
  return screen.getByLabelText(label, { selector: 'input, textarea' });
}

describe('WorkflowFormsPanel', () => {
  it('preserves unsaved values when parent rerenders with equivalent form data', () => {
    const { rerender } = renderPanel();

    const fullNameInput = getTextField(/nome completo/i);
    fireEvent.change(fullNameInput, { target: { value: 'Maria Digitada' } });
    expect(fullNameInput).toHaveValue('Maria Digitada');

    rerender(
      <TestQueryClientProvider>
        <ThemeProvider theme={lightTheme}>
          <WorkflowFormsPanel
            orderId="BP-DEMO-ONBOARDING"
            token="tok"
            templateFilter={['customer_new_user_onboarding']}
            defaultValues={{ fullName: 'Joao Demo', email: 'joao@nexor.dev', phone: '11999999999' }}
            forms={[workflowForm({})]}
            actorRole="user"
            formPresentation="flat"
            showFormHeader={false}
            variant="embedded"
          />
        </ThemeProvider>
      </TestQueryClientProvider>
    );

    expect(getTextField(/nome completo/i)).toHaveValue('Maria Digitada');
  });
});
