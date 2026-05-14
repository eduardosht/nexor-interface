import type { DemoOrderSummary, DemoWorkflowForm, ProductionRequestDraft } from '../../../features/demo/biteplanerFlow';
import { createFinalAnamnesisPdfBlob } from './finalAnamnesisPdf';

interface FinalAnamnesisPdfWorkerRequest {
  order: DemoOrderSummary;
  intakeForm: DemoWorkflowForm | undefined;
  draft: ProductionRequestDraft;
}

type FinalAnamnesisPdfWorkerResponse =
  | {
      status: 'success';
      arrayBuffer: ArrayBuffer;
    }
  | {
      status: 'error';
      message: string;
    };

interface FinalAnamnesisPdfWorkerScope {
  onmessage: ((event: MessageEvent<FinalAnamnesisPdfWorkerRequest>) => void | Promise<void>) | null;
  postMessage(message: FinalAnamnesisPdfWorkerResponse, transfer?: Transferable[]): void;
}

const workerScope = self as unknown as FinalAnamnesisPdfWorkerScope;

workerScope.onmessage = async (event: MessageEvent<FinalAnamnesisPdfWorkerRequest>) => {
  try {
    const { order, intakeForm, draft } = event.data;
    const blob = await createFinalAnamnesisPdfBlob(order, intakeForm, draft);
    const arrayBuffer = await blob.arrayBuffer();
    const response: FinalAnamnesisPdfWorkerResponse = { status: 'success', arrayBuffer };

    workerScope.postMessage(response, [arrayBuffer]);
  } catch {
    const response: FinalAnamnesisPdfWorkerResponse = {
      status: 'error',
      message: 'Não foi possível gerar o PDF final da anamnese.',
    };

    workerScope.postMessage(response);
  }
};
