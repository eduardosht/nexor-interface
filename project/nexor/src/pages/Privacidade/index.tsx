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

export function Privacidade() {
  return (
    <LegalPage>
      <LegalContainer>
        <LegalTitle>Política de Privacidade</LegalTitle>
        <LegalUpdatedAt>Última atualização: junho de 2026</LegalUpdatedAt>

        <LegalSection>
          <LegalSectionTitle>1. Quem somos</LegalSectionTitle>
          <LegalBody>
            A Nexor é uma empresa-plataforma de produtos de performance. Esta Política de Privacidade descreve como
            coletamos, usamos e protegemos os dados pessoais tratados no site institucional, na conta Nexor e nos produtos
            do ecossistema, incluindo o Biteplaner.
          </LegalBody>
          <LegalBody>
            A Nexor é responsável pelo tratamento dos dados pessoais tratados diretamente em sua plataforma. Alguns
            produtos podem ter fluxos complementares, sempre vinculados às finalidades informadas ao titular.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>2. Dados que coletamos</LegalSectionTitle>
          <LegalBody>Coletamos dados necessários para operar a conta, prestar serviços e manter segurança e auditoria.</LegalBody>
          <LegalBody>
            Podemos tratar nome, e-mail, telefone, senha protegida, cpf, cnpj, razão social, perfil de uso, papéis do
            usuário, consentimentos, preferências, IP, user-agent, registros de auditoria, dados de pagamento processados
            pela Stripe e dados clínicos e de saúde informados em formulários do Biteplaner.
          </LegalBody>
          <LegalList>
            <li>Dados de conta e autenticação: cadastro, login, recuperação de senha, verificação de e-mail e segurança.</li>
            <li>Dados profissionais e operacionais: perfis de cliente, dentista, parceiro, laboratório e administrador.</li>
            <li>Dados de pagamento: identificadores e status de transações, sem armazenamento local de dados completos de cartão.</li>
            <li>Dados clínicos do Biteplaner: informações fornecidas em formulários de triagem, acompanhamento e cuidado odontológico ou orofacial.</li>
            <li>Dados de navegação e consentimento: preferências de cookies, localStorage, cookie de convite de parceiro e histórico de aceite.</li>
          </LegalList>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>3. Finalidades do uso</LegalSectionTitle>
          <LegalList>
            <li>Permitir criação, autenticação, recuperação e segurança da conta Nexor.</li>
            <li>Viabilizar acesso a produtos, fluxos administrativos, pedidos, relatórios e jornadas Biteplaner.</li>
            <li>Registrar consentimentos, preferências, auditoria, prevenção a fraude e rastreabilidade operacional.</li>
            <li>Processar pagamentos, cobranças, reembolsos e registros financeiros por provedores contratados.</li>
            <li>Enviar comunicações essenciais de conta, segurança, atendimento, operação e suporte.</li>
            <li>Enviar newsletters e comunicações promocionais apenas quando houver consentimento opcional.</li>
            <li>Cumprir obrigações legais, regulatórias, fiscais, contratuais e solicitações de autoridades competentes.</li>
          </LegalList>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>4. Base legal (LGPD)</LegalSectionTitle>
          <LegalList>
            <li>Execução de contrato e procedimentos preliminares: conta, produtos, pedidos, suporte, pagamentos e acesso.</li>
            <li>Consentimento: cookies opcionais, marketing e comunicações não essenciais.</li>
            <li>Legítimo interesse: segurança, prevenção a fraude, melhoria da plataforma e auditoria proporcional.</li>
            <li>Proteção da saúde e execução contratual: dados clínicos e de saúde usados em fluxos do Biteplaner.</li>
            <li>Cumprimento de obrigação legal ou regulatória: registros fiscais, financeiros, contábeis e resposta a autoridades.</li>
          </LegalList>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>5. Compartilhamento de dados</LegalSectionTitle>
          <LegalBody>
            Não vendemos nem alugamos dados pessoais. Compartilhamos dados apenas quando necessário para operar a plataforma,
            cumprir obrigações legais ou atender solicitação do titular.
          </LegalBody>
          <LegalList>
            <li>Supabase: autenticação, banco de dados, storage e funções de backend.</li>
            <li>Stripe: pagamentos, assinaturas, cobranças e registros transacionais.</li>
            <li>Resend e provedores de e-mail: mensagens transacionais, suporte e comunicações autorizadas.</li>
            <li>Perfis autorizados do Biteplaner: clientes, dentistas, parceiros, laboratórios e administradores, conforme papel e finalidade.</li>
            <li>Autoridades ou terceiros quando houver obrigação legal, ordem judicial ou necessidade de defesa de direitos.</li>
          </LegalList>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>6. Retenção de dados</LegalSectionTitle>
          <LegalBody>
            A retenção segue necessidade, finalidade, obrigações legais e políticas internas de segurança. Ao final do prazo
            aplicável, os dados devem ser revisados para exclusão, anonimização ou manutenção por obrigação legal.
          </LegalBody>
          <LegalList>
            <li>Dados de conta: enquanto a conta estiver ativa e pelo prazo necessário para obrigações legais, segurança e auditoria.</li>
            <li>Consentimentos: pelo período necessário para demonstrar histórico de aceite, revogação e cumprimento regulatório.</li>
            <li>Preferências de marketing: até revogação do consentimento ou encerramento da finalidade correspondente.</li>
            <li>Formulários clínicos do Biteplaner: 120 meses, sujeitos a revisão de anonimização, bloqueio legal ou exclusão.</li>
            <li>Feedback operacional do Biteplaner: 60 meses, sujeitos a revisão de exclusão, agregação ou anonimização.</li>
          </LegalList>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>7. Direitos do titular</LegalSectionTitle>
          <LegalBody>
            Você pode confirmar a existência de tratamento, acessar dados pessoais, exportar uma cópia dos dados, corrigir
            dados incompletos, inexatos ou desatualizados, solicitar exclusão ou anonimização quando cabível, pedir revisão
            de decisões aplicáveis e revogar consentimentos.
          </LegalBody>
          <LegalBody>
            Algumas solicitações podem depender de validação de identidade, preservação de registros legais, prevenção a fraude
            ou manutenção de dados mínimos para cumprimento de obrigações legais.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>8. Contato LGPD</LegalSectionTitle>
          <LegalBody>
            Para exercer direitos de titular ou tirar dúvidas de privacidade, envie mensagem para contato@nexoradvance.com.br
            com o assunto LGPD. Informe o e-mail da conta e descreva a solicitação para que possamos localizar e tratar o pedido
            com segurança.
          </LegalBody>
        </LegalSection>
      </LegalContainer>
    </LegalPage>
  );
}
