import { ClipboardList, FlaskConical, Link2, Stethoscope, User, type LucideIcon } from 'lucide-react';
import type { AccessMode } from '../../demo/biteplanerFlow';

export const MODE_COPY: Record<AccessMode, { title: string; description: string }> = {
  user: {
    title: 'Workspace do atleta',
    description: 'Acompanhe sua jornada Biteplaner, o status atual e o próximo passo visível da demo.'
  },
  partner: {
    title: 'Workspace do parceiro',
    description: 'Veja links, leads e como cada indicado avançou no mesmo funil operacional.'
  },
  dentist: {
    title: 'Workspace do dentista',
    description: 'Gerencie consultas, decisão clínica e liberação produtiva dos pedidos Biteplaner.'
  },
  lab: {
    title: 'Workspace do laboratório',
    description: 'Receba pedidos, devolva ajustes e conclua a etapa produtiva dos pedidos Biteplaner.'
  },
  admin: {
    title: 'Workspace admin',
    description: 'Use o painel administrativo para ver o pipeline transversal completo.'
  }
};

export const MODE_TAB_ICONS: Record<AccessMode, LucideIcon> = {
  user: User,
  partner: Link2,
  dentist: Stethoscope,
  lab: FlaskConical,
  admin: ClipboardList,
};
