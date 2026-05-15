import { useAdminPortal } from '../../../features/admin/portal';
import * as S from './styles';

export function AdminProductGate() {
  const { selectedProduct } = useAdminPortal();

  if (selectedProduct) {
    return null;
  }

  return (
    <S.EmptyStateWrap padding="lg">
      <S.SectionTitle>Selecione um produto para continuar</S.SectionTitle>
      <S.SectionDescription>
        O portal administrativo da Nexor organiza usuários, ordens e configurações por produto.
        Escolha o produto que deseja gerenciar antes de abrir os modulos operacionais.
      </S.SectionDescription>
      <S.EmptyStateLink to="/painel/admin/home">Escolher produto</S.EmptyStateLink>
    </S.EmptyStateWrap>
  );
}
