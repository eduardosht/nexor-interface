import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { DataTable, StatusIndicator, type DataTableColumn } from '@nexor/design-system';
import { BarChart3, Check, Copy, Eye, Link2, Mail, MessageCircle, Trash2, UserRound, X } from 'lucide-react';
import { SkeletonTable } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
  createPartnerInviteLink,
  fetchPartnerOverview,
  formatDate,
  getAuthToken,
  removePartnerInviteLink,
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
  const moduleSize = 12;
  const quietZone = 20;
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

  async function handleRemoveLink(inviteLink: PartnerOverviewResponse['inviteLinks'][number]) {
    setError('');
    setNotice('');

    if (inviteLink.status !== 'active') {
      setError('Apenas links ativos podem ser removidos.');
      return;
    }

    setActiveAction(`partner:remove-link:${inviteLink.id}`);

    try {
      await removePartnerInviteLink(inviteLink.id, token);
      setNotice('Link individual removido.');
      if (selectedInviteLink?.id === inviteLink.id) {
        setSelectedInviteLink(null);
      }
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
      label: 'Ações',
      render: (row) => {
        const isActive = row.status === 'active';
        const actionTarget = row.intendedCustomerName ?? row.token;
        const inactiveTitle = 'Disponível apenas para links ativos';

        return (
          <S.TableActionRow>
            <S.IconActionButton
              type="button"
              aria-label={
                isActive
                  ? `Visualizar link ${actionTarget}`
                  : `Visualizar link indisponível ${actionTarget}`
              }
              disabled={!isActive}
              title={isActive ? 'Visualizar link individual' : inactiveTitle}
              onClick={() => {
                if (isActive) {
                  setSelectedInviteLink(row);
                }
              }}
            >
              <Eye size={16} aria-hidden />
            </S.IconActionButton>
            <S.IconActionButton
              type="button"
              aria-label={isActive ? `Remover link ${actionTarget}` : `Remover link indisponível ${actionTarget}`}
              disabled={!isActive || activeAction === `partner:remove-link:${row.id}`}
              title={isActive ? 'Remover link individual' : inactiveTitle}
              onClick={() => {
                void handleRemoveLink(row);
              }}
            >
              <Trash2 size={16} aria-hidden />
            </S.IconActionButton>
          </S.TableActionRow>
        );
      },
    },
  ];

  const leadColumns: DataTableColumn<PartnerOverviewResponse['leads'][number]>[] = [
    { key: 'customer', label: 'Cliente', render: (row) => row.customerName },
    { key: 'email', label: 'E-mail', render: (row) => row.customerEmail },
    { key: 'stage', label: 'Status', render: (row) => row.statusLabel },
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
      <S.ReferralHero>
        <S.HeroCopy>
          <S.Eyebrow>Parceiro Biteplaner</S.Eyebrow>
          <S.Title $showcase>Indicar</S.Title>
          <S.Description $showcase>Gere links individuais, compartilhe por QR code ou URL e acompanhe as indicações já realizadas.</S.Description>
        </S.HeroCopy>
        <S.ReferralHeroVisual aria-hidden="true">
          <S.ReferralHeroLinkBadge>
            <Link2 size={28} aria-hidden />
          </S.ReferralHeroLinkBadge>
          <S.ReferralHeroBrowser>
            <S.HeroBrowserChrome>
              <span />
              <span />
              <span />
            </S.HeroBrowserChrome>
            <S.ReferralHeroBrowserBody>
              <S.PartnerHeroLine $width="82%" />
              <S.PartnerHeroLine $width="62%" />
              <S.PartnerHeroLine $width="48%" />
              <S.PartnerHeroLine $width="38%" />
              <S.PartnerHeroLine $width="54%" />
              <S.ReferralHeroSuccess>
                <Check size={18} aria-hidden />
              </S.ReferralHeroSuccess>
            </S.ReferralHeroBrowserBody>
          </S.ReferralHeroBrowser>
          <S.ReferralHeroBars>
            <span />
            <span />
            <span />
          </S.ReferralHeroBars>
        </S.ReferralHeroVisual>
      </S.ReferralHero>

      {notice ? <S.Banner>{notice}</S.Banner> : null}
      {error ? <S.Banner role="alert">{error}</S.Banner> : null}

      <S.ReferralPanel>
        <S.ReferralPanelHeader>
          <S.PartnerPanelIcon $tone="blue">
            <Link2 size={22} aria-hidden />
          </S.PartnerPanelIcon>
          <span>
            <S.PanelTitle>Novo link de indicação</S.PanelTitle>
            <S.PanelText>Use um link por cliente qualificado para preservar atribuição comercial e conversão.</S.PanelText>
          </span>
        </S.ReferralPanelHeader>

        <S.ReferralForm onSubmit={handleCreateLink}>
          <S.ReferralField>
            <span>Cliente qualificado</span>
            <label>
              <UserRound size={18} aria-hidden />
              <input
                aria-label="Cliente qualificado"
                placeholder="Nome da pessoa abordada"
                value={qualifiedCustomerName}
                onChange={(event) => setQualifiedCustomerName(event.target.value)}
              />
            </label>
          </S.ReferralField>
          <S.ReferralField>
            <span>E-mail do contato</span>
            <label>
              <Mail size={18} aria-hidden />
              <input
                aria-label="E-mail do contato"
                placeholder="opcional@cliente.com"
                value={qualifiedCustomerEmail}
                onChange={(event) => setQualifiedCustomerEmail(event.target.value)}
              />
            </label>
          </S.ReferralField>
          <S.ReferralSubmitButton type="submit" disabled={activeAction === 'partner:create-link'}>
            <Link2 size={16} aria-hidden />
            {activeAction === 'partner:create-link' ? 'Gerando...' : 'Gerar link'}
          </S.ReferralSubmitButton>
        </S.ReferralForm>
      </S.ReferralPanel>

      <S.ReferralPanel>
        <S.SectionStack>
          <S.ReferralPanelHeader>
            <S.PartnerPanelIcon $tone="blue">
              <Link2 size={22} aria-hidden />
            </S.PartnerPanelIcon>
            <span>
              <S.PanelTitle>Links gerados</S.PanelTitle>
              <S.PanelText>Lista de links individuais criados pelo parceiro.</S.PanelText>
            </span>
          </S.ReferralPanelHeader>
          {loading ? (
            <SkeletonTable rows={4} columns={5} />
          ) : (
            <DataTable
              data={overview?.inviteLinks ?? []}
              columns={linkColumns}
              keyExtractor={(row) => row.id}
              pageSize={6}
              emptyMessage="Nenhum link individual gerado."
            />
          )}
        </S.SectionStack>
      </S.ReferralPanel>

      <S.ReferralPanel>
        <S.SectionStack>
          <S.ReferralPanelHeader>
            <S.PartnerPanelIcon $tone="green">
              <BarChart3 size={22} aria-hidden />
            </S.PartnerPanelIcon>
            <span>
              <S.PanelTitle>Indicações convertidas</S.PanelTitle>
              <S.PanelText>Clientes que entraram no funil por links do parceiro.</S.PanelText>
            </span>
          </S.ReferralPanelHeader>
          {loading ? (
            <SkeletonTable rows={4} columns={4} />
          ) : (
            <DataTable
              data={overview?.leads ?? []}
              columns={leadColumns}
              keyExtractor={(row) => row.id}
              pageSize={6}
              emptyMessage="Nenhuma indicação convertida."
            />
          )}
        </S.SectionStack>
      </S.ReferralPanel>

      {selectedInviteLink ? (
        <S.ModalOverlay role="dialog" aria-modal="true" aria-label="Visualizar link individual" onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedInviteLink(null);
        }}>
          <S.ReferralInviteModalBox>
            <S.ReferralInviteModalHeader>
              <div>
                <S.ReferralInviteModalTitle>Visualizar link individual</S.ReferralInviteModalTitle>
                <S.ReferralInviteModalSubtitle>
                  <strong>Nome:</strong> {selectedInviteLink.intendedCustomerName ?? 'Cliente qualificado'}
                </S.ReferralInviteModalSubtitle>
              </div>
              <S.ReferralInviteModalCloseButton type="button" aria-label="Fechar modal do link" onClick={() => setSelectedInviteLink(null)}>
                <X size={22} strokeWidth={2.3} aria-hidden />
              </S.ReferralInviteModalCloseButton>
            </S.ReferralInviteModalHeader>

            <S.ReferralInviteQrShell>
              <S.ReferralInviteQrFrame>
                <DemoQrCode value={selectedInviteUrl} />
              </S.ReferralInviteQrFrame>
              <S.ReferralInviteQrCaption>
                <Link2 size={18} strokeWidth={2.2} aria-hidden />
                QR code de apresentação
              </S.ReferralInviteQrCaption>
            </S.ReferralInviteQrShell>

            <S.ReferralInviteModalField>
              <S.ReferralInviteModalLabel>Link individual</S.ReferralInviteModalLabel>
              <S.ReferralInviteLinkInputGroup>
                <S.ReferralInviteLinkPreview value={selectedInviteUrl} readOnly aria-label="Link individual do parceiro" />
                <S.ReferralInviteInlineCopyButton
                  type="button"
                  aria-label="Copiar link individual"
                  onClick={() => {
                    void navigator.clipboard.writeText(selectedInviteUrl).then(() => setNotice('Link copiado para compartilhar com o cliente.'));
                  }}
                >
                  <Copy size={18} strokeWidth={2.2} aria-hidden />
                </S.ReferralInviteInlineCopyButton>
              </S.ReferralInviteLinkInputGroup>
            </S.ReferralInviteModalField>

            <S.ReferralInviteModalActions>
              <S.ReferralInviteCopyButton type="button" onClick={() => {
                void navigator.clipboard.writeText(selectedInviteUrl).then(() => setNotice('Link copiado para compartilhar com o cliente.'));
              }}>
                <Copy size={18} strokeWidth={2.2} aria-hidden />
                Copiar link
              </S.ReferralInviteCopyButton>
              <S.ReferralInviteActionLink
                href={emailHref}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mail size={18} strokeWidth={2.2} aria-hidden />
                Enviar por e-mail
              </S.ReferralInviteActionLink>
              <S.ReferralInviteActionLink
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle size={18} strokeWidth={2.2} aria-hidden />
                Abrir WhatsApp
              </S.ReferralInviteActionLink>
            </S.ReferralInviteModalActions>
          </S.ReferralInviteModalBox>
        </S.ModalOverlay>
      ) : null}
    </S.Page>
  );
}
