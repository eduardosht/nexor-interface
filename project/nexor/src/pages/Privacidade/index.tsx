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
        <LegalUpdatedAt>Última atualização: maio de 2026</LegalUpdatedAt>
        <LegalSection>
          <LegalSectionTitle>1. Quem somos</LegalSectionTitle>
          <LegalBody>
            A Nexor é uma empresa-plataforma de produtos de performance. Está Política de Privacidade descreve como
            coletamos, usamos e protegemos os dados pessoais tratados no site institucional e na conta Nexor.
          </LegalBody>
          <LegalBody>
            Produtos da Nexor, como o Biteplaner, podem manter políticas complementares adaptadas ao seu próprio contexto operacional.
          </LegalBody>
        </LegalSection>
        <LegalSection>
          <LegalSectionTitle>2. Dados que coletamos</LegalSectionTitle>
          <LegalBody>Coletamos apenas os dados necessários para operar o site e a conta Nexor:</LegalBody>
          <LegalList>
            <li><strong>Conta Nexor:</strong> nome, e-mail, senha e dados cadastrais básicos informados pelo usuário.</li>
            <li><strong>Consentimentos:</strong> registros de aceite de Termos de Uso, Política de Privacidade e preferência de comunicações de marketing.</li>
            <li><strong>Dados de navegação:</strong> endereço IP, tipo de navegador e preferências de cookies, além de medições de uso quando cookies opcionais estiverem autorizados.</li>
          </LegalList>
        </LegalSection>
        <LegalSection>
          <LegalSectionTitle>3. Finalidade do uso</LegalSectionTitle>
          <LegalList>
            <li>Permitir criação, autenticação, recuperação e segurança da conta Nexor.</li>
            <li>Enviar comunicações essenciais da conta e dos produtos relacionados, como verificação de e-mail, recuperação de senha, alertas de segurança e avisos operacionais.</li>
            <li>Enviar newsletters e comunicações promocionais, comerciais ou educativas por e-mail somente quando houver consentimento opcional para isso.</li>
            <li>Analisar o uso do site para melhorar a experiência do visitante.</li>
            <li>Cumprir obrigações legais e regulatórias aplicáveis.</li>
          </LegalList>
        </LegalSection>
        <LegalSection>
          <LegalSectionTitle>4. Base legal (LGPD)</LegalSectionTitle>
          <LegalList>
            <li><strong>Execução de contrato e procedimentos preliminares:</strong> para operar a conta, autenticar o usuário e viabilizar acesso aos produtos.</li>
            <li><strong>Legítimo interesse:</strong> para segurança da plataforma, prevenção a fraude e melhoria da experiência.</li>
            <li><strong>Consentimento:</strong> para newsletters e comunicações promocionais, comerciais ou educativas por e-mail, bem como para cookies não essenciais quando aplicável.</li>
          </LegalList>
        </LegalSection>
        <LegalSection>
          <LegalSectionTitle>5. Compartilhamento de dados</LegalSectionTitle>
          <LegalBody>Não vendemos nem alugamos dados pessoais. Podemos compartilhá-los apenas nas seguintes situações:</LegalBody>
          <LegalList>
            <li><strong>Provedores de tecnologia:</strong> serviços de autenticação, hospedagem, analytics e comunicação que apoiam a operação da conta Nexor e do site.</li>
            <li><strong>Produtos do ecossistema Nexor:</strong> quando necessário para viabilizar o acesso do usuário ao produto que ele escolheu utilizar.</li>
            <li><strong>Exigência legal:</strong> quando obrigados por lei, decisão judicial ou autoridade competente.</li>
          </LegalList>
        </LegalSection>
        <LegalSection>
          <LegalSectionTitle>6. Retenção de dados</LegalSectionTitle>
          <LegalList>
            <li>Dados cadastrais da conta: pelo período necessário para manutenção da conta e cumprimento de obrigações legais.</li>
            <li>Consentimentos: pelo período necessário para demonstração de histórico de aceite e cumprimento regulatório.</li>
            <li>Preferências de marketing: até revogação do consentimento ou encerramento da finalidade correspondente.</li>
          </LegalList>
        </LegalSection>
        <LegalSection>
          <LegalSectionTitle>7. Seus direitos</LegalSectionTitle>
          <LegalBody>
            Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a confirmar a existência de tratamento,
            acessar, corrigir, atualizar, solicitar exclusão quando cabível, revogar consentimento e obter outras
            informações previstas em lei.
          </LegalBody>
          <LegalBody>Para exercer seus direitos, entre em contato pelo e-mail abaixo.</LegalBody>
        </LegalSection>
        <LegalSection>
          <LegalSectionTitle>8. Contato</LegalSectionTitle>
          <LegalBody>
            Dúvidas ou solicitações relacionadas a está política devem ser enviadas pelos canais oficiais informados na página de contato.
            Responsável pelo tratamento de dados: Nexor.
          </LegalBody>
        </LegalSection>
      </LegalContainer>
    </LegalPage>
  );
}
