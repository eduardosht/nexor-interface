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
            Estes Termos regulam o acesso ao site institucional, à conta Nexor, ao painel e aos produtos do ecossistema Nexor,
            incluindo fluxos do Biteplaner. O uso da plataforma implica aceitação destes Termos, da Política de Privacidade,
            da Política de Cookies e de condições específicas apresentadas em cada fluxo.
          </LegalBody>
          <LegalBody>
            Funcionalidades, planos, pagamentos, perfis profissionais, convites, relatórios e jornadas podem evoluir ao longo
            do tempo. Quando uma funcionalidade tiver regra própria, a regra específica prevalece para aquele uso.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>2. Uso permitido</LegalSectionTitle>
          <LegalBody>O site e a conta Nexor destinam-se a:</LegalBody>
          <LegalList>
            <li>Navegação e consulta de informações institucionais sobre a Nexor e seus produtos.</li>
            <li>Cadastro, autenticação, gerenciamento da conta, preferências, notificações e acesso aos produtos contratados ou autorizados.</li>
            <li>Operação de fluxos Biteplaner por clientes, dentistas, parceiros, laboratórios e administradores.</li>
            <li>Contato comercial, suporte, solicitações de privacidade, relatórios, pagamentos e comunicações operacionais.</li>
          </LegalList>
          <LegalBody>
            É vedado utilizar a plataforma para fins ilícitos, difamatórios, fraudulentos, abusivos, de engenharia reversa,
            violação de direitos de terceiros, scraping indevido ou tentativa de acesso não autorizado a contas, dados,
            relatórios, ordens, mapas, formulários ou sistemas.
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
            Dentistas, laboratórios e parceiros devem observar normas técnicas, éticas, comerciais e regulatórias aplicáveis
            à sua atividade. A Nexor pode registrar logs e auditoria para segurança, rastreabilidade, prevenção a fraude,
            suporte e cumprimento de obrigações legais.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>4. Conta, notificações e comunicações</LegalSectionTitle>
          <LegalBody>
            Ao criar uma conta Nexor, o usuário concorda em receber comunicações essenciais de operação, segurança, suporte,
            pedidos, pagamentos, produção, notificações do painel e avisos administrativos necessários à prestação do serviço.
          </LegalBody>
          <LegalBody>
            A leitura de notificações pode ser registrada para organização da conta, suporte e auditoria. Newsletters,
            marketing e informativos não essenciais dependem de consentimento específico ou outra base legal aplicável e podem
            ser desativados nos canais indicados.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>5. Pagamentos, planos e cancelamento</LegalSectionTitle>
          <LegalBody>
            Pagamentos, cobranças, assinaturas, reembolsos e registros transacionais podem ser processados pela Stripe ou por
            outro provedor contratado. Condições comerciais, preços, prazos, elegibilidade, cancelamento e reembolso devem ser
            apresentados no fluxo de contratação, pedido, proposta ou documento comercial correspondente.
          </LegalBody>
          <LegalBody>
            O cancelamento pode encerrar acesso a recursos pagos ou operacionais, sem prejuízo da retenção de registros mínimos
            necessários para cumprimento legal, auditoria, prevenção a fraude, suporte, cobrança, registros clínicos ou defesa
            de direitos.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>6. Privacidade, exportação e exclusão de conta</LegalSectionTitle>
          <LegalBody>
            O usuário pode acessar a página Minha Conta para revisar dados, preferências, consentimentos, exportação e pedidos
            de exclusão. A exclusão pode resultar em remoção, bloqueio, anonimização ou retenção mínima, conforme existência de
            ordens, pagamentos, obrigações legais, auditoria, segurança ou defesa de direitos.
          </LegalBody>
          <LegalBody>
            Quando houver ordens ou obrigações pendentes, a Nexor poderá bloquear a conta ou submeter a solicitação à análise
            administrativa antes de concluir a remoção. Quando não houver pendência que justifique retenção identificável, a
            plataforma deve remover acesso e reduzir dados pessoais ao mínimo necessário.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>7. Propriedade intelectual</LegalSectionTitle>
          <LegalBody>
            Conteúdos, marcas, imagens, textos, ícones, design, fluxos, documentação, código-fonte, relatórios e materiais da
            Nexor são protegidos por direitos de propriedade intelectual. É proibida a reprodução, distribuição, modificação,
            exploração comercial ou engenharia reversa sem autorização prévia e expressa por escrito.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>8. Suspensão, bloqueio e encerramento</LegalSectionTitle>
          <LegalBody>
            A Nexor poderá suspender ou bloquear contas, acessos, pedidos, convites, relatórios ou funcionalidades quando houver
            indício de fraude, abuso, violação destes Termos, risco de segurança, ordem legal, inadimplência, violação de
            privacidade ou uso incompatível com as permissões do usuário.
          </LegalBody>
          <LegalBody>
            Sempre que cabível, o usuário poderá solicitar suporte, correção de dados, revisão de bloqueio ou exercício de
            direitos de titular pelos canais oficiais.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>9. Limitações de responsabilidade</LegalSectionTitle>
          <LegalBody>
            A Nexor emprega esforços técnicos e organizacionais para manter a plataforma segura e disponível, mas não garante
            disponibilidade ininterrupta, ausência absoluta de falhas externas ou resultados específicos decorrentes do uso da
            plataforma, especialmente quando dependentes de terceiros, conectividade, provedores, informações fornecidas pelo
            usuário ou decisões profissionais independentes.
          </LegalBody>
        </LegalSection>

        <LegalSection>
          <LegalSectionTitle>10. Lei aplicável e foro</LegalSectionTitle>
          <LegalBody>
            Estes Termos são regidos pela legislação brasileira. Eventuais disputas serão submetidas ao foro legalmente
            competente, observadas as normas de proteção ao consumidor, proteção de dados, contratos, defesa de direitos e
            demais regras obrigatórias aplicáveis.
          </LegalBody>
        </LegalSection>
      </LegalContainer>
    </LegalPage>
  );
}
