export type BiteplanerCompletionSlotKey = 'upper_scan' | 'lower_scan' | 'bite_registration';

export interface BiteplanerCompletionAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: string;
  uploadedAt: string;
}

export interface BiteplanerCompletionSlot {
  slotKey: BiteplanerCompletionSlotKey;
  label: string;
  required: true;
  attachment: BiteplanerCompletionAttachment | null;
}

export interface BiteplanerOrderCompletionResponse {
  order: {
    id: string;
    status: string;
  };
  completion: {
    canSubmit: boolean;
    correctionMessage: string | null;
    slots: BiteplanerCompletionSlot[];
  };
}

export interface CompletionAttachmentUploadIntentInput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256?: string;
}

export interface CompletionAttachmentUploadIntentResponse {
  uploadId: string;
  objectKey: string;
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
}

export interface ConfirmCompletionAttachmentUploadInput extends CompletionAttachmentUploadIntentInput {
  uploadId: string;
  objectKey: string;
}

export interface ConfirmCompletionAttachmentUploadResponse {
  fileRef: {
    id: string;
    slotKey: BiteplanerCompletionSlotKey;
    objectKey?: string;
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
    status?: string;
    uploadedAt?: string;
  };
}