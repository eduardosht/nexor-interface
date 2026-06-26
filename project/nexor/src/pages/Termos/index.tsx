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

export function Termos() {
  return (
    <LegalPage>
      <LegalContainer>
        <LegalTitle>Termos de Uso</LegalTitle>
        <LegalUpdatedAt>Última atualização: junho de 2026</LegalUpdatedAt>

        <LegalSection>
          <LegalSectionTitle>1. Objeto</LegalSectionTitle>
          <LegalBody>
            Estes Termos regulam o acesso ao site institucional, à conta Nexor e aos produtos do ecossistema Nexor, incluindo
            fluxos do Biteplaner. O uso da plataforma implica aceitação integral destes Termos e das políticas aplicáveis.
          </LegalBody>
          <LegalBody>
            As funcionalidades podem evoluir ao longo do tempo. Recursos específicos, planos, pagamentos, perfis profissionais
            e produtos podem ter condições adicionais apresentadas no próprio fluxo de contratação ou uso.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>2. Uso permitido</LegalSectionTitle>
          <LegalBody>O site e a conta Nexor destinam-se a:</LegalBody>
          <LegalList>
            <li>Navegação e consulta de informações institucionais sobre a Nexor e seus produtos.</li>
            <li>Cadastro, autenticação, gerenciamento da conta e acesso aos produtos contratados ou autorizados.</li>
            <li>Operação de fluxos Biteplaner por clientes, dentistas, parceiros, laboratórios e administradores.</li>
            <li>Contato comercial, suporte, solicitações de privacidade, relatórios e comunicações operacionais.</li>
          </LegalList>
          <LegalBody>
            É vedado utilizar a plataforma para fins ilícitos, difamatórios, fraudulentos, abusivos, de engenharia reversa,
            violação de direitos de terceiros ou tentativa de acesso não autorizado a contas, dados, relatórios ou sistemas.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>3. Papéis e responsabilidades</LegalSectionTitle>
          <LegalBody>
            Clientes, dentistas, parceiros, laboratórios e administradores devem usar a plataforma conforme seu papel, suas
            permissões e as finalidades informadas. Cada usuário é responsável pela veracidade das informações fornecidas,
            pela confidencialidade de suas credenciais e pelo uso adequado de dados a que tenha acesso.
          </LegalBody>
          <LegalBody>
            Profissionais e parceiros devem observar normas técnicas, éticas, comerciais e regulatórias aplicáveis à sua
            atividade. A Nexor pode registrar auditoria para rastreabilidade, segurança e cumprimento de obrigações legais.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>4. Pagamentos, planos e cancelamento</LegalSectionTitle>
          <LegalBody>
            Pagamentos, cobranças, assinaturas, reembolsos e registros transacionais podem ser processados pela Stripe ou por
            outro provedor contratado. Condições comerciais, preços, prazos e regras de cancelamento devem ser apresentadas no
            fluxo de contratação, pedido, proposta ou documento comercial correspondente.
          </LegalBody>
          <LegalBody>
            O cancelamento pode encerrar acesso a recursos pagos ou operacionais, sem prejuízo da retenção de registros mínimos
            necessários para cumprimento legal, auditoria, prevenção a fraude, suporte, cobrança ou defesa de direitos.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>5. Comunicações da conta e informativos</LegalSectionTitle>
          <LegalBody>
            Ao criar uma conta Nexor, o usuário concorda em receber comunicações essenciais para operação da conta, segurança,
            suporte, pedidos, pagamentos, produtos e avisos administrativos necessários à prestação do serviço.
          </LegalBody>
          <LegalBody>
            Newsletters e comunicações promocionais, comerciais ou educativas por e-mail dependem de consentimento específico
            e opcional do usuário, que poderá ser revogado a qualquer momento pelos canais informados pela Nexor.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>6. Propriedade intelectual</LegalSectionTitle>
          <LegalBody>
            Conteúdos, marcas, imagens, textos, ícones, design, fluxos, documentação, código-fonte e materiais da Nexor são
            protegidos por direitos de propriedade intelectual. É proibida a reprodução, distribuição, modificação ou exploração
            sem autorização prévia e expressa por escrito.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>7. Suspensão, bloqueio e encerramento</LegalSectionTitle>
          <LegalBody>
            A Nexor poderá suspender ou bloquear contas, acessos, pedidos, convites, relatórios ou funcionalidades quando houver
            indício de fraude, abuso, violação destes Termos, risco de segurança, ordem legal, inadimplência ou uso incompatível
            com as permissões do usuário.
          </LegalBody>
          <LegalBody>
            Sempre que cabível, o usuário poderá solicitar suporte, correção de dados, revisão de bloqueio ou exercício de
            direitos de titular pelos canais oficiais.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>8. Limitações de responsabilidade</LegalSectionTitle>
          <LegalBody>
            A Nexor emprega esforços técnicos e organizacionais para manter a plataforma segura e disponível, mas não garante
            disponibilidade ininterrupta, ausência absoluta de falhas externas ou resultados específicos decorrentes do uso da
            plataforma, especialmente quando dependentes de terceiros, conectividade, provedores, informações fornecidas pelo
            usuário ou decisões profissionais independentes.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>9. Lei aplicável e foro</LegalSectionTitle>
          <LegalBody>
            Estes Termos são regidos pela legislação brasileira. Eventuais disputas serão submetidas ao foro legalmente competente,
            observadas as normas de proteção ao consumidor, proteção de dados, contratos, defesa de direitos e demais regras
            obrigatórias aplicáveis.
          </LegalBody>
        </LegalSection>
      </LegalContainer>
    </LegalPage>
  );
}
