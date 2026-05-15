import {
  LegalBody,
  LegalContainer,
  LegalList,
  LegalPage,
  LegalSection,
  LegalSectionTitle,
  LegalTitle,
  LegalUpdatedAt,
} from '../Legal/styles';

export function Cookies() {
  return (
    <LegalPage>
      <LegalContainer>
        <LegalTitle>Política de Cookies</LegalTitle>
        <LegalUpdatedAt>Última atualização: maio de 2026</LegalUpdatedAt>

        <LegalSection>
          <LegalSectionTitle>1. O que são cookies</LegalSectionTitle>
          <LegalBody>
            Cookies são pequenos arquivos de texto usados para lembrar informações do seu navegador durante e após a visita.
            Eles ajudam a manter o site funcionando, preservar escolhas de navegação e, quando você autoriza, medir o uso
            do site para orientar melhorias.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>2. Categorias de cookies</LegalSectionTitle>
          <LegalBody>
            <strong>Cookies necessários:</strong> sustentam funções essenciais, como segurança, navegação básica e memória
            técnica da sessão. Eles permanecem ativos porque sem eles o site pode não funcionar corretamente.
          </LegalBody>
          <LegalBody>
            <strong>Cookies de preferências:</strong> guardam escolhas de navegação para tornar visitas futuras mais simples,
            como preferências operacionais que você autorizou salvar no navegador.
          </LegalBody>
          <LegalBody>
            <strong>Cookies de analytics:</strong> só podem ser ativados com seu consentimento e servem para medir páginas
            acessadas, navegação geral e comportamento agregado de uso. Eles existem para orientar melhorias no site, nunca
            para bloquear sua experiência.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>3. Como você decide</LegalSectionTitle>
          <LegalBody>
            Ao entrar no site, você pode aceitar ou recusar cookies opcionais no banner fixo exibido no rodapé da tela.
            Se quiser mais controle, pode abrir o gerenciamento de preferências e ativar apenas as categorias opcionais que fizerem sentido para você.
          </LegalBody>
          <LegalBody>
            Depois da primeira escolha, você pode reabrir essas preferências pelo rodapé do site e atualizar sua decisão a qualquer momento.
            Quando você estiver autenticado, a Nexor também poderá registrar a preferência escolhida na sua conta para manter histórico de consentimento.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>4. Como gerenciar no navegador</LegalSectionTitle>
          <LegalBody>
            Além do banner do site, você também pode bloquear, revisar ou apagar cookies diretamente no seu navegador.
            Cada navegador organiza esse caminho de um jeito:
          </LegalBody>
          <LegalList>
            <li>Chrome: Configurações → Privacidade e segurança → Cookies</li>
            <li>Firefox: Preferências → Privacidade e Segurança</li>
            <li>Safari: Preferências → Privacidade</li>
            <li>Edge: Configurações → Privacidade, pesquisa e serviços</li>
          </LegalList>
          <LegalBody>
            Desativar cookies opcionais não impede o acesso ao conteúdo institucional. O impacto principal é perder conveniências
            de preferência e deixar de contribuir com medições agregadas de uso quando essa categoria estiver disponível.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>5. Contato</LegalSectionTitle>
          <LegalBody>
            Se tiver dúvidas sobre o uso de cookies neste site, fale com a Nexor pelos canais oficiais informados na página de contato.
          </LegalBody>
        </LegalSection>
      </LegalContainer>
    </LegalPage>
  );
}
