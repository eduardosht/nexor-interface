export type LegalProfileKey =
  | 'general'
  | 'biteplaner-client'
  | 'licensed-dentist'
  | 'licensed-partner'
  | 'licensed-lab';

export type LegalDocumentKind = 'privacy' | 'terms';

export type LegalSectionContent = {
  title: string;
  body?: string[];
  items?: string[];
};

export type LegalDocumentContent = {
  kind: LegalDocumentKind;
  profile: LegalProfileKey;
  version: string;
  title: string;
  subtitle: string;
  updatedAt: string;
  pdfFileName: string;
  sections: LegalSectionContent[];
};

export const legalProfiles: Array<{
  key: LegalProfileKey;
  title: string;
  description: string;
}> = [
  {
    key: 'general',
    title: 'Geral Nexor',
    description: 'Regras gerais aplicáveis à plataforma, conta, privacidade, segurança e canais LGPD.'
  },
  {
    key: 'biteplaner-client',
    title: 'Usuário Biteplaner',
    description: 'Pessoa que compra ou utiliza a jornada Biteplaner como paciente/cliente.'
  },
  {
    key: 'licensed-dentist',
    title: 'Dentista licenciado',
    description: 'Profissional aprovado para atuar em fluxos clínicos, arquivos e ordens.'
  },
  {
    key: 'licensed-partner',
    title: 'Parceiro licenciado',
    description: 'Parceiro comercial autorizado para indicação, link/QR Code e comissão.'
  },
  {
    key: 'licensed-lab',
    title: 'Laboratório licenciado',
    description: 'Laboratório aprovado para produção e recebimento de arquivos de scan.'
  }
];

const companyDescription =
  'A Nexor é o nome empresarial simplificado de ETHOSME SERVICOS EDUCACIONAIS LTDA, inscrita no CNPJ sob nº 35.434.764/0001-70, com sede na Rua Sebastiao Peranovich, 37, Atibaia Jardim, Atibaia - SP, CEP 12942-260.';

const privacySharedRights: LegalSectionContent = {
  title: 'Direitos do titular',
  body: [
    'Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, bloqueio, eliminação, portabilidade quando aplicável, informação sobre compartilhamento, revisão de decisões aplicáveis, revogação de consentimento e oposição a tratamentos irregulares.',
    'Algumas solicitações podem depender de validação de identidade e podem ser limitadas quando houver obrigação legal, registro clínico, fiscal, contratual, auditoria, segurança, prevenção a fraude ou defesa de direitos.'
  ]
};

const privacySharedSecurity: LegalSectionContent = {
  title: 'Segurança, incidentes e responsabilidade',
  body: [
    'A Nexor aplica medidas técnicas e organizacionais proporcionais ao risco, incluindo controle de acesso, autenticação, segregação por perfil, logs, revisão de permissões e uso de fornecedores especializados.',
    'Caso ocorra incidente de segurança confirmado que envolva dados pessoais e possa gerar risco ou dano relevante aos titulares, a Nexor avaliará o evento e comunicará os titulares afetados e a ANPD conforme a LGPD e a regulamentação aplicável.',
    'Exemplos de situações que podem exigir comunicação incluem acesso indevido a dados clínicos ou scans, exposição de documentos de identificação, vazamento de dados de pagamento, sequestro de dados que impeça acesso a informações necessárias à jornada, ou perda de base contendo dados pessoais não protegidos adequadamente.'
  ]
};

const privacySharedRetention: LegalSectionContent = {
  title: 'Retenção e exclusão',
  items: [
    'Dados de conta são mantidos enquanto a conta estiver ativa e pelo prazo necessário para obrigações legais, segurança, auditoria e defesa de direitos.',
    'Pré-consulta, dados clínicos, dados de saúde, arquivos de scan e registros de produção podem ser mantidos por até 120 meses quando necessários à prestação, rastreabilidade, suporte, saúde, auditoria ou defesa de direitos.',
    'Logs de auditoria relacionados a ordens podem ser mantidos por 18 meses após o encerramento da ordem, salvo necessidade maior por obrigação legal, investigação, segurança ou defesa de direitos.',
    'Dados fiscais, financeiros, comprovantes de pagamento e registros transacionais podem ser mantidos por 5 anos, salvo prazo legal superior.',
    'Feedbacks podem ser mantidos enquanto houver finalidade legítima, preferencialmente de forma anonimizada ou agregada quando não forem mais necessários de forma identificável.',
    'Pedidos de remoção de conta podem resultar em bloqueio, anonimização, exclusão ou retenção mínima, conforme fluxos ativos, ordens, pagamentos, obrigações legais e necessidade de defesa de direitos.'
  ]
};

const privacySharedProviders: LegalSectionContent = {
  title: 'Compartilhamento e fornecedores',
  body: [
    'A Nexor não vende dados pessoais. Dados podem ser compartilhados somente quando necessário para operar a plataforma, prestar serviços, cumprir contrato, processar pagamentos, enviar comunicações, manter infraestrutura, proteger direitos ou atender obrigação legal.',
    'Por recomendação de manutenção e transparência proporcional, a política descreve fornecedores por categoria: hospedagem, infraestrutura, banco de dados, autenticação, armazenamento, e-mail transacional, suporte operacional, pagamento, consultoria, auditoria e autoridades competentes. Fornecedores específicos podem mudar ao longo do tempo sem alteração da finalidade.'
  ]
};

const privacySharedInternationalTransfer: LegalSectionContent = {
  title: 'Transferência internacional',
  body: [
    'Atualmente a Nexor não realiza transferência internacional intencional de dados como parte do fluxo operacional principal. Caso a operação passe a envolver fornecedores, infraestrutura ou laboratório localizado fora do Brasil, a política será atualizada e a transferência observará as bases legais e salvaguardas exigidas pela LGPD.'
  ]
};

const privacySharedCookies: LegalSectionContent = {
  title: 'Cookies e navegação',
  body: [
    'A plataforma pode usar cookies e tecnologias semelhantes para funcionamento essencial, autenticação, preferências e, quando houver consentimento, analytics ou finalidades opcionais. As preferências podem ser gerenciadas pelo banner de consentimento e pela Política de Cookies disponível em /cookies.'
  ]
};

const privacySharedConsent: LegalSectionContent = {
  title: 'Versões e aceite',
  body: [
    'A Nexor poderá registrar aceite separado para a política geral, aviso específico por perfil, termos aplicáveis e preferências de cookies, incluindo versão, data, status de aceite e evidências técnicas proporcionais. Exemplos de versões: privacy-general-v1.0.0, privacy-dentist-v1.0.0 e terms-dentist-v1.0.0.'
  ]
};

const termsSharedSections: LegalSectionContent[] = [
  {
    title: 'Conta, acesso e segurança',
    body: [
      'Cada usuário é responsável pela veracidade das informações fornecidas, pela confidencialidade de suas credenciais e pelo uso adequado dos dados acessados conforme seu perfil.'
    ]
  },
  {
    title: 'Privacidade e documentos complementares',
    body: [
      'Estes termos devem ser lidos em conjunto com a Política de Privacidade Geral, o aviso de privacidade do perfil correspondente, a Política de Cookies e as condições específicas apresentadas nos fluxos do produto.'
    ]
  },
  {
    title: 'Lei aplicável',
    body: [
      'Estes termos são regidos pela legislação brasileira, observadas as normas de proteção de dados, consumidor, contratos, saúde, obrigações fiscais e demais regras obrigatórias aplicáveis.'
    ]
  }
];

export const legalDocuments: Record<LegalDocumentKind, Record<LegalProfileKey, LegalDocumentContent>> = {
  privacy: {
    general: {
      kind: 'privacy',
      profile: 'general',
      version: 'privacy-general-v1.0.0',
      title: 'Política de Privacidade Geral da Nexor',
      subtitle: 'Regras gerais de privacidade, segurança, direitos LGPD e governança de dados da plataforma.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'politica-privacidade-geral-nexor.pdf',
      sections: [
        {
          title: 'Quem somos e papel na LGPD',
          body: [
            companyDescription,
            'A Nexor atua como controladora dos dados pessoais tratados diretamente na plataforma, na conta Nexor, nos fluxos do Biteplaner e em suas operações administrativas. Em determinados fluxos, fornecedores contratados podem atuar como operadores ou terceiros autorizados, sempre conforme finalidade, contrato e necessidade operacional.'
          ]
        },
        {
          title: 'Canal de privacidade',
          body: [
            'A Nexor ainda não possui Encarregado de Dados pessoa física nomeado publicamente. Até essa definição, disponibiliza o Canal de Privacidade Nexor pelo e-mail contato@nexoradvance.com.br, com o assunto LGPD, para exercício de direitos, dúvidas e solicitações relacionadas a dados pessoais.'
          ]
        },
        {
          title: 'Bases legais e finalidades gerais',
          items: [
            'Execução de contrato e procedimentos preliminares para criar conta, liberar acesso, operar produtos, processar pedidos e prestar suporte.',
            'Cumprimento de obrigação legal ou regulatória para registros fiscais, financeiros, contábeis, sanitários, segurança e resposta a autoridades.',
            'Legítimo interesse para segurança, prevenção a fraude, auditoria proporcional, melhoria da plataforma e comunicações estritamente relacionadas ao serviço.',
            'Consentimento para cookies opcionais, comunicações não essenciais e autorizações específicas apresentadas em formulários.',
            'Proteção da saúde e demais bases legais aplicáveis quando houver dados clínicos, odontológicos, orofaciais ou de saúde no Biteplaner.'
          ]
        },
        privacySharedRights,
        privacySharedProviders,
        privacySharedRetention,
        privacySharedInternationalTransfer,
        privacySharedCookies,
        privacySharedSecurity,
        privacySharedConsent
      ]
    },
    'biteplaner-client': {
      kind: 'privacy',
      profile: 'biteplaner-client',
      version: 'privacy-biteplaner-client-v1.0.0',
      title: 'Aviso de Privacidade do Usuário Biteplaner',
      subtitle: 'Tratamento de dados de quem utiliza a jornada Biteplaner como paciente/cliente.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'politica-privacidade-usuario-biteplaner.pdf',
      sections: [
        {
          title: 'Dados tratados',
          items: [
            'Dados de conta e identificação: nome, e-mail, telefone, CPF, data de nascimento quando aplicável, autenticação, status da conta, preferências e consentimentos.',
            'Dados da jornada: pré-consulta, respostas de formulários, informações clínicas e odontológicas, necessidades de clínica adaptada, escolha de clínica, agendamento, status da ordem, suporte e comunicações.',
            'Dados de localização: CEP informado, localização aproximada da busca por clínicas e, se autorizado no navegador, geolocalização usada para encontrar clínicas próximas.',
            'Dados de compra e pagamento: pedido, valor, status, meio de pagamento, cobrança, reembolso, conciliação, comprovantes e identificadores do provedor de pagamento contratado.'
          ]
        },
        {
          title: 'Menores de idade',
          body: [
            'O Biteplaner pode envolver dados de saúde e decisões relacionadas à jornada odontológica. Usuários menores de 18 anos somente devem usar o serviço com participação, ciência e autorização de responsável legal, que deverá fornecer ou validar as informações necessárias.'
          ]
        },
        {
          title: 'Finalidades',
          items: [
            'Realizar pré-consulta para agilizar atendimento e avaliar informações necessárias antes da compra.',
            'Permitir escolha de clínica licenciada, agendamento, acompanhamento da jornada, compra, pagamento e suporte.',
            'Compartilhar dados mínimos necessários com dentistas, laboratórios, parceiros operacionais e fornecedores autorizados para execução da jornada.',
            'Cumprir obrigações legais, fiscais, regulatórias, auditoria, segurança, prevenção a fraude e defesa de direitos.'
          ]
        },
        {
          title: 'Compartilhamento específico',
          body: [
            'Dados do usuário podem ser acessados por profissionais e operadores autorizados, como dentistas responsáveis, laboratórios quando necessário para produção, administradores Nexor e fornecedores de infraestrutura, comunicação e pagamento. O usuário não envia arquivos de scan diretamente; quando houver scan da arcada, o envio ocorre pelo dentista no fluxo operacional.'
          ]
        },
        privacySharedRetention,
        privacySharedRights
      ]
    },
    'licensed-dentist': {
      kind: 'privacy',
      profile: 'licensed-dentist',
      version: 'privacy-dentist-v1.0.0',
      title: 'Aviso de Privacidade do Dentista Licenciado',
      subtitle: 'Tratamento de dados do profissional aprovado para atuar no Biteplaner.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'politica-privacidade-dentista-licenciado.pdf',
      sections: [
        {
          title: 'Dados tratados',
          items: [
            'Dados cadastrais e profissionais: nome profissional, e-mail, telefone, CPF, CNPJ, CRO, resumo profissional, documentos profissionais e cadastrais enviados no onboarding, histórico de aprovação e status do licenciamento.',
            'Dados de clínica: nome da clínica, CEP, cidade, estado, endereço, complemento, telefone, dias e horários de atendimento, indicação de clínica adaptada e coordenadas obtidas a partir do CEP quando aplicável.',
            'Dados operacionais: ordens, interações com clientes, pré-consulta, formulários, registros de análise, arquivos de scan da arcada dentária, produção, notificações, logs e auditoria.',
            'Dados financeiros e fiscais: informações necessárias para comissões, repasses, conciliação, contratos e obrigações fiscais. Dados bancários não devem ser armazenados pela Nexor quando houver provedor externo de pagamento ou repasse.'
          ]
        },
        {
          title: 'Finalidades',
          items: [
            'Validar elegibilidade profissional, liberar acesso, exibir clínicas ao usuário e permitir seleção de clínica na jornada.',
            'Executar ordens Biteplaner, enviar scan da arcada dentária ao laboratório, acompanhar produção e registrar responsabilidades técnicas.',
            'Calcular comissões, repasses, registros financeiros e obrigações fiscais, conforme o modelo comercial vigente.',
            'Cumprir contrato, obrigações legais, auditoria, prevenção a fraude, segurança e defesa de direitos.'
          ]
        },
        {
          title: 'Compartilhamento específico',
          body: [
            'Dados do dentista e da clínica podem ser exibidos ao usuário para escolha da consulta inicial. Dados operacionais podem ser compartilhados com laboratório, administradores Nexor, fornecedores autorizados e autoridades quando necessário. O scan da arcada dentária deve ser tratado como dado pessoal sensível/de saúde e acessado apenas por perfis autorizados para atendimento, produção, suporte, auditoria ou obrigação legal.'
          ]
        },
        privacySharedRetention,
        privacySharedRights
      ]
    },
    'licensed-partner': {
      kind: 'privacy',
      profile: 'licensed-partner',
      version: 'privacy-partner-v1.0.0',
      title: 'Aviso de Privacidade do Parceiro Licenciado',
      subtitle: 'Tratamento de dados de parceiros comerciais ou operacionais autorizados.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'politica-privacidade-parceiro-licenciado.pdf',
      sections: [
        {
          title: 'Dados tratados',
          items: [
            'Dados cadastrais: nome da empresa ou parceiro, CNPJ, tipo de parceiro, endereço quando aplicável, locais de atuação, histórico de aprovação e status do licenciamento.',
            'Dados de indicação: nome do indicado informado pelo parceiro, link ou QR Code de indicação, status operacional, métricas e, quando o parceiro informar, e-mail do indicado para facilitar envio do convite.',
            'Dados financeiros e fiscais: informações necessárias para comissão, prestação de contas, contratos, conciliação e obrigações legais. Dados bancários não devem ser armazenados pela Nexor quando houver provedor externo de pagamento ou repasse.'
          ]
        },
        {
          title: 'Finalidades',
          items: [
            'Gerenciar relacionamento comercial, cadastro, aprovação, convites, indicações, métricas e comunicação operacional.',
            'Calcular e registrar comissões, prestação de contas, obrigações fiscais e suporte financeiro.',
            'Cumprir contrato, obrigações legais, auditoria, prevenção a fraude, segurança e defesa de direitos.'
          ]
        },
        {
          title: 'Compartilhamento específico',
          body: [
            'Dados do parceiro podem ser compartilhados com administradores Nexor, fornecedores autorizados, áreas financeiras, consultores e autoridades quando necessário. Dados de indicados devem ser usados somente para a finalidade de indicação e comunicação relacionada ao convite.'
          ]
        },
        privacySharedRetention,
        privacySharedRights
      ]
    },
    'licensed-lab': {
      kind: 'privacy',
      profile: 'licensed-lab',
      version: 'privacy-lab-v1.0.0',
      title: 'Aviso de Privacidade do Laboratório Licenciado',
      subtitle: 'Tratamento de dados do laboratório aprovado para produção Biteplaner.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'politica-privacidade-laboratorio-licenciado.pdf',
      sections: [
        {
          title: 'Dados tratados',
          items: [
            'Dados cadastrais e empresariais: nome do laboratório, CNPJ, CPF do responsável quando necessário, resumo operacional, histórico de aprovação e status do licenciamento.',
            'Dados do local operacional: nome do local, CEP, cidade, estado, endereço, complemento, telefone, dias e horários de operação e coordenadas obtidas a partir do CEP quando aplicável.',
            'Dados de produção: ordens, status, prazos, comunicações, arquivos de scan da arcada dentária enviados pelo dentista, registros de produção, suporte, logs e auditoria.',
            'Dados financeiros e fiscais: informações necessárias para repasses, comissões, conciliação, prestação de contas e obrigações legais. Dados bancários não devem ser armazenados pela Nexor quando houver provedor externo de pagamento ou repasse.'
          ]
        },
        {
          title: 'Finalidades',
          items: [
            'Validar o laboratório, liberar produção, acompanhar ordens, registrar qualidade, prazos, rastreabilidade e comunicação operacional.',
            'Permitir que o laboratório receba o scan da arcada dentária necessário à produção, com acesso restrito à finalidade de produção e suporte.',
            'Calcular repasses, conciliação, registros financeiros e obrigações fiscais, conforme o modelo comercial vigente.',
            'Cumprir contrato, obrigações legais, auditoria, prevenção a fraude, segurança e defesa de direitos.'
          ]
        },
        {
          title: 'Compartilhamento específico',
          body: [
            'Dados do laboratório podem ser compartilhados com dentistas, administradores Nexor, fornecedores autorizados, consultores e autoridades quando necessário. O laboratório deve tratar o scan recebido como dado pessoal sensível/de saúde, mantendo confidencialidade e uso restrito à produção autorizada.'
          ]
        },
        privacySharedRetention,
        privacySharedRights
      ]
    }
  },
  terms: {
    general: {
      kind: 'terms',
      profile: 'general',
      version: 'terms-general-v1.0.0',
      title: 'Termos Gerais de Uso da Nexor',
      subtitle: 'Condições gerais aplicáveis à conta, ao site, ao painel e aos produtos Nexor.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'termos-gerais-uso-nexor.pdf',
      sections: [
        {
          title: 'Objeto',
          body: [
            'Estes termos regulam o acesso ao site institucional, à conta Nexor, ao painel e aos produtos do ecossistema Nexor, incluindo fluxos do Biteplaner.'
          ]
        },
        {
          title: 'Empresa responsável',
          body: [companyDescription]
        },
        ...termsSharedSections
      ]
    },
    'biteplaner-client': {
      kind: 'terms',
      profile: 'biteplaner-client',
      version: 'terms-biteplaner-client-v1.0.0',
      title: 'Termos de Uso do Usuário Biteplaner',
      subtitle: 'Condições aplicáveis a quem adquire ou utiliza a jornada Biteplaner.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'termos-uso-usuario-biteplaner.pdf',
      sections: [
        {
          title: 'Objeto',
          body: [
            'Estes termos regulam cadastro, pré-consulta, escolha de clínica, consulta inicial, compra, pagamento, acompanhamento da jornada Biteplaner, comunicações, suporte e uso do painel pelo usuário cliente.'
          ]
        },
        {
          title: 'Menores de idade',
          body: [
            'Menores de 18 anos somente devem usar o Biteplaner com participação, ciência e autorização de responsável legal.'
          ]
        },
        {
          title: 'Compra, jornada e cancelamento',
          items: [
            'Preços, prazos, elegibilidade, pagamento, reembolso e cancelamento seguem as condições apresentadas no fluxo de contratação.',
            'A compra ocorre após a consulta inicial e depende das informações necessárias à jornada.',
            'Ordens, pagamentos e registros mínimos podem ser retidos quando necessários para obrigações legais, auditoria, suporte e defesa de direitos.'
          ]
        },
        ...termsSharedSections
      ]
    },
    'licensed-dentist': {
      kind: 'terms',
      profile: 'licensed-dentist',
      version: 'terms-dentist-v1.0.0',
      title: 'Termos de Uso do Dentista Licenciado',
      subtitle: 'Condições aplicáveis ao profissional aprovado para operar no Biteplaner.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'termos-uso-dentista-licenciado.pdf',
      sections: [
        {
          title: 'Objeto e elegibilidade',
          body: [
            'O acesso como dentista depende de aprovação operacional, documentação válida, dados profissionais corretos e conclusão de cadastros financeiros quando o perfil tiver direito a repasses ou comissões.'
          ]
        },
        {
          title: 'Responsabilidades profissionais',
          items: [
            'Atuar conforme normas técnicas, éticas, regulatórias e profissionais aplicáveis.',
            'Usar dados de clientes, formulários, ordens e scans somente para finalidades autorizadas no Biteplaner.',
            'Manter informações profissionais, documentos, clínicas e dados necessários a repasses atualizados.'
          ]
        },
        {
          title: 'Pagamentos e comissões',
          body: [
            'Repasses e comissões podem depender de provedor de pagamento contratado. A Nexor não deve armazenar dados bancários quando o fluxo financeiro for realizado por provedor externo.'
          ]
        },
        ...termsSharedSections
      ]
    },
    'licensed-partner': {
      kind: 'terms',
      profile: 'licensed-partner',
      version: 'terms-partner-v1.0.0',
      title: 'Termos de Uso do Parceiro Licenciado',
      subtitle: 'Condições aplicáveis a parceiros comerciais ou operacionais autorizados.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'termos-uso-parceiro-licenciado.pdf',
      sections: [
        {
          title: 'Objeto',
          body: [
            'Estes termos regulam o acesso do parceiro a convites, indicações, link ou QR Code, fluxos comerciais, comissões, comunicações e recursos operacionais autorizados pela Nexor.'
          ]
        },
        {
          title: 'Conduta e responsabilidades',
          items: [
            'Apresentar informações verdadeiras e não prometer condições não autorizadas pela Nexor.',
            'Usar materiais, marcas, links e dados de indicados apenas conforme autorização.',
            'Respeitar confidencialidade, privacidade, regras comerciais e legislação aplicável.'
          ]
        },
        {
          title: 'Comissões',
          body: [
            'O parceiro poderá receber comissão conforme regras comerciais vigentes, registros de indicação, elegibilidade, conciliação e obrigações fiscais.'
          ]
        },
        ...termsSharedSections
      ]
    },
    'licensed-lab': {
      kind: 'terms',
      profile: 'licensed-lab',
      version: 'terms-lab-v1.0.0',
      title: 'Termos de Uso do Laboratório Licenciado',
      subtitle: 'Condições aplicáveis ao laboratório aprovado para produção Biteplaner.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'termos-uso-laboratorio-licenciado.pdf',
      sections: [
        {
          title: 'Objeto e aprovação',
          body: [
            'O acesso como laboratório depende de aprovação operacional, dados empresariais corretos, capacidade produtiva e conclusão de cadastros financeiros quando houver repasses.'
          ]
        },
        {
          title: 'Produção, qualidade e confidencialidade',
          items: [
            'Executar ordens conforme especificações, prazos, padrões de qualidade e orientações operacionais.',
            'Tratar arquivos de scan, dados de clientes, dentistas e ordens com confidencialidade e finalidade restrita.',
            'Comunicar inconsistências, atrasos, falhas ou necessidades de correção pelos canais oficiais.'
          ]
        },
        {
          title: 'Pagamentos e repasses',
          body: [
            'Repasses podem depender de provedor de pagamento contratado. A Nexor não deve armazenar dados bancários quando o fluxo financeiro for realizado por provedor externo.'
          ]
        },
        ...termsSharedSections
      ]
    }
  }
};
