# Biteplaner Business Context

Biteplaner e o primeiro produto da Nexor: protetor bucal personalizado para atletas, com plataforma digital associada, avaliação odontológica, produção laboratorial e acompanhamento.

## Arquivos

- `product-flow.md`: fluxo de negocio completo, atores, jornada, status sugeridos, formulários, notificacoes, rastreabilidade e perguntas em aberto.

## Regras-chave atuais do MVP

- Cadastro, login, sessão, perfil básico e consentimentos gerais pertencem a Nexor.
- Biteplaner recebe contas Nexor inscritas no produto e perfis por produto registrados na Nexor. O produto mantém dados complementares, aprovações e vínculos operacionais específicos.
- A plataforma não faz agendamento odontológico dentro do sistema.
- O cadastro público do usuário final na Nexor e simples, com e-mail e senha.
- No MVP1, o fluxo público de compra/triagem no produto Biteplaner e exclusivo para clientes, categorizados como atletas, e a ativacao desse perfil e imediata.
- Dentistas, parceiros e laboratórios podem solicitar perfil Biteplaner pela conta Nexor, mas seus acessos/cadastros operacionais ficam pendentes até aprovação.
- Essas solicitações profissionais devem usar paginas dedicadas de cadastro complementar no painel Nexor, com validacao de campos obrigatórios e aceite de termos/privacidade, não modal.
- O formulário pre-requisito do Biteplaner também funciona como complemento cadastral do produto.
- E nesse ponto que o produto pode coletar dados adicionais necessários para o registro no Biteplaner, como CPF ou RNE para estrangeiros, alem de outros campos a serem detalhados depois.
- A avaliação inicial pré-consulta do Biteplaner usa um formulário compartilhado entre cliente e dentista: o cliente preenche histórico médico, odontológico/orofacial, sintomas, função mandibular, impacto no treino, hábitos e expectativas; depois o dentista complementa o mesmo registro com medidas, observações clínicas, síntese da avaliação e pontos de atenção.
- Quando o dentista inicia ou salva o complemento clínico, as respostas do cliente ficam bloqueadas para edicao. O usuário ainda deve selecionar uma clínica já licenciada para prosseguir com a ordem atual.
- Depois da triagem inicial, o usuário escolhe o local de atendimento, recebe os dados de contato do consultório para falar diretamente com ele antes da primeira consulta e, ao confirmar "Consulta agendada", envia uma solicitação ao dentista licenciado daquele local.
- Para evitar continuidade sem comunicação real com o consultório, o dentista precisa aceitar a consulta agendada no painel antes de a ordem avançar para a etapa operacional vinculada.
- Ao escolher a consulta clínica, o usuário também pode indicar o processo de licenciamento a um dentista de preferência ainda não licenciado, usando mensagem pronta por WhatsApp ou e-mail com link para `/parceiros#dentistas`.
- Essa indicação pode iniciar o contato com o dentista, mas o usuário não pode selecionar essa clínica no fluxo enquanto o licenciamento não for concluído; para prosseguir com a ordem atual, precisa escolher uma clínica já licenciada.
- O pagamento do Biteplaner so comeca depois que o dentista declara o usuário apto.
- Se o dentista declarar inaptidão inicial, o fluxo é encerrado sem cobrança.
- Se o dentista exigir tratamento prévio, a ordem fica em espera até nova avaliação.
- A consulta inicial passa a ser controlada por solicitação criada pelo cliente ao confirmar a consulta agendada, aceite obrigatório do dentista licenciado e confirmação operacional posterior de realização pelo paciente e pelo dentista, e não por data e horário registrados no Biteplaner.

## Regra de uso

Leia este contexto antes de implementar qualquer feature do Biteplaner. Se o pedido criar novo ator, etapa, regra comercial, dado, notificação, status, integração ou processo operacional não descrito aqui, questione o usuário e atualize o contexto.
