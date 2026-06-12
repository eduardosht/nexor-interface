import { useMemo, useState } from 'react';
import type { AccessMode, DemoOrderSummary, DemoWorkflowForm } from '../../../features/demo/biteplanerFlow';
import {
  getFeedbackPromptSuppressionExpiresAt,
  getFeedbackPromptSuppressionKey,
  getPendingReviewOpportunities,
  isFeedbackPromptSuppressed,
  type PendingReviewOpportunity,
} from '../biteplanerReviewForms';
import { FeedbackPrompt } from './FeedbackPrompt';

interface PendingFeedbackPromptProps {
  mode: AccessMode;
  orders: DemoOrderSummary[];
  forms: DemoWorkflowForm[];
}

function getSuppressedFormIds(forms: DemoWorkflowForm[]) {
  if (typeof window === 'undefined') {
    return new Set<string>();
  }

  const now = Date.now();

  return new Set(
    forms
      .filter((form) =>
        isFeedbackPromptSuppressed(
          window.localStorage.getItem(getFeedbackPromptSuppressionKey(form.id)),
          now
        )
      )
      .map((form) => form.id)
  );
}

export function PendingFeedbackPrompt({ mode, orders, forms }: PendingFeedbackPromptProps) {
  const [dismissedVersion, setDismissedVersion] = useState(0);
  const suppressedFormIds = useMemo(() => getSuppressedFormIds(forms), [forms, dismissedVersion]);
  const opportunity = useMemo(
    () =>
      getPendingReviewOpportunities({
        mode,
        orders,
        forms,
        suppressedFormIds,
      })[0] ?? null,
    [forms, mode, orders, suppressedFormIds]
  );

  function handleDismiss(item: PendingReviewOpportunity) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        getFeedbackPromptSuppressionKey(item.formId),
        getFeedbackPromptSuppressionExpiresAt()
      );
    }

    setDismissedVersion((current) => current + 1);
  }

  if (!opportunity) {
    return null;
  }

  return <FeedbackPrompt opportunity={opportunity} onDismiss={handleDismiss} />;
}
