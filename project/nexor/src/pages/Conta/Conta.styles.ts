import styled from 'styled-components';

export const Page = styled.main`
  min-height: 100vh;
  padding: 120px 20px 48px;
  background:
    radial-gradient(circle at top left, rgba(23, 23, 23, 0.08), transparent 32%),
    linear-gradient(180deg, #f5f4ef 0%, #ece9df 100%);
`;

export const Shell = styled.section`
  width: min(100%, 980px);
  margin: 0 auto;
  display: grid;
  gap: 20px;
`;

export const Hero = styled.div`
  background: rgba(255, 255, 255, 0.92);
  border-radius: 28px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  padding: 28px;
  box-shadow: 0 16px 48px rgba(23, 23, 23, 0.08);
`;

export const ProductCard = styled.a`
  display: grid;
  gap: 8px;
  background: #171717;
  color: #fff;
  border-radius: 24px;
  padding: 24px;
`;

export const LogoutButton = styled.button`
  width: fit-content;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 14px;
  background: #fff;
  padding: 12px 16px;
  cursor: pointer;
  font: inherit;
`;
