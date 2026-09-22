import { useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { Boxes, Info, Mail, Star, type LucideIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { publicOptimizedImages } from '../../assets/publicOptimizedImages';
import { getAccessibleScrollBehavior } from '../../lib/accessibility';
import * as S from './styles';


const NAV_ITEMS = [
  { label: 'SOBRE', mobileLabel: 'Sobre', hash: 'quem-somos', Icon: Info },
  { label: 'PRODUTOS', mobileLabel: 'Produtos', hash: 'produtos', Icon: Boxes },
  { label: 'DEPOIMENTOS', mobileLabel: 'Depoimentos', hash: 'depoimentos', Icon: Star },
  { label: 'CONTATO', mobileLabel: 'Contato', hash: 'contato', Icon: Mail },
] satisfies Array<{ label: string; mobileLabel: string; hash: string; Icon: LucideIcon }>;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const location = useLocation();

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 20));

  function goToSection(hash: string) {
    if (location.pathname === '/') {
      document.getElementById(hash)?.scrollIntoView({ behavior: getAccessibleScrollBehavior(), block: 'start' });
    } else {
      navigate(`/#${hash}`);
    }
  }

  function goHome() {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: getAccessibleScrollBehavior() });
    } else {
      navigate('/');
    }
  }

  return (
    <>
      <S.Nav
        style={{
          boxShadow: scrolled
            ? '0 1px 12px rgba(0,0,0,0.08)'
            : '0 0 0 rgba(0,0,0,0)',
        }}
        aria-label="Navegação principal"
      >
        <S.Brand type="button" onClick={goHome} aria-label="Nexor — início">
          <S.LogoImg src={publicOptimizedImages.shared.nexorLogo.webp} alt="Nexor" width={260} height={83} />
        </S.Brand>
        <S.Links>
          {NAV_ITEMS.map(({ label, hash }) => (
            <li key={hash}>
              <S.NavLink type="button" onClick={() => goToSection(hash)}>{label}</S.NavLink>
            </li>
          ))}
        </S.Links>
      </S.Nav>
      <S.MobileBottomNav aria-label="Navegação principal mobile">
        {NAV_ITEMS.map(({ mobileLabel, hash, Icon }) => (
          <S.MobileBottomNavButton key={hash} type="button" onClick={() => goToSection(hash)}>
            <Icon size={18} aria-hidden="true" />
            <span>{mobileLabel}</span>
          </S.MobileBottomNavButton>
        ))}
      </S.MobileBottomNav>
    </>
  );
}
