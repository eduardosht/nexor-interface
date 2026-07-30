import { Link } from 'react-router-dom';
import { ClipboardList, ShoppingCart } from 'lucide-react';
import * as S from './styles';

export function BiteplanerHome() {
  return (
    <S.Page>
      <S.Header>
        <S.Eyebrow>Biteplaner</S.Eyebrow>
        <S.Title>Home Biteplaner</S.Title>
        <S.Description>
          Acesse a compra do Biteplaner, acompanhe ordens e mantenha a operação alinhada ao fluxo atual da Nexor.
        </S.Description>
      </S.Header>

      <S.ActionsGrid aria-label="Atalhos Biteplaner">
        <S.ActionLink to="/painel/compra">
          <S.ActionIcon $tone="purchase" aria-hidden><ShoppingCart size={20} /></S.ActionIcon>
          <span>
            <strong>Comprar Biteplaner</strong>
            <small>Inicie ou continue a compra diretamente com a Nexor.</small>
          </span>
        </S.ActionLink>
        <S.ActionLink to="/painel/biteplaner/ordens">
          <S.ActionIcon $tone="orders" aria-hidden><ClipboardList size={20} /></S.ActionIcon>
          <span>
            <strong>Ver ordens</strong>
            <small>Acompanhe pedidos, documentação do dentista e etapas de produção externa.</small>
          </span>
        </S.ActionLink>
      </S.ActionsGrid>

      <S.HelperPanel>
        <p>
          A Nexor coordena a produção com fornecedores externos fora da plataforma, e o produto é enviado diretamente ao dentista.
        </p>
        <Link to="/painel/biteplaner/ordens">Acompanhar ordens</Link>
      </S.HelperPanel>
    </S.Page>
  );
}