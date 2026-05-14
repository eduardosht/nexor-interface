import { useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import logoDark from '../../assets/logo-nexor.png';
import * as S from './styles';







const NAV_ITEMS = [
  { label: 'SOBRE', hash: 'quem-somos' },
  { label: 'PRODUTOS', hash: 'produtos' },
  { label: 'DEPOIMENTOS', hash: 'depoimentos' },
  { label: 'CONTATO', hash: 'contato' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const location = useLocation();

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 20));

  function goToSection(hash: string) {
    if (location.pathname === '/') {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${hash}`);
    }
  }

  function goHome() {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  }

  return (
    <S.Nav
      style={{
        boxShadow: scrolled
          ? '0 1px 12px rgba(0,0,0,0.08)'
          : '0 0 0 rgba(0,0,0,0)',
      }}
      aria-label="Navegação principal"
    >
      <S.Brand onClick={goHome} aria-label="Nexor — início">
        <S.LogoImg src={logoDark} alt="Nexor" />
      </S.Brand>
      <S.Links>
        {NAV_ITEMS.map(({ label, hash }) => (
          <li key={hash}>
            <S.NavLink onClick={() => goToSection(hash)}>{label}</S.NavLink>
          </li>
        ))}
      </S.Links>
      <S.EnterButton to="/entrar">Entrar no portal</S.EnterButton>
    </S.Nav>
  );
}
