import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button, DataTable, Field, StatusIndicator, type DataTableColumn } from '@nexor/design-system';
import { Eye, Link2, Mail, MessageCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import {
  createPartnerInviteLink,
  fetchPartnerOverview,
  formatDate,
  getAuthToken,
  type PartnerOverviewResponse,
} from '../../../features/demo/biteplanerFlow';
import * as S from '../BiteplanerHub/styles';

function buildPartnerInviteLink(token: string) {
  if (typeof window === 'undefined') {
    return `https://nexor.local/cadastro?invite=${encodeURIComponent(token)}`;
  }

  return new URL(`/cadastro?invite=${encodeURIComponent(token)}`, window.location.origin).toString();
}

function createQrMatrix(value: string) {
  const size = 21;
  const seed = Array.from(value).reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
  const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => false));

  function drawFinder(startRow: number, startColumn: number) {
    for (let row = 0; row < 7; row += 1) {
      for (let column = 0; column < 7; column += 1) {
        const isBorder = row === 0 || row === 6 || column === 0 || column === 6;
        const isCore = row >= 2 && row <= 4 && column >= 2 && column <= 4;
        matrix[startRow + row][startColumn + column] = isBorder || isCore;
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const insideFinder =
        (row < 7 && column < 7) ||
        (row < 7 && column >= size - 7) ||
        (row >= size - 7 && column < 7);

      if (!insideFinder) {
        matrix[row][column] = (seed + row * 17 + column * 31 + row * column * 7) % 5 < 2;
      }
    }
  }

  return matrix;
}

function DemoQrCode({ value }: { value: string }) {
  const matrix = useMemo(() => createQrMatrix(value), [value]);
  const moduleSize = 8;
  const quietZone = 12;
  const size = matrix.length * moduleSize + quietZone * 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="QR code do link" role="img">
      <rect width={size} height={size} rx="16" fill="#FFFFFF" />
      {matrix.flatMap((row, rowIndex) =>
        row.map((filled, columnIndex) =>
          filled ? (
            <rect
              key={`${rowIndex}-${columnIndex}`}
              x={quietZone + columnIndex * moduleSize}
              y={quietZone + rowIndex * moduleSize}
              width={moduleSize}
              height={moduleSize}
              fill="#171717"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export function PartnerReferralPage() {
  const { session } = useAuth();
  const token = getAuthToken(session);
  const [overview, setOverview] = useState<PartnerOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [qualifiedCustomerName, setQualifiedCustomerName] = useState('');
  const [qualifiedCustomerEmail, setQualifiedCustomerEmail] = useState('');
  const [selectedInviteLink, setSelectedInviteLink] = useState<PartnerOverviewResponse['inviteLinks'][number] | null>(null);

  async function loadOverview() {
    setLoading(true);
    try {
      setOverview(await fetchPartnerOverview(token));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOverview();
  }, [token]);

  async function handleCreateLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!qualifiedCustomerName.trim()) {
      setError('Informe o nome do cliente qualificado antes de gerar um link individual.');
      return;
    }

    setActiveAction('partner:create-link');
    try {
      await createPartnerInviteLink(
        {
          customerName: qualifiedCustomerName.trim(),
          customerEmail: qualifiedCustomerEmail.trim() || undefined,
        },
        token
      );
      setQualifiedCustomerName('');
      setQualifiedCustomerEmail('');
      setNotice('Novo link individual gerado para um cliente qualificado.');
      await loadOverview();
    } finally {
      setActiveAction('');
    }
  }

  const linkColumns: DataTableColumn<PartnerOverviewResponse['inviteLinks'][number]>[] = [
    { key: 'token', label: 'Token', render: (row) => row.token },
    { key: 'customer', label: 'Cliente qualificado', render: (row) => row.intendedCustomerName ?? 'Não informado' },
    { key: 'email', label: 'Contato', render: (row) => row.intendedCustomerEmail ?? 'Não informado' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusIndicator
          color={row.status === 'active' ? '#15803D' : row.status === 'expired' ? '#B91C1C' : '#2563EB'}
          label={row.status === 'active' ? 'Ativo' : row.status === 'expired' ? 'Expirado' : 'Consumido'}
        />
      ),
    },
    { key: 'created', label: 'Gerado em', render: (row) => formatDate(row.created_at) },
    {
      key: 'actions',
      label: 'Visualizar',
      render: (row) => (
        <S.IconActionButton type="button" aria-label={`Visualizar link ${row.intendedCustomerName ?? row.token}`} onClick={() => setSelectedInviteLink(row)}>
          <Eye size={16} aria-hidden />
        </S.IconActionButton>
      ),
    },
  ];

  const leadColumns: DataTableColumn<PartnerOverviewResponse['leads'][number]>[] = [
    { key: 'customer', label: 'Cliente', render: (row) => row.customerName },
    { key: 'email', label: 'E-mail', render: (row) => row.customerEmail },
    { key: 'stage', label: 'Etapa', render: (row) => row.statusLabel },
    { key: 'created', label: 'Captado em', render: (row) => formatDate(row.created_at) },
  ];

  const selectedInviteUrl = selectedInviteLink ? buildPartnerInviteLink(selectedInviteLink.token) : '';
  const inviteLinkMessage = selectedInviteLink
    ? `Olá! Segue seu link individual do Biteplaner: ${selectedInviteUrl}`
    : '';
  const whatsappHref = selectedInviteLink ? `https://wa.me/?text=${encodeURIComponent(inviteLinkMessage)}` : '#';
  const emailHref = selectedInviteLink
    ? `mailto:${selectedInviteLink.intendedCustomerEmail ?? ''}?subject=${encodeURIComponent('Seu link individual do Biteplaner')}&body=${encodeURIComponent(inviteLinkMessage)}`
    : '#';

  return (
    <S.Page>
      <S.Hero>
        <S.Eyebrow>Parceiro Biteplaner</S.Eyebrow>
        <S.Title>Indicar</S.Title>
        <S.Description>Gere links individuais, compartilhe por QR code ou URL e acompanhe as indicações já realizadas.</S.Description>
      </S.Hero>

      {notice ? <S.Banner>{notice}</S.Banner> : null}
      {error ? <S.Banner role="alert">{error}</S.Banner> : null}

      <S.Panel>
        <S.PanelHeader>
          <S.PanelTitle>Novo link de indicação</S.PanelTitle>
          <S.PanelText>Use um link por cliente qualificado para preservar atribuição comercial e conversão.</S.PanelText>
        </S.PanelHeader>

        <S.InlineForm onSubmit={handleCreateLink}>
          <Field
            as="input"
            label="Cliente qualificado"
            placeholder="Nome da pessoa abordada"
            value={qualifiedCustomerName}
            onChange={(event) => setQualifiedCustomerName(event.target.value)}
          />
          <Field
            as="input"
            label="E-mail do contato"
            placeholder="opcional@cliente.com"
            value={qualifiedCustomerEmail}
            onChange={(event) => setQualifiedCustomerEmail(event.target.value)}
          />
          <S.ActionButton type="submit" disabled={activeAction === 'partner:create-link'}>
            <Link2 size={16} aria-hidden />
            {activeAction === 'partner:create-link' ? 'Gerando...' : 'Gerar link'}
          </S.ActionButton>
        </S.InlineForm>
      </S.Panel>

      <S.Panel>
        <S.SectionStack>
          <S.SectionHeading>
            <S.SectionTitle>Links gerados</S.SectionTitle>
            <S.SectionDescription>Lista de links individuais criados pelo parceiro.</S.SectionDescription>
          </S.SectionHeading>
          <DataTable
            data={overview?.inviteLinks ?? []}
            columns={linkColumns}
            keyExtractor={(row) => row.id}
            pageSize={6}
            emptyMessage={loading ? 'Carregando links...' : 'Nenhum link individual gerado.'}
          />
        </S.SectionStack>

        <S.SectionStack>
          <S.SectionHeading>
            <S.SectionTitle>Indicações convertidas</S.SectionTitle>
            <S.SectionDescription>Clientes que entraram no funil por links do parceiro.</S.SectionDescription>
          </S.SectionHeading>
          <DataTable
            data={overview?.leads ?? []}
            columns={leadColumns}
            keyExtractor={(row) => row.id}
            pageSize={6}
            emptyMessage={loading ? 'Carregando indicações...' : 'Nenhuma indicação convertida.'}
          />
        </S.SectionStack>
      </S.Panel>

      {selectedInviteLink ? (
        <S.ModalOverlay role="dialog" aria-modal="true" aria-label="Visualizar link individual" onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedInviteLink(null);
        }}>
          <S.ModalBox>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>Visualizar link individual</S.ModalTitle>
                <S.ModalSubtitle>{selectedInviteLink.intendedCustomerName ?? 'Cliente qualificado'}</S.ModalSubtitle>
              </div>
              <S.ModalCloseButton type="button" aria-label="Fechar modal do link" onClick={() => setSelectedInviteLink(null)}>
                ×
              </S.ModalCloseButton>
            </S.ModalHeader>

            <S.QrShell>
              <DemoQrCode value={selectedInviteUrl} />
              <S.QrCaption>QR code de apresentação</S.QrCaption>
            </S.QrShell>

            <S.ModalField>
              <S.ModalLabel>Link individual</S.ModalLabel>
              <S.LinkPreview value={selectedInviteUrl} readOnly aria-label="Link individual do parceiro" />
            </S.ModalField>

            <S.ModalActions>
              <Button type="button" variant="secondary" onClick={() => {
                void navigator.clipboard.writeText(selectedInviteUrl).then(() => setNotice('Link copiado para compartilhar com o cliente.'));
              }}>
                Copiar link
              </Button>
              <S.ModalActionLink
                href={emailHref}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mail size={16} aria-hidden />
                Enviar por e-mail
              </S.ModalActionLink>
              <S.ModalActionLink
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle size={16} aria-hidden />
                Abrir WhatsApp
              </S.ModalActionLink>
            </S.ModalActions>
          </S.ModalBox>
        </S.ModalOverlay>
      ) : null}
    </S.Page>
  );
}
