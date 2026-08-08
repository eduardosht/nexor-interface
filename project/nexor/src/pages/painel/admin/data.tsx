import { Badge, Button, StatusIndicator } from '@nexor/design-system';
import { Eye, PencilLine } from 'lucide-react';
import * as S from './data.styles';

export interface AdminOrderRow {
  id: string;
  customer: string;
  email: string;
  product: string;
  status: 'Pendente' | 'Avaliação' | 'Produção' | 'Entrega' | 'Concluído';
  stage: string;
  date: string;
  amount: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  profile: 'Cliente' | 'Dentista' | 'Parceiro';
  status: 'Ativo' | 'Pendente';
  createdAt: string;
  lastAccess: string;
}

export interface AdminStat {
  label: string;
  value: string;
}

export interface BusinessSegmentContent {
  process: {
    paymentDay: string;
    commission: string;
    processingDeadline: string;
    monthlyLimit: string;
  };
  credentialing: {
    marketCriteria: string;
    maxPerRegion: string;
  };
  contracts: Array<{ title: string; description: string }>;
}


export const ADMIN_ORDER_STATS: AdminStat[] = [
  { label: 'Total de Ordens', value: '5' },
  { label: 'Pendentes', value: '1' },
  { label: 'Em Produção', value: '1' },
  { label: 'Em Entrega', value: '1' },
  { label: 'Concluídas', value: '1' },
];

export const ADMIN_ORDERS: AdminOrderRow[] = [
  {
    id: 'BP-001',
    customer: 'João Silva',
    email: 'joao@email.com',
    product: 'Biteplaner Premium',
    status: 'Produção',
    stage: 'Fabricação',
    date: '03/05/2026',
    amount: 'R$ 1.400,00',
  },
  {
    id: 'BP-002',
    customer: 'Maria Santos',
    email: 'maria@email.com',
    product: 'Biteplaner Premium',
    status: 'Avaliação',
    stage: 'Moldagem',
    date: '02/05/2026',
    amount: 'R$ 1.400,00',
  },
  {
    id: 'BP-003',
    customer: 'Pedro Costa',
    email: 'pedro@email.com',
    product: 'Biteplaner Premium',
    status: 'Concluído',
    stage: 'Finalizado',
    date: '01/05/2026',
    amount: 'R$ 1.400,00',
  },
  {
    id: 'BP-004',
    customer: 'Ana Paula',
    email: 'ana@email.com',
    product: 'Biteplaner Premium',
    status: 'Entrega',
    stage: 'Em trânsito',
    date: '30/04/2026',
    amount: 'R$ 1.400,00',
  },
  {
    id: 'BP-005',
    customer: 'Carlos Mendes',
    email: 'carlos@email.com',
    product: 'Biteplaner Premium',
    status: 'Pendente',
    stage: 'Agendamento',
    date: '29/04/2026',
    amount: 'R$ 1.400,00',
  },
];

export const ORDER_FILTERS = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Avaliação', label: 'Avaliação' },
  { value: 'Produção', label: 'Produção' },
  { value: 'Entrega', label: 'Entrega' },
  { value: 'Concluído', label: 'Concluído' },
];

export const ADMIN_USER_STATS: AdminStat[] = [
  { label: 'Total de Usuários', value: '5' },
  { label: 'Clientes', value: '3' },
  { label: 'Dentistas', value: '1' },
  { label: 'Parceiros', value: '1' },
];

export const ADMIN_USERS: AdminUserRow[] = [
  {
    id: 'U001',
    name: 'Joao Silva',
    email: 'joao@email.com',
    profile: 'Cliente',
    status: 'Ativo',
    createdAt: '01/03/2026',
    lastAccess: '04/05/2026',
  },
  {
    id: 'U002',
    name: 'Dr. Carlos Mendes',
    email: 'carlos@dentista.com',
    profile: 'Dentista',
    status: 'Ativo',
    createdAt: '15/02/2026',
    lastAccess: '03/05/2026',
  },
  {
    id: 'U003',
    name: 'Maria Santos',
    email: 'maria@email.com',
    profile: 'Cliente',
    status: 'Ativo',
    createdAt: '20/03/2026',
    lastAccess: '04/05/2026',
  },
  {
    id: 'U004',
    name: 'Academia Power',
    email: 'contato@power.com',
    profile: 'Parceiro',
    status: 'Ativo',
    createdAt: '10/01/2026',
    lastAccess: '02/05/2026',
  },
  {
    id: 'U006',
    name: 'Pedro Costa',
    email: 'pedro@email.com',
    profile: 'Cliente',
    status: 'Pendente',
    createdAt: '03/05/2026',
    lastAccess: 'Nunca',
  },
];

export const USER_FILTERS = [
  { value: 'Cliente', label: 'Cliente' },
  { value: 'Dentista', label: 'Dentista' },
  { value: 'Parceiro', label: 'Parceiro' },
];

export const BUSINESS_SETTINGS_CONTENT: Record<'partners' | 'dentists', BusinessSegmentContent> = {
  partners: {
    process: {
      paymentDay: '5',
      commission: '15',
      processingDeadline: '30',
      monthlyLimit: 'R$ 50.000,00',
    },
    credentialing: {
      marketCriteria: 'Por densidade populacional',
      maxPerRegion: '3',
    },
    contracts: [
      {
        title: 'Contrato de Intencao de Credenciamento',
        description: 'Documento inicial para manifestácao de interesse comercial.',
      },
      {
        title: 'Contrato de Credenciamento',
        description: 'Contrato oficial de parceria comercial com regras operacionais.',
      },
      {
        title: 'Termo de Distrato',
        description: 'Documento padrão de encerramento da parceria e repasses pendentes.',
      },
    ],
  },
  dentists: {
    process: {
      paymentDay: '7',
      commission: '12',
      processingDeadline: '20',
      monthlyLimit: 'R$ 25.000,00',
    },
    credentialing: {
      marketCriteria: 'Densidade populacional e perfil de renda',
      maxPerRegion: '5',
    },
    contracts: [
      {
        title: 'Carta de Intencao Profissional',
        description: 'Documento inicial para avaliação do interesse do dentista.',
      },
      {
        title: 'Contrato de Licenciamento Odontologico',
        description: 'Regras de licenciamento, atendimento e repasse por atendimento.',
      },
      {
        title: 'Termo de Distrato Profissional',
        description: 'Encerramento padrão do vínculo com orientações de transição.',
      },
    ],
  },
};

const ORDER_STATUS_COLORS: Record<AdminOrderRow['status'], string> = {
  Pendente: '#D18A00',
  Avaliação: '#3B82F6',
  Produção: '#8B5CF6',
  Entrega: '#EA580C',
  Concluído: '#16A34A',
};

export function renderOrderStatus(status: AdminOrderRow['status']) {
  return <StatusIndicator color={ORDER_STATUS_COLORS[status]} label={status} />;
}

const USER_PROFILE_COLORS: Record<AdminUserRow['profile'], string> = {
  Cliente: '#2563EB',
  Dentista: '#16A34A',
  Parceiro: '#EA580C',
};

export function renderUserProfile(profile: AdminUserRow['profile']) {
  return <StatusIndicator color={USER_PROFILE_COLORS[profile]} label={profile} />;
}

export function renderUserStatus(status: AdminUserRow['status']) {
  return <Badge tone={status === 'Ativo' ? 'success' : 'warning'}>{status}</Badge>;
}

export function renderViewAction(label: string) {
  return (
    <S.TableActionWrap>
      <Button
        variant="ghost"
        size="sm"
        aria-label={label}
        leadingIcon={<Eye size={14} />}
      >
        Ver
      </Button>
    </S.TableActionWrap>
  );
}

export function renderEditAction(label: string) {
  return (
    <S.TableActionWrap>
      <Button
        variant="ghost"
        size="sm"
        aria-label={label}
        leadingIcon={<PencilLine size={14} />}
      >
        Editar
      </Button>
    </S.TableActionWrap>
  );
}
