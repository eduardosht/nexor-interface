import { api } from '../../lib/api';
import type {
  BiteplanerCompletionSlotKey,
  BiteplanerOrderCompletionResponse,
  CompletionAttachmentUploadIntentInput,
  CompletionAttachmentUploadIntentResponse,
  ConfirmCompletionAttachmentUploadInput,
  ConfirmCompletionAttachmentUploadResponse,
} from './biteplanerOrderCompletion.types';

const completionBasePath = (orderId: string) => `/v1/commerce/biteplaner/orders/${orderId}`;

const completionSlotLabels: Record<BiteplanerCompletionSlotKey, string> = {
  two_arches_scan: 'Escaneamento 3D das duas arcadas',
  lateral_jig_scan: 'Escaneamento 3D lateral com JIG',
  prescription_image: 'Imagem da prescrição',
};

export const fetchBiteplanerOrderCompletion = (orderId: string, token: string) =>
  api.get<BiteplanerOrderCompletionResponse>(`${completionBasePath(orderId)}/completion`, token);

export const createCompletionAttachmentUploadIntent = (
  orderId: string,
  slotKey: BiteplanerCompletionSlotKey,
  input: CompletionAttachmentUploadIntentInput,
  token: string
) => api.post<CompletionAttachmentUploadIntentResponse>(
  `${completionBasePath(orderId)}/attachments/${slotKey}/upload-intent`,
  input,
  token
);

export const confirmCompletionAttachmentUpload = (
  orderId: string,
  slotKey: BiteplanerCompletionSlotKey,
  input: ConfirmCompletionAttachmentUploadInput,
  token: string
) => api.post<ConfirmCompletionAttachmentUploadResponse>(
  `${completionBasePath(orderId)}/attachments/${slotKey}/confirm`,
  input,
  token
);

export const submitBiteplanerOrderCompletion = (orderId: string, token: string) =>
  api.post<BiteplanerOrderCompletionResponse>(`${completionBasePath(orderId)}/completion/submit`, {}, token);

export async function uploadCompletionSlotFile(input: {
  orderId: string;
  slotKey: BiteplanerCompletionSlotKey;
  file: File;
  token: string;
  fetchImpl?: typeof fetch;
}) {
  const mimeType = input.file.type || 'application/octet-stream';
  const intent = await createCompletionAttachmentUploadIntent(input.orderId, input.slotKey, {
    fileName: input.file.name,
    mimeType,
    sizeBytes: input.file.size,
  }, input.token);

  const uploadErrorMessage = `Não foi possível enviar ${completionSlotLabels[input.slotKey]} para o armazenamento privado.`;
  let response: Response;
  try {
    response = await (input.fetchImpl ?? fetch)(intent.uploadUrl, {
      method: 'PUT',
      headers: intent.requiredHeaders,
      body: input.file,
    });
  } catch {
    throw new Error(uploadErrorMessage);
  }

  if (!response.ok) {
    throw new Error(uploadErrorMessage);
  }

  return confirmCompletionAttachmentUpload(input.orderId, input.slotKey, {
    uploadId: intent.uploadId,
    objectKey: intent.objectKey,
    fileName: input.file.name,
    mimeType,
    sizeBytes: input.file.size,
  }, input.token);
}
