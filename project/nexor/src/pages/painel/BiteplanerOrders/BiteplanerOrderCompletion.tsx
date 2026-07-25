import { AdminFormButton, UploadField, type UploadFieldFile } from '@nexor/design-system';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchBiteplanerOrderCompletion,
  submitBiteplanerOrderCompletion,
  uploadCompletionSlotFile,
} from '../../../features/commerce/biteplanerOrderCompletion.api';
import type {
  BiteplanerCompletionSlotKey,
  BiteplanerOrderCompletionResponse,
} from '../../../features/commerce/biteplanerOrderCompletion.types';
import { useAuth } from '../../../hooks/useAuth';
import * as S from './styles';

const slotStatusLabel = (hasAttachment: boolean, hasSelectedFile: boolean) => {
  if (hasSelectedFile) return 'Arquivo selecionado';
  if (hasAttachment) return 'Arquivo anexado';
  return 'Pendente';
};

export function BiteplanerOrderCompletion() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const token = session?.access_token;
  const [completion, setCompletion] = useState<BiteplanerOrderCompletionResponse | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Partial<Record<BiteplanerCompletionSlotKey, File>>>({});
  const [uploadingSlot, setUploadingSlot] = useState<BiteplanerCompletionSlotKey | null>(null);
  const [slotErrors, setSlotErrors] = useState<Partial<Record<BiteplanerCompletionSlotKey, string>>>({});
  const [removedAttachmentSlots, setRemovedAttachmentSlots] = useState<Partial<Record<BiteplanerCompletionSlotKey, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);

  const loadCompletion = useCallback(async () => {
    const requestId = ++requestSequence.current;

    if (!token || !orderId) {
      setCompletion(null);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetchBiteplanerOrderCompletion(orderId, token);
      if (requestSequence.current === requestId) {
        setCompletion(response);
        setSelectedFiles({});
        setSlotErrors({});
        setRemovedAttachmentSlots({});
        setUploadingSlot(null);
        setSubmitting(false);
      }
    } catch {
      if (requestSequence.current !== requestId) return;
      setCompletion(null);
      setError('Não foi possível carregar o complemento da ordem.');
    } finally {
      if (requestSequence.current === requestId) {
        setLoading(false);
      }
    }
  }, [orderId, token]);

  useEffect(() => {
    void loadCompletion();
    return () => {
      requestSequence.current += 1;
    };
  }, [loadCompletion]);

  const slots = completion?.completion.slots ?? [];
  const allSlotsComplete = useMemo(() => (
    slots.length > 0 && slots.every((slot) => (
      selectedFiles[slot.slotKey] !== undefined ||
      (slot.attachment !== null && removedAttachmentSlots[slot.slotKey] !== true)
    ))
  ), [removedAttachmentSlots, selectedFiles, slots]);
  const canSubmitCompletion = completion?.completion.canSubmit === true && allSlotsComplete;

  const handleFilesChange = (slotKey: BiteplanerCompletionSlotKey) => (files: File[]) => {
    const file = files[0];
    if (!file || submitting) return;

    setSelectedFiles((current) => ({ ...current, [slotKey]: file }));
    setRemovedAttachmentSlots((current) => ({ ...current, [slotKey]: undefined }));
    setSlotErrors((current) => ({ ...current, [slotKey]: undefined }));
  };

  const handleRemoveSlotFile = (slotKey: BiteplanerCompletionSlotKey) => (fileId: string) => {
    setSelectedFiles((current) => {
      const next = { ...current };
      delete next[slotKey];
      return next;
    });
    setSlotErrors((current) => ({ ...current, [slotKey]: undefined }));

    if (fileId.startsWith('attached-')) {
      setRemovedAttachmentSlots((current) => ({ ...current, [slotKey]: true }));
    }
  };

  const getUploadFieldFiles = (
    slot: BiteplanerOrderCompletionResponse['completion']['slots'][number],
    selectedFile: File | undefined
  ): UploadFieldFile[] => {
    const slotError = slotErrors[slot.slotKey];
    if (slotError) {
      return [{
        id: `error-${slot.slotKey}`,
        name: selectedFile?.name ?? slot.attachment?.fileName ?? 'Arquivo selecionado',
        status: 'error',
        errorMessage: slotError,
      }];
    }

    if (selectedFile) {
      return [{
        id: `selected-${slot.slotKey}`,
        name: selectedFile.name,
        status: 'uploaded',
        sizeLabel: 'Arquivo selecionado para envio.',
      }];
    }

    if (slot.attachment !== null && removedAttachmentSlots[slot.slotKey] !== true) {
      return [{
        id: `attached-${slot.slotKey}`,
        name: slot.attachment.fileName,
        status: 'uploaded',
        sizeLabel: 'Arquivo anexado anteriormente.',
      }];
    }

    return [];
  };

  async function handleSubmit() {
    if (!token || !completion || !canSubmitCompletion || submitting) return;

    setSubmitting(true);
    setError('');
    setSlotErrors({});

    let currentUploadSlot: BiteplanerCompletionSlotKey | null = null;

    try {
      for (const slot of completion.completion.slots) {
        const file = selectedFiles[slot.slotKey];
        if (file === undefined) continue;

        currentUploadSlot = slot.slotKey;
        setUploadingSlot(slot.slotKey);
        await uploadCompletionSlotFile({ orderId, slotKey: slot.slotKey, file, token });
      }

      currentUploadSlot = null;
      setUploadingSlot(null);
      await submitBiteplanerOrderCompletion(orderId, token);
      navigate(`/painel/biteplaner/ordens/${orderId}`);
    } catch {
      if (currentUploadSlot !== null) {
        const failedSlot: BiteplanerCompletionSlotKey = currentUploadSlot;
        setSlotErrors((current) => ({
          ...current,
          [failedSlot]: 'Não foi possível enviar este arquivo. Tente novamente.',
        }));
      }
      setError('Não foi possível enviar o complemento da ordem.');
    } finally {
      setUploadingSlot(null);
      setSubmitting(false);
    }
  }

  if (loading) {
    return <S.EmptyState>Carregando complemento da ordem...</S.EmptyState>;
  }

  if (error && completion === null) {
    return (
      <S.EmptyState role="alert">
        <strong>{error}</strong>
        <AdminFormButton type="button" variant="secondary" onClick={() => void loadCompletion()}>
          Tentar novamente
        </AdminFormButton>
      </S.EmptyState>
    );
  }

  if (!completion) {
    return <S.EmptyState>Nenhum complemento encontrado.</S.EmptyState>;
  }

  return (
    <S.DetailPage>
      <S.BackBar to={`/painel/biteplaner/ordens/${orderId}`}>
        <ArrowLeft size={18} aria-hidden />
        Voltar para detalhe da ordem
      </S.BackBar>

      <S.DetailHeader>
        <S.DetailTitle>Complemento da ordem</S.DetailTitle>
        <S.DetailSubtitle>Anexe os arquivos de scan na ordem solicitada para enviar a ordem à revisão técnica da Nexor.</S.DetailSubtitle>
      </S.DetailHeader>

      {completion.completion.correctionMessage ? (
        <S.CorrectionNotice>
          <strong>Observação da Nexor</strong>
          <span>{completion.completion.correctionMessage}</span>
        </S.CorrectionNotice>
      ) : null}

      <S.CompletionSlotList>
        {slots.map((slot, index) => {
          const selectedFile = selectedFiles[slot.slotKey];
          const hasAttachment = slot.attachment !== null && removedAttachmentSlots[slot.slotKey] !== true;
          const isUploading = uploadingSlot === slot.slotKey;

          return (
            <S.CompletionSlotItem key={slot.slotKey} data-testid={`completion-slot-${slot.slotKey}`}>
              <S.CompletionSlotHeader>
                <div>
                  <S.SlotIndex>{index + 1}</S.SlotIndex>
                  <S.SlotTitle>{slot.label}</S.SlotTitle>
                </div>
                <S.CompletionSlotStatus $complete={hasAttachment || selectedFile !== undefined}>
                  {isUploading ? 'Enviando...' : slotStatusLabel(hasAttachment, selectedFile !== undefined)}
                </S.CompletionSlotStatus>
              </S.CompletionSlotHeader>

              {slot.attachment ? <S.FileMeta>Atual: {slot.attachment.fileName}</S.FileMeta> : null}

              <UploadField
                label={slot.label}
                accept=".stl,.ply,.obj,model/stl,application/octet-stream"
                hint="Anexe 1 arquivo de scan neste slot. Formatos aceitos: STL, PLY ou OBJ."
                files={getUploadFieldFiles(slot, selectedFile)}
                onFilesChange={handleFilesChange(slot.slotKey)}
                onRemoveFile={handleRemoveSlotFile(slot.slotKey)}
              />
            </S.CompletionSlotItem>
          );
        })}
      </S.CompletionSlotList>

      {error ? <S.SlotError role="alert">{error}</S.SlotError> : null}

      <S.CompletionActions>
        <AdminFormButton type="button" variant="primary" disabled={!canSubmitCompletion || submitting} onClick={() => void handleSubmit()}>
          {submitting ? 'Enviando complemento...' : 'Enviar complemento'}
        </AdminFormButton>
      </S.CompletionActions>
    </S.DetailPage>
  );
}