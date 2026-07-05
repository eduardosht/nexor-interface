export type LegalProfileKey = 'biteplaner-client' | 'licensed-dentist' | 'licensed-partner' | 'licensed-lab';

export type LegalDocumentKind = 'privacy' | 'terms';

export type LegalSectionContent = {
  title: string;
  body?: string[];
  items?: string[];
};

export type LegalDocumentContent = {
  kind: LegalDocumentKind;
  profile: LegalProfileKey;
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
    key: 'biteplaner-client',
    title: 'Usuário Biteplaner',
    description: 'Pessoa que adquire ou utiliza a jornada Biteplaner como cliente.'
  },
  {
    key: 'licensed-dentist',
    title: 'Dentista licenciado',
    description: 'Profissional aprovado para atuar em fluxos clínicos e operacionais.'
  },
  {
    key: 'licensed-partner',
    title: 'Parceiro licenciado',
    description: 'Parceiro comercial ou operacional autorizado pela Nexor.'
  },
  {
    key: 'licensed-lab',
    title: 'Laboratório licenciado',
    description: 'Laboratório aprovado para produção, logística e acompanhamento de ordens.'
  }
];

const sharedPrivacySections: LegalSectionContent[] = [
  {
    title: 'Controlador, encarregado e canal LGPD',
    body: [
      'A Nexor atua como controladora dos dados tratados diretamente na plataforma. Em alguns fluxos, provedores de infraestrutura, autenticação, e-mail, pagamento e operação podem atuar como operadores ou terceiros autorizados.',
      'Para exercer direitos de titular, envie solicitação para contato@nexoradvance.com.br com o assunto LGPD ou use os canais oficiais da plataforma.'
    ]
  },
  {
    title: 'Direitos do titular',
    body: [
      'Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, bloqueio, eliminação, portabilidade quando aplicável, informação sobre compartilhamento, revogação de consentimento e oposição a tratamentos irregulares.'
    ]
  },
  {
    title: 'Segurança e retenção',
    body: [
      'Aplicamos controles técnicos e organizacionais proporcionais ao risco, incluindo autenticação, autorização por papel, logs de auditoria, segregação de permissões e revisão de acessos.',
      'Os dados são mantidos pelo tempo necessário para cumprir contrato, operação, obrigações legais, auditoria, prevenção a fraude, segurança e defesa de direitos.'
    ]
  }
];

const sharedTermsSections: LegalSectionContent[] = [
  {
    title: 'Conta, acesso e segurança',
    body: [
      'Cada usuário é responsável pela veracidade das informações fornecidas, pela confidencialidade de suas credenciais e pelo uso adequado dos dados acessados conforme seu perfil.'
    ]
  },
  {
    title: 'Privacidade e documentos complementares',
    body: [
      'Estes termos devem ser lidos em conjunto com a política de privacidade do perfil correspondente, política de cookies e condições específicas apresentadas nos fluxos do produto.'
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
    'biteplaner-client': {
      kind: 'privacy',
      profile: 'biteplaner-client',
      title: 'Política de Privacidade do Usuário Biteplaner',
      subtitle: 'Tratamento de dados de quem adquire ou utiliza a jornada Biteplaner.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'politica-privacidade-usuario-biteplaner.pdf',
      sections: [
        {
          title: 'Dados tratados',
          items: [
            'Dados de conta: nome, e-mail, telefone, autenticação, preferências, consentimentos e identificadores técnicos.',
            'Dados de compra: pedido, pagamento, reembolso, status da jornada, comunicações e suporte.',
            'Dados clínicos e de saúde: formulários, triagens, arquivos, respostas, imagens e informações necessárias à jornada Biteplaner, quando aplicável.'
          ]
        },
        {
          title: 'Finalidades e bases legais',
          items: [
            'Executar contrato, entregar a jornada Biteplaner, prestar suporte e processar pagamentos.',
            'Tratar dados de saúde com base nas hipóteses legais aplicáveis, incluindo proteção da saúde e execução do serviço com profissionais autorizados.',
            'Cumprir obrigações legais, fiscais, regulatórias, auditoria, prevenção a fraude e defesa de direitos.'
          ]
        },
        {
          title: 'Compartilhamentos',
          body: [
            'Dados podem ser compartilhados com dentistas, laboratórios, parceiros operacionais, Pagar.me, Supabase, provedores de e-mail e autoridades quando necessário para a finalidade informada.'
          ]
        },
        ...sharedPrivacySections
      ]
    },
    'licensed-dentist': {
      kind: 'privacy',
      profile: 'licensed-dentist',
      title: 'Política de Privacidade do Dentista Licenciado',
      subtitle: 'Tratamento de dados do profissional aprovado para atuar no Biteplaner.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'politica-privacidade-dentista-licenciado.pdf',
      sections: [
        {
          title: 'Dados tratados',
          items: [
            'Dados cadastrais e profissionais: nome, e-mail, telefone, CPF/CNPJ, CRO, documentos, endereço e histórico de aprovação.',
            'Dados operacionais: ordens, interações com clientes, formulários, registros de análise, produção, notificações, logs e auditoria.',
            'Dados financeiros necessários ao recebedor Pagar.me: documentos e dados de perfil financeiro. Dados bancários são enviados ao Pagar.me de forma transiente e não são armazenados pela Nexor.'
          ]
        },
        {
          title: 'Finalidades e bases legais',
          items: [
            'Validar elegibilidade profissional, liberar acesso, operar ordens e registrar responsabilidades técnicas.',
            'Criar recebedor no Pagar.me, viabilizar split de pagamentos, conciliação, obrigações fiscais e suporte financeiro.',
            'Cumprir obrigações legais, regulatórias, contratuais, auditoria, prevenção a fraude, segurança e defesa de direitos.'
          ]
        },
        {
          title: 'Compartilhamentos',
          body: [
            'Dados podem ser compartilhados com clientes, laboratórios, Pagar.me, provedores técnicos, administradores Nexor e autoridades, sempre conforme papel, permissão e necessidade operacional.'
          ]
        },
        ...sharedPrivacySections
      ]
    },
    'licensed-partner': {
      kind: 'privacy',
      profile: 'licensed-partner',
      title: 'Política de Privacidade do Parceiro Licenciado',
      subtitle: 'Tratamento de dados de parceiros comerciais ou operacionais autorizados.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'politica-privacidade-parceiro-licenciado.pdf',
      sections: [
        {
          title: 'Dados tratados',
          items: [
            'Dados cadastrais: nome, e-mail, telefone, CPF/CNPJ, empresa, responsáveis, endereço e histórico de aprovação.',
            'Dados comerciais e operacionais: indicações, convites, status, comunicações, métricas, suporte, logs e auditoria.',
            'Dados financeiros ou fiscais quando necessários para comissionamento, prestação de contas, contratos ou obrigações legais.'
          ]
        },
        {
          title: 'Finalidades e bases legais',
          items: [
            'Gerenciar relacionamento comercial, convites, indicações, permissões e comunicação operacional.',
            'Cumprir contrato, obrigações fiscais, auditoria, prevenção a fraude, segurança e defesa de direitos.',
            'Enviar comunicações essenciais e, quando aplicável, comunicações comerciais mediante base legal apropriada.'
          ]
        },
        {
          title: 'Compartilhamentos',
          body: [
            'Dados podem ser compartilhados com administradores Nexor, provedores técnicos, clientes indicados, áreas financeiras, consultores e autoridades quando necessário.'
          ]
        },
        ...sharedPrivacySections
      ]
    },
    'licensed-lab': {
      kind: 'privacy',
      profile: 'licensed-lab',
      title: 'Política de Privacidade do Laboratório Licenciado',
      subtitle: 'Tratamento de dados do laboratório aprovado para produção e ordens Biteplaner.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'politica-privacidade-laboratorio-licenciado.pdf',
      sections: [
        {
          title: 'Dados tratados',
          items: [
            'Dados empresariais e de responsáveis: razão social, CNPJ, representantes, e-mail, telefone, endereço, documentos e histórico de aprovação.',
            'Dados operacionais: ordens, arquivos de produção, prazos, status, comunicações, notificações, logs e auditoria.',
            'Dados financeiros necessários ao recebedor Pagar.me. Dados bancários são enviados ao Pagar.me de forma transiente e não são armazenados pela Nexor.'
          ]
        },
        {
          title: 'Finalidades e bases legais',
          items: [
            'Validar o laboratório, liberar produção, acompanhar ordens, registrar qualidade, prazos e rastreabilidade.',
            'Criar recebedor no Pagar.me, viabilizar split de pagamentos, conciliação, obrigações fiscais e suporte financeiro.',
            'Cumprir contrato, obrigações legais, auditoria, prevenção a fraude, segurança e defesa de direitos.'
          ]
        },
        {
          title: 'Compartilhamentos',
          body: [
            'Dados podem ser compartilhados com dentistas, clientes quando necessário, Pagar.me, provedores técnicos, administradores Nexor, consultores e autoridades competentes.'
          ]
        },
        ...sharedPrivacySections
      ]
    }
  },
  terms: {
    'biteplaner-client': {
      kind: 'terms',
      profile: 'biteplaner-client',
      title: 'Termos de Uso do Usuário Biteplaner',
      subtitle: 'Condições aplicáveis a quem adquire ou utiliza a jornada Biteplaner.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'termos-uso-usuario-biteplaner.pdf',
      sections: [
        {
          title: 'Objeto',
          body: [
            'Estes termos regulam cadastro, compra, pagamento, acesso à jornada Biteplaner, comunicações, suporte e uso do painel pelo usuário cliente.'
          ]
        },
        {
          title: 'Compra, jornada e cancelamento',
          items: [
            'Preços, prazos, elegibilidade, pagamento, reembolso e cancelamento seguem as condições apresentadas no fluxo de contratação.',
            'O acompanhamento da jornada depende de dados corretos, respostas completas, envio de documentos quando aplicável e interação com profissionais autorizados.',
            'Ordens, pagamentos e registros mínimos podem ser retidos quando necessários para obrigações legais, auditoria, suporte e defesa de direitos.'
          ]
        },
        ...sharedTermsSections
      ]
    },
    'licensed-dentist': {
      kind: 'terms',
      profile: 'licensed-dentist',
      title: 'Termos de Uso do Dentista Licenciado',
      subtitle: 'Condições aplicáveis ao profissional aprovado para operar no Biteplaner.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'termos-uso-dentista-licenciado.pdf',
      sections: [
        {
          title: 'Objeto e elegibilidade',
          body: [
            'O acesso como dentista depende de aprovação operacional, documentação válida e conclusão do cadastro financeiro quando o perfil tiver direito a repasses.'
          ]
        },
        {
          title: 'Responsabilidades profissionais',
          items: [
            'Atuar conforme normas técnicas, éticas, regulatórias e profissionais aplicáveis.',
            'Usar dados de clientes e ordens somente para as finalidades autorizadas no Biteplaner.',
            'Manter informações profissionais, documentos e dados de recebedor atualizados.'
          ]
        },
        {
          title: 'Pagamentos e split',
          body: [
            'Repasses dependem da criação e manutenção do recebedor no Pagar.me. A Nexor não armazena dados bancários; o envio desses dados ocorre de forma transiente para o provedor.'
          ]
        },
        ...sharedTermsSections
      ]
    },
    'licensed-partner': {
      kind: 'terms',
      profile: 'licensed-partner',
      title: 'Termos de Uso do Parceiro Licenciado',
      subtitle: 'Condições aplicáveis a parceiros comerciais ou operacionais autorizados.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'termos-uso-parceiro-licenciado.pdf',
      sections: [
        {
          title: 'Objeto',
          body: [
            'Estes termos regulam o acesso do parceiro a convites, indicações, fluxos comerciais, comunicações e recursos operacionais autorizados pela Nexor.'
          ]
        },
        {
          title: 'Conduta e responsabilidades',
          items: [
            'Apresentar informações verdadeiras e não prometer condições não autorizadas pela Nexor.',
            'Usar materiais, marcas, links e dados de contatos apenas conforme autorização.',
            'Respeitar confidencialidade, privacidade, regras comerciais e legislação aplicável.'
          ]
        },
        ...sharedTermsSections
      ]
    },
    'licensed-lab': {
      kind: 'terms',
      profile: 'licensed-lab',
      title: 'Termos de Uso do Laboratório Licenciado',
      subtitle: 'Condições aplicáveis ao laboratório aprovado para produção Biteplaner.',
      updatedAt: 'Última atualização: julho de 2026',
      pdfFileName: 'termos-uso-laboratorio-licenciado.pdf',
      sections: [
        {
          title: 'Objeto e aprovação',
          body: [
            'O acesso como laboratório depende de aprovação operacional, documentação válida, capacidade produtiva e conclusão do cadastro financeiro quando houver repasses.'
          ]
        },
        {
          title: 'Produção, qualidade e confidencialidade',
          items: [
            'Executar ordens conforme especificações, prazos, padrões de qualidade e orientações operacionais.',
            'Tratar arquivos, dados de clientes, dentistas e ordens com confidencialidade e finalidade restrita.',
            'Comunicar inconsistências, atrasos, falhas ou necessidades de correção pelos canais oficiais.'
          ]
        },
        {
          title: 'Pagamentos e split',
          body: [
            'Repasses dependem da criação e manutenção do recebedor no Pagar.me. Dados bancários são enviados ao provedor de forma transiente e não ficam armazenados na Nexor.'
          ]
        },
        ...sharedTermsSections
      ]
    }
  }
};
