import styled from 'styled-components';

export type AdminStatusPillProps = {
  color: string;
  label: string;
};

export function AdminStatusPill({ color, label }: AdminStatusPillProps) {
  return (
    <Pill>
      <Dot $color={color} aria-hidden />
      {label}
    </Pill>
  );
}

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  color: #171717;
  font-size: 14px;
  line-height: 1.2;
`;

const Dot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: ${({ $color }) => $color};
`;
