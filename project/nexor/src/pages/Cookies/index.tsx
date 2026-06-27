import {
  LegalBody,
  LegalContainer,
  LegalList,
  LegalPage,
  LegalSection,
  LegalSectionTitle,
  LegalTitle,
  LegalUpdatedAt
} from '../Legal/styles';

export function Cookies() {
  return (
    <LegalPage>
      <LegalContainer>
        <LegalTitle>Política de Cookies</LegalTitle>
        <LegalUpdatedAt>Última atualização: junho de 2026</LegalUpdatedAt>

        <LegalSection>
          <LegalSectionTitle>1. O que são cookies e storage local</LegalSectionTitle>
          <LegalBody>
            Cookies são pequenos arquivos de texto usados para lembrar informações do navegador durante e após a visita. Além
            de cookies, a Nexor também pode usar localStorage e sessionStorage para preservar preferências técnicas, consentimentos
            e dados temporários necessários ao funcionamento da plataforma.
          </LegalBody>
          <LegalBody>
            Esses mecanismos ajudam a manter o site funcionando, preservar escolhas de navegação, registrar consentimentos,
            proteger convites, manter sessões e, quando você autoriza, medir o uso do site para orientar melhorias.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>2. Categorias usadas</LegalSectionTitle>
          <LegalBody>
            <strong>Cookies necessários:</strong> sustentam funções essenciais, como segurança, navegação básica, autenticação,
            convite de parceiro, prevenção a fraude e memória técnica da sessão. Eles permanecem ativos porque sem eles o site
            ou o painel podem não funcionar corretamente.
          </LegalBody>
          <LegalBody>
            <strong>Cookies de preferências:</strong> guardam escolhas de navegação para tornar visitas futuras mais simples,
            como consentimento de cookies, preferências operacionais e estado de interface.
          </LegalBody>
          <LegalBody>
            <strong>Cookies de analytics:</strong> só podem ser ativados com seu consentimento e servem para medir páginas
            acessadas, navegação geral e comportamento agregado de uso. Eles existem para orientar melhorias no site.
          </LegalBody>
          <LegalBody>
            <strong>Cookies de marketing:</strong> só devem ser usados quando houver consentimento ou outra base legal aplicável
            e não são necessários para acessar o conteúdo institucional.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>3. Inventário técnico atual</LegalSectionTitle>
          <LegalList>
            <li>localStorage <code>nexor-cookie-consent</code>: registra versão, data e escolhas de cookies necessários, preferências e analytics.</li>
            <li>sessionStorage <code>nexor_pending_registration</code>: preserva dados mínimos do cadastro pendente somente durante a sessão do navegador.</li>
            <li>Cookie <code>nexor_partner_invite</code>: preserva token de convite de parceiro por até 30 dias para concluir cadastro vinculado.</li>
            <li>localStorage de interface: pode guardar preferências operacionais, como estado de menu, persona de demonstração ou continuidade de cadastro.</li>
            <li>Tokens e dados de autenticação podem ser mantidos por provedores de autenticação e infraestrutura para manter sessão, segurança e auditoria.</li>
          </LegalList>
          <LegalBody>
            O conteúdo desses mecanismos deve ser proporcional à finalidade. A Nexor não utiliza cookies opcionais para impedir
            acesso ao conteúdo institucional quando você os recusa.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>4. Como você decide</LegalSectionTitle>
          <LegalBody>
            Ao entrar no site, você pode aceitar ou recusar cookies opcionais no banner fixo exibido no rodapé da tela. Se quiser
            mais controle, pode abrir o gerenciamento de preferências e ativar apenas as categorias opcionais que fizerem sentido
            para você.
          </LegalBody>
          <LegalBody>
            Depois da primeira escolha, você pode reabrir essas preferências pelo rodapé do site e atualizar sua decisão a
            qualquer momento. Quando você estiver autenticado, a Nexor também poderá registrar a preferência escolhida na sua
            conta para manter histórico de consentimento e revogação.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>5. Como gerenciar no navegador</LegalSectionTitle>
          <LegalBody>
            Além do banner do site, você também pode bloquear, revisar ou apagar cookies diretamente no seu navegador. Cada
            navegador organiza esse caminho de um jeito:
          </LegalBody>
          <LegalList>
            <li>Chrome: Configurações, Privacidade e segurança, Cookies</li>
            <li>Firefox: Preferências, Privacidade e Segurança</li>
            <li>Safari: Preferências, Privacidade</li>
            <li>Edge: Configurações, Privacidade, pesquisa e serviços</li>
          </LegalList>
          <LegalBody>
            Desativar cookies opcionais não impede o acesso ao conteúdo institucional. O impacto principal é perder conveniências
            de preferência e deixar de contribuir com medições agregadas de uso quando essa categoria estiver disponível.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>6. Relação com a LGPD</LegalSectionTitle>
          <LegalBody>
            Cookies e storage local podem envolver dados pessoais quando identificam ou tornam identificável uma pessoa. Por isso,
            tratamos preferências, consentimentos e identificadores técnicos conforme a Política de Privacidade, com transparência,
            segurança, proporcionalidade e possibilidade de revogação para categorias opcionais.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>7. Contato</LegalSectionTitle>
          <LegalBody>
            Se tiver dúvidas sobre cookies, localStorage, sessionStorage ou preferências de privacidade, use o formulário da
            página inicial com o assunto Assuntos sobre LGPD ou envie mensagem para contato@nexoradvance.com.br com o assunto LGPD.
          </LegalBody>
        </LegalSection>
      </LegalContainer>
    </LegalPage>
  );
}
