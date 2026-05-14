import { Button } from '@nexor/design-system';
import logoDark from '../../assets/logo-nexor.png';
import * as S from './styles';















type FooterProps = {
  onManageCookies?: () => void;
};

export function Footer({ onManageCookies }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <S.FooterEl>
      <S.Main>
        <S.Brand>
          <S.LogoLink href="#top" aria-label="Nexor — início">
            <S.LogoImg src={logoDark} alt="Nexor" />
          </S.LogoLink>
          <S.Tagline>
            Pesquisa, criação e tecnologia para atletas que exigem o máximo com segurança e resultado.
          </S.Tagline>
        </S.Brand>

        <S.NavColumn>
          <S.NavHeading>Mapa do site</S.NavHeading>
          <S.NavLink to="/#quem-somos">Quem Somos</S.NavLink>
          <S.NavLink to="/#produtos">Produtos</S.NavLink>
          <S.NavLink to="/#depoimentos">Depoimentos</S.NavLink>
          <S.NavLink to="/#contato">Contato</S.NavLink>
        </S.NavColumn>

        <S.NavColumn>
          <S.NavHeading>Legal</S.NavHeading>
          <S.NavLinkRouter to="/privacidade">Política de Privacidade</S.NavLinkRouter>
          <S.NavLinkRouter to="/termos">Termos de Uso</S.NavLinkRouter>
          <S.NavLinkRouter to="/cookies">Cookies</S.NavLinkRouter>
        </S.NavColumn>
      </S.Main>

      <div>
        <S.Bottom>
          <S.Copyright>© {year} Nexor. Todos os direitos reservados.</S.Copyright>
          <S.LegalLinks>
            <S.LegalLinkRouter to="/privacidade">Política de Privacidade</S.LegalLinkRouter>
            <S.LegalLinkRouter to="/termos">Termos de Uso</S.LegalLinkRouter>
            <Button size="sm" variant="ghost" type="button" onClick={onManageCookies}>
              Preferências de cookies
            </Button>
          </S.LegalLinks>
        </S.Bottom>
      </div>
    </S.FooterEl>
  );
}
