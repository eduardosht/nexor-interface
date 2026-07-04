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
            A Nexor é uma empresa-plataforma de produtos de performance. Esta Política de Privacidade explica, em linguagem
            direta, como tratamos dados pessoais no site institucional, na conta Nexor, no painel do usuário e nos produtos do
            ecossistema, incluindo o Biteplaner.
          </LegalBody>
          <LegalBody>
            A Nexor atua como controladora dos dados tratados diretamente na plataforma. Em alguns fluxos, dentistas,
            laboratórios, parceiros, provedores de pagamento, e-mail, autenticação e infraestrutura podem participar como
            operadores ou terceiros autorizados, sempre conforme finalidade, contrato e necessidade operacional.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>2. Dados que coletamos</LegalSectionTitle>
          <LegalBody>
            Coletamos apenas dados necessários para criar e proteger a conta, prestar serviços, cumprir obrigações legais,
            registrar consentimentos e manter rastreabilidade operacional.
          </LegalBody>
          <LegalList>
            <li>Dados de conta: nome, e-mail, telefone, data de nascimento, status da conta, preferências, senha protegida e identificadores técnicos.</li>
            <li>Documentos e dados cadastrais: CPF, CNPJ, razão social, tipo de documento, endereço e dados profissionais quando informados.</li>
            <li>Dados de papéis Biteplaner: cliente, dentista, parceiro, laboratório, administrador, aprovações, status e histórico de onboarding.</li>
            <li>Dados clínicos e de saúde: respostas de formulários, triagens, acompanhamento odontológico ou orofacial e registros necessários à jornada Biteplaner.</li>
            <li>Dados de pagamento: identificadores, status de transação, cobrança e reembolso processados por provedor contratado, sem armazenamento local de dados completos de cartão.</li>
            <li>Dados de comunicações: notificações, leitura de notificações, e-mails transacionais, preferências de marketing e solicitações de suporte ou LGPD.</li>
            <li>Dados de navegação e consentimento: IP, user-agent, auditoria, preferências de cookies, localStorage, cookie de convite de parceiro e histórico de aceite.</li>
          </LegalList>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>3. Finalidades do uso</LegalSectionTitle>
          <LegalList>
            <li>Permitir cadastro, autenticação, recuperação de senha, verificação de e-mail e segurança da conta Nexor.</li>
            <li>Viabilizar acesso a produtos, jornadas, pedidos, relatórios, convites, avaliações e fluxos administrativos do Biteplaner.</li>
            <li>Registrar consentimentos, preferências, notificações, leitura de notificações, auditoria e prevenção a fraude.</li>
            <li>Processar pagamentos, cobranças, reembolsos, registros financeiros e suporte relacionado.</li>
            <li>Enviar comunicações essenciais de conta, segurança, atendimento, operação, pedidos, produção, pagamentos e suporte.</li>
            <li>Enviar marketing, newsletters e informativos somente quando houver consentimento opcional ou outra base legal aplicável.</li>
            <li>Formar bases analíticas preferencialmente anonimizadas ou agregadas para melhoria do produto, qualidade e pesquisa.</li>
            <li>Cumprir obrigações legais, regulatórias, fiscais, contratuais e solicitações de autoridades competentes.</li>
          </LegalList>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>4. Base legal (LGPD)</LegalSectionTitle>
          <LegalBody>
            O tratamento pode se apoiar em diferentes bases legais da LGPD, de acordo com o dado, o contexto e a finalidade.
          </LegalBody>
          <LegalList>
            <li>Execução de contrato e procedimentos preliminares: conta, produtos, pedidos, suporte, pagamentos, convites e acesso ao painel.</li>
            <li>Consentimento: cookies opcionais, marketing, comunicações não essenciais e autorizações específicas apresentadas em formulários.</li>
            <li>Legítimo interesse: segurança, prevenção a fraude, auditoria proporcional, melhoria da plataforma e comunicações estritamente relacionadas ao serviço.</li>
            <li>Proteção da saúde e execução contratual: dados clínicos e de saúde usados em fluxos do Biteplaner por profissionais e operadores autorizados.</li>
            <li>Cumprimento de obrigação legal ou regulatória: registros fiscais, financeiros, contábeis, sanitários, auditoria e resposta a autoridades.</li>
            <li>Exercício regular de direitos: preservação de evidências necessárias em processos administrativos, judiciais ou arbitrais.</li>
          </LegalList>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>5. Compartilhamento de dados</LegalSectionTitle>
          <LegalBody>
            Não vendemos nem alugamos dados pessoais. Compartilhamos dados somente quando necessário para operar a plataforma,
            cumprir obrigações, proteger direitos ou atender solicitação do titular.
          </LegalBody>
          <LegalList>
            <li>Supabase: autenticação, banco de dados, armazenamento, funções de backend, segurança e registros técnicos.</li>
            <li>Pagar.me: pagamentos, cobranças, assinaturas, reembolsos, split de pagamentos e registros transacionais.</li>
            <li>Resend e provedores de e-mail: mensagens transacionais, notificações, suporte e comunicações autorizadas.</li>
            <li>Perfis autorizados do Biteplaner: clientes, dentistas, parceiros, laboratórios e administradores, conforme papel, permissão e finalidade.</li>
            <li>Autoridades, consultores, defesa técnica ou terceiros quando houver obrigação legal, ordem válida ou necessidade de defesa de direitos.</li>
          </LegalList>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>6. Retenção, bloqueio, exclusão e anonimização</LegalSectionTitle>
          <LegalBody>
            Mantemos dados pelo tempo necessário à finalidade, ao contrato, à segurança, à auditoria e às obrigações legais.
            Ao final da necessidade, os dados podem ser excluídos, anonimizados ou mantidos de forma bloqueada quando a lei
            exigir preservação.
          </LegalBody>
          <LegalList>
            <li>Dados de conta: enquanto a conta estiver ativa e pelo prazo necessário para obrigações legais, segurança, auditoria e defesa de direitos.</li>
            <li>Conta removida sem pendências operacionais relevantes: a plataforma deve concluir a remoção, revogar acesso e substituir dados identificáveis por marcadores de conta removida quando cabível.</li>
            <li>Conta com ordens, pagamentos, produção ou obrigações pendentes: a remoção pode ser bloqueada ou submetida à análise administrativa até preservar o mínimo necessário.</li>
            <li>Consentimentos: pelo período necessário para demonstrar aceite, revogação e cumprimento regulatório.</li>
            <li>Notificações e auditoria: pelo período necessário para segurança, operação, prova de leitura, suporte e defesa de direitos.</li>
            <li>Formulários clínicos do Biteplaner: 120 meses, sujeitos a revisão de anonimização, bloqueio legal ou exclusão quando aplicável.</li>
            <li>Feedback operacional do Biteplaner: 60 meses, sujeitos a revisão de exclusão, agregação ou anonimização.</li>
          </LegalList>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>7. Seus direitos LGPD</LegalSectionTitle>
          <LegalBody>
            Você pode solicitar confirmação de tratamento, acesso aos dados, correção de dados incompletos, inexatos ou
            desatualizados, anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade,
            portabilidade quando aplicável, informação sobre compartilhamento, revisão de decisões aplicáveis, revogação de
            consentimentos e oposição a tratamentos irregulares.
          </LegalBody>
          <LegalBody>
            Na página Minha Conta, quando disponível, você pode exportar uma cópia dos dados da conta. O arquivo pode ser
            fornecido em JSON estruturado, com chaves técnicas usadas pelo sistema, para preservar integridade, rastreabilidade e
            leitura por ferramentas. A exportação não deve conter senha, tokens secretos, dados completos de cartão ou chaves
            internas de infraestrutura.
          </LegalBody>
          <LegalBody>
            Algumas solicitações podem depender de validação de identidade, preservação de registros legais, prevenção a fraude,
            cumprimento de contrato, obrigações fiscais, registros clínicos, auditoria ou manutenção de dados mínimos para defesa
            de direitos.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>8. Segurança</LegalSectionTitle>
          <LegalBody>
            Aplicamos controles técnicos e organizacionais proporcionais ao risco, incluindo autenticação, autorização por papel,
            registros de auditoria, segregação de permissões, provedores especializados e revisão de acessos. Nenhuma plataforma
            é imune a incidentes, mas trabalhamos para reduzir riscos e responder a eventos de segurança com diligência.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>9. Contato LGPD</LegalSectionTitle>
          <LegalBody>
            Para exercer direitos de titular ou tirar dúvidas de privacidade, use o formulário da página inicial com o assunto
            Assuntos sobre LGPD ou envie mensagem para contato@nexoradvance.com.br com o assunto LGPD. Informe o e-mail da
            conta e descreva a solicitação para que possamos localizar e tratar o pedido com segurança.
          </LegalBody>
        </LegalSection>
      </LegalContainer>
    </LegalPage>
  );
}
