import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Button } from '../../Button';
import { adminColor } from '../adminTheme';

export interface AdminMobileRecordMetadataItem {
  label: string;
  value: ReactNode;
}

export interface AdminMobileRecordCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  status?: ReactNode;
  metadata?: AdminMobileRecordMetadataItem[];
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  testId?: string;
}

export function AdminMobileRecordCard({
  title,
  subtitle,
  status,
  metadata = [],
  primaryAction,
  secondaryActions,
  footer,
  children,
  onClick,
  testId,
}: AdminMobileRecordCardProps) {
  return (
    <Card data-testid={testId} onClick={onClick}>
      <Header>
        <TitleBlock>
          <Title>{title}</Title>
          {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
        </TitleBlock>
        {status ? <StatusSlot>{status}</StatusSlot> : null}
      </Header>

      {metadata.length > 0 ? (
        <MetaGrid>
          {metadata.map((item) => (
            <MetaItem key={item.label}>
              <MetaLabel>{item.label}</MetaLabel>
              <MetaValue>{item.value}</MetaValue>
            </MetaItem>
          ))}
        </MetaGrid>
      ) : null}

      {children}

      {primaryAction || secondaryActions ? (
        <Actions>
          {primaryAction ? <PrimaryActionSlot>{primaryAction}</PrimaryActionSlot> : null}
          {secondaryActions ? <SecondaryActionSlot>{secondaryActions}</SecondaryActionSlot> : null}
        </Actions>
      ) : null}

      {footer ? <Footer>{footer}</Footer> : null}
    </Card>
  );
}

export const AdminMobileCard = styled.article`
  min-width: 0;
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid ${({ theme }) => adminColor(theme, 'borderDefault', 'border', '#E0E0E0')};
  border-radius: 8px;
  background: ${({ theme }) => adminColor(theme, 'bgElevated', 'surface', '#FFFFFF')};
`;

export const AdminMobileCardHeader = styled.div`
  min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;

  > :first-child {
    min-width: 0;
  }
`;

export const AdminMobileCardTitle = styled.strong`
  display: block;
  min-width: 0;
  color: ${({ theme }) => adminColor(theme, 'textPrimary', 'text', '#171717')};
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
`;

export const AdminMobileCardSubtitle = styled.span`
  display: block;
  margin-top: 2px;
  min-width: 0;
  color: ${({ theme }) => adminColor(theme, 'textSecondary', 'textMuted', '#525252')};
  font-size: 12px;
  line-height: 1.3;
  overflow-wrap: anywhere;
`;

export const AdminMobileMetaGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px 9px;
  margin: 0;

  @media (max-width: 340px) {
    grid-template-columns: 1fr;
  }
`;

export const AdminMobileMetaItem = styled.div`
  min-width: 0;
  display: grid;
  gap: 2px;
`;

export const AdminMobileMetaLabel = styled.dt`
  color: ${({ theme }) => adminColor(theme, 'textSecondary', 'textMuted', '#525252')};
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
`;

export const AdminMobileMetaValue = styled.dd`
  min-width: 0;
  margin: 0;
  color: ${({ theme }) => adminColor(theme, 'textPrimary', 'text', '#171717')};
  font-size: 12px;
  line-height: 1.3;
  overflow-wrap: anywhere;
`;

export const AdminMobileActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  > * {
    flex: 1 1 130px;
    min-width: 130px;
  }
`;

export const AdminMobileActionButton = styled(Button).attrs({ variant: 'secondary' as const })`
  width: 100%;
  min-width: 130px;
  min-height: 40px;
  justify-content: center;
  white-space: normal;

  [data-button-content],
  [data-button-label] {
    white-space: normal;
    text-wrap: balance;
  }

  [data-button-icon] {
    flex: 0 0 auto;
  }
`;

const Card = styled(AdminMobileCard)``;
const Header = styled(AdminMobileCardHeader)``;
const TitleBlock = styled.div``;
const Title = styled(AdminMobileCardTitle)``;
const Subtitle = styled(AdminMobileCardSubtitle)``;
const StatusSlot = styled.div`
  flex: 0 0 auto;
`;
const MetaGrid = styled(AdminMobileMetaGrid)``;
const MetaItem = styled(AdminMobileMetaItem)``;
const MetaLabel = styled(AdminMobileMetaLabel)``;
const MetaValue = styled(AdminMobileMetaValue)``;
const Actions = styled(AdminMobileActions)``;
const PrimaryActionSlot = styled.div`
  min-width: 130px;
`;
const SecondaryActionSlot = styled.div`
  flex: 0 0 auto;
  min-width: 0;
`;
const Footer = styled.div`
  min-width: 0;
`;
