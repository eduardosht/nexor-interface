# Biteplaner - Product Flow

Este documento descreve o fluxo de negócio do Biteplaner, da indicação comercial até o acompanhamento do usuário após o recebimento do produto. Ele serve como referência para escopo, atores, regras operacionais e estados da jornada.

## Visão geral

O Biteplaner e um produto pago, vendido com apoio de uma rede de parceiros e dentistas licenciados. A jornada comeca na indicação comercial, passa pela conta Nexor e pela inscrição no produto Biteplaner, segue para avaliação odontológica inicial, decisão de aptidão, pagamento quando aplicável, produção laboratorial, entrega e acompanhamento recorrente.

O cadastro primario pertence a Nexor, pois a Nexor opera como plataforma multi-produto. Esse cadastro deve ser simples, com e-mail e senha. A Nexor também registra os perfis escopados ao produto Biteplaner: cliente, parceiro, dentista e laboratório. O Biteplaner recebe a conta Nexor autenticada e esses perfis por produto para conduzir inscrição, ordem, origem comercial, pagamento, rede odontológica, formulários, laboratório e acompanhamento.

No MVP1, clientes do produto, categorizados como atletas, entram por fluxo público e têm ativação imediata como cliente Biteplaner. As demais opções do ecossistema, como dentistas, parceiros e laboratórios, podem ser solicitadas pela conta Nexor, mas ficam pendentes até aprovação operacional.

## Decisoes atuais do MVP

- O MVP inicial prioriza operação/admin, cadastros dos atores e ordem manual assistida.
- A conta, login, sessão, perfil básico e consentimentos gerais pertencem a Nexor.
- O Biteplaner não terá cadastro primario próprio; terá inscrição/vínculo de produto para contas Nexor e consumirá os perfis por produto registrados na Nexor.
- No MVP1, o fluxo público de compra/triagem do Biteplaner é restrito a clientes/atletas e fica ativo imediatamente após a escolha desse perfil.
- O usuário entra no Biteplaner a partir da área logada da Nexor, escolhendo o produto entre os disponíveis.
- Ao entrar no Biteplaner pela área logada da Nexor, a conta deve ver primeiro a opcao `Acessar como...`, com `usuário` como opcao principal em destaque e as opções operacionais `parceiro licenciado`, `dentista licenciado` e `laboratório licenciado`.
- Todos os atores que acessam a plataforma usam conta Nexor para login. Seus perfis por produto ficam registrados na Nexor e suas permissoes operacionais do Biteplaner dependem de status ativo e aprovação quando aplicável.
- O modo `usuário` do Biteplaner e sempre uma opcao disponível para iniciar a compra/triagem; ao escolher esse modo, o perfil `customer` do produto fica ativo imediatamente.
- Os modos `parceiro licenciado`, `dentista licenciado` e `laboratório licenciado` exigem perfil por produto ativo no backend antes de liberar a área correspondente. Solicitações novas entram como pendentes.
- Uma conta pode combinar `customer` com apenas um perfil operacional do Biteplaner: `partner`, `dentist` ou `lab`. Enquanto houver perfil operacional ativo ou solicitação pendente para parceiro, dentista ou laboratório, as outras opções operacionais devem ficar indisponíveis para nova solicitação.
- As solicitações de parceiro, dentista e laboratório devem acontecer em páginas dedicadas de cadastro complementar dentro do painel Nexor, não em modal, porque esses fluxos podem crescer em campos, documentos, aceites e validacoes especificas. No MVP esses formulários podem ter campos preliminares, validação de obrigatórios e aceite de termos/privacidade antes de criar a role pendente.
- Admin continua sendo perfil de plataforma. Usuário, dentista, parceiro indicador e laboratório são perfis por produto da conta Nexor quando precisarem atuar no Biteplaner.
- Não havera perfil `clinic_admin`.
- O dentista e o ator licenciado principal e pode solicitar o cadastro de um ou mais locais de atendimento no onboarding profissional.
- Cada local de atendimento do dentista deve ter endereço físico obrigatório e pode ser removido pelo solicitante antes do envio da solicitação.
- Após o envio do cadastro profissional do dentista, a Nexor deve informar explicitamente que ira verificar os dados antes de prosseguir com os proximos passos.
- Solicitações de dentistas querendo se licenciar entram em uma fila no painel administrativo da Nexor, baseada na solicitação bruta enviada pelo formulário.
- A Nexor Admin deve conseguir visualizar os dados preenchidos pelo dentista, aprovar ou recusar a solicitação, sem acessar dados clínicos de pacientes.
- Aprovação do cadastro não significa dentista plenamente licenciado: ela libera apenas o onboarding de licenciamento no painel do dentista.
- O dentista só fica operacionalmente selecionavel por usuários após concluir pagamento, contratos, curso, prova, contrato final e emissão do certificado Biteplaner.
- O laboratório segue fluxo espelhado ao dentista: cadastro complementar, revisão Nexor Admin, pagamento, contrato de intencao, curso, prova, contrato final e certificado antes de ficar operacional.
- No onboarding do laboratório, o CNPJ é obrigatório, deve ter máscara e validação; a seção de local operacional deve coletar CEP, endereço, cidade, estado, telefone e horário, com consulta de CEP quando disponível. Complemento é opcional.
- A plataforma não agenda consulta odontológica no MVP.
- A seleção do dentista e do local de atendimento acontece antes do pagamento, para viabilizar a primeira consulta obrigatória.
- O cliente/atleta não escolhe data ou horário pelo sistema; ele visualiza os dados do consultório para entrar em contato fora da plataforma.
- Quando a consulta estiver combinada fora da plataforma, o cliente confirma "Consulta agendada" na tela de escolha do consultório. Essa ação salva o local escolhido e envia uma solicitação ao dentista licenciado daquele local.
- Para evitar continuidade sem comunicação real com o consultório, a ordem só avança quando o dentista aceita a consulta agendada no painel.
- A home do dentista não oferece mais a ação manual "vincular consulta" por e-mail ou telefone; a fila operacional do dentista deve exibir solicitações de consulta enviadas pelo cliente e ordens já aceitas pelo dentista.
- Ao escolher a consulta clínica, o usuário também pode indicar o processo de licenciamento a um dentista de preferência ainda não licenciado, usando mensagem pronta por WhatsApp ou e-mail com link para `/parceiros#dentistas`.
- A indicação de dentista de preferência pode iniciar o contato com esse profissional, mas não libera a escolha imediata da clínica ou do dentista enquanto o licenciamento não for concluído.
- Para prosseguir com a ordem atual, o usuário precisa selecionar uma clínica já licenciada, pois o processo de licenciamento de um novo dentista pode demorar.
- O vínculo operacional da consulta com cliente, ordem e dentista passa a depender de duas etapas: solicitação "Consulta agendada" feita pelo cliente sobre uma clínica já licenciada e aceite do dentista licenciado responsável.
- A fila operacional do dentista deve exibir solicitações pendentes de aceite e ordens já vinculadas operacionalmente a esse dentista.
- O usuário final cria ou usa uma conta Nexor com cadastro simples de e-mail e senha, normalmente a partir de link único de parceiro quando houver indicação Biteplaner.
- Ao clicar em **Adquirir Biteplaner** dentro do painel, o perfil `customer` do produto fica ativo e a conta segue primeiro para o formulário `customer_new_user_onboarding`.
- O onboarding do produto coleta dados complementares de perfil, esporte, saúde/lesões, consumo, objetivos, SIN, consentimentos e feedbacks; dados já conhecidos da conta Nexor devem vir pré-preenchidos.
- O onboarding bloqueia avanço automático quando o aceite LGPD obrigatório não existir ou quando o usuário for menor de idade sem responsável maior assumindo a jornada.
- Depois do onboarding aprovado, antes da consulta inicial, o usuário deve preencher a avaliação inicial compartilhada Biteplaner dentro da etapa de pre-requisito.
- Esse pre-requisito usa o formulário `customer_pre_consultation_intake`, compartilhado entre cliente e dentista, com payload separado por role.
- Tratamento ortodôntico ativo no formulário clínico bloqueia a continuidade automática para escolha de clínica.
- A parte do cliente na avaliação inicial compartilhada deve ser concluída antes de liberar a busca por clínicas licenciadas; após a consulta, o dentista complementa o mesmo formulário com medidas de abertura bucal, observações clínicas por seção, síntese da anamnese/avaliação e pontos de atenção para decisão clínica.
- Os informativos e declarações desse pre-requisito são obrigatórios antes de liberar a consulta inicial e a avaliação odontológica do Biteplaner.
- As respostas do cliente ficam em modo leitura para o dentista. Os campos do dentista ficam separados por role e não devem sobrescrever as respostas do cliente.
- Quando o dentista iniciar ou salvar seu complemento, o formulário fica bloqueado para edicao pelo cliente e deve exibir estado de revisão pelo dentista.
- As perguntas de uso, adaptação e feedback pós-Biteplaner pertencem ao acompanhamento após entrega/adaptação, não ao intake de compra.
- O formulário `customer_training_report` é liberado somente quando a ordem entra em `follow_up` após a adaptação do produto e pode ter múltiplas submissões por ordem.
- A origem da indicação pode ser capturada na Nexor durante cadastro/login e repassada ao Biteplaner no momento da inscrição ou criação da ordem.
- O pagamento pode ser manual ou mockado no MVP.
- O produto tem preco inicial único de R$ 400.
- Links de parceiro podem conceder 10% de desconto ao usuário.
- Cada parceiro deve gerar um link novo para cada usuário potencialmente qualificado.
- O link do parceiro não deve ser permanente nem reutilizado em massa para multiplos usuários sem abordagem comercial individual.
- A geração do link acontece depois da conversa e da qualificação inicial do parceiro com o potencial cliente.
- Parceiros indicadores seguem revisão cadastral pela Nexor Admin antes de operar, mas não passam pelo fluxo de licenciamento com pagamento, contratos, curso, prova e certificado usado para dentistas e laboratórios.
- Após aprovação cadastral, a funcionalidade operacional do parceiro é gerar links individuais de indicação, acompanhar a conversão desses links e consultar avaliações recebidas.
- A regra de comissão inicial considera 5% para o parceiro quando a ordem for considerada comissionavel.
- A comissão do parceiro conta quando a ordem prossegue após consulta odontológica e o dentista declara o usuário apto.
- O parceiro terá painel com acesso limitado a nome, e-mail e telefone dos usuários indicados.
- O laboratório terá conta Nexor para login e perfil operacional Biteplaner, mas o fluxo inicial será operacional e manual.
- Notificacoes do MVP devem usar painel e e-mail.
- Admin pode acompanhar ordens, parceiros, usuários, dentistas, laboratórios, erros sistemicos e notificacoes, mas não pode acessar dados clínicos.
- Admin deve acompanhar também uma página/seção de dentistas querendo se licenciar, com visualização da solicitação cadastral e decisoes de aceite ou recusa.
- Admin deve acompanhar também uma página/seção de laboratórios querendo se licenciar, com visualização da solicitação cadastral, locais operacionais, CNPJ e decisoes de aceite ou recusa.
- Formulários clínicos terão detalhamento futuro; por enquanto, anamnese, pedido de produção e acompanhamento seguem como domínios sensíveis pendentes de campos obrigatórios finais.
- Para a liberação ao laboratório, o dentista deve revisar/completar a avaliação inicial ou anamnese e anexar o arquivo 3D da arcada dentaria do paciente.
- O prontuario e a guarda principal desse registro continuam sendo responsabilidade do dentista.
- A plataforma pode reter temporariamente esse pacote operacional até a conclusão da entrega do produto por motivos de segurança e rastreabilidade do processo.
- Cancelamento voluntario e retrabalho/refabricação ficam fora do MVP inicial.

## Atores do fluxo

- **Conta Nexor:** identidade global usada para cadastro, login, sessão, perfil básico e consentimentos gerais.
- **Usuário Biteplaner:** conta Nexor com perfil de cliente no produto Biteplaner, interessada em comprar e utilizar o produto.
- **Parceiro indicador:** academia, coach, profissional parceiro ou outra pessoa autorizada a apresentar o produto e encaminhar usuários para a plataforma.
- **Dentista licenciado:** profissional responsável pela avaliação, anamnese, coleta de medidas, pedido de produção, adaptacoes e acompanhamento.
- **Local de atendimento:** endereço operacional vinculado ao dentista; não é uma conta independente no MVP.
- **Laboratório:** responsável pela fabricação do produto a partir do pedido do dentista.
- **Plataforma Nexor:** sistema que centraliza conta, cadastro, login, sessoes, consentimentos gerais e entrada multi-produto.
- **Plataforma Biteplaner:** sistema que centraliza inscrição no produto, triagem, escolha de dentista, status da ordem, confirmacoes operacionais, formulários e histórico do produto.
- **Operação/admin:** equipe interna responsável por governança, suporte, cadastro de parceiros, dentistas, laboratórios, auditoria e excecoes.

## Premissas de negocio

- O Biteplaner e um produto pago.
- A conta Nexor e pre-requisito para compra e acompanhamento do Biteplaner.
- O cadastro público do usuário final na Nexor usa apenas e-mail e senha.
- No MVP1, clientes/atletas podem seguir do hub Nexor para a inscrição pública no Biteplaner imediatamente. Parceiros, dentistas e laboratórios podem solicitar seus perfis, mas só operam após aprovação.
- A escolha explicita do Biteplaner dentro da área logada da Nexor e pre-requisito para iniciar a jornada do produto.
- O preenchimento completo do onboarding `customer_new_user_onboarding` é obrigatório antes do pre-requisito clínico para quem opta por adquirir o Biteplaner no painel.
- O preenchimento completo da avaliação inicial compartilhada Biteplaner na etapa de pre-requisito e pre-condicao obrigatória para liberar a escolha de clínicas.
- O pre-requisito também registra os consentimentos específicos do produto antes da consulta inicial e bloqueia automaticamente tratamento ortodôntico ativo.
- A primeira consulta odontológica acontece antes da cobrança do produto.
- O pagamento só pode ser iniciado quando o dentista declara o usuário apto para utilizar o Biteplaner.
- Quando o dentista declarar o usuário apto, a ordem entra em uma etapa operacional de preenchimento dentista antes do envio ao laboratório.
- Somente dentistas licenciados e locais de atendimento vinculados a eles podem ser selecionados pelo usuário.
- Cada dentista licenciado precisa ter cadastro ativo e aprovado pela operação/admin.
- A consulta odontológica é obrigatória antes da produção.
- O usuário pode ser considerado inapto para utilizar o produto.
- Em caso de inaptidão declarada pelo dentista antes da cobrança, a jornada é encerrada sem pagamento do produto.
- O dentista também pode registrar que o usuário precisa concluir tratamento prévio antes da decisão final de aptidão; nesse caso a ordem fica em espera.
- Formulários clínicos e operacionais formam o histórico do usuário e do dentista.
- O relatório de treino/competição é pós-entrega/adaptação e repetível durante `follow_up` ou `completed`.
- A jornada envolve dados pessoais e dados de saúde/odontologia.
- Usuário menor de idade não compra diretamente; um responsável maior de idade deve criar a conta Nexor e assumir a jornada.

## Jornada principal

### 1. Indicação e entrada na Nexor

Um parceiro apresenta o Biteplaner a uma pessoa interessada e a direciona para a Nexor por QR Code ou link com contexto Biteplaner. Esse identificador pode ser usado para atribuicao comercial, rastreabilidade e comissionamento quando a ordem Biteplaner for criada.

Regra complementar desta etapa:

- o parceiro gera um link único por potencial cliente qualificado
- esse link representa uma indicação individual, não uma campanha pública aberta
- o objetivo e evitar compartilhamento indiscriminado do mesmo link para muitas pessoas sem qualificação previa
- ao acessar a Nexor por um link de parceiro, a plataforma deve preservar o token em cookie first-party por tempo limitado, para não perder a atribuição se o cliente navegar antes de criar conta, iniciar inscrição ou comprar
- o backend continua sendo fonte de verdade para validar se o link está ativo, expirado ou consumido

Resultado esperado:

- usuário acessa a Nexor por QR Code ou link com contexto Biteplaner
- Nexor preserva o contexto de produto e origem da indicação quando houver identificador valido
- usuário entende que está iniciando uma jornada de avaliação e eventual compra
- cada indicação fica rastreavel a um contato comercial individual do parceiro
- parceiro consegue acompanhar agregados de links gerados, clientes cadastrados por link, links convertidos e compras finalizadas, sem acessar dados clínicos

### 2. Conta Nexor, escolha do produto e inscrição no Biteplaner

O usuário cria ou acessa sua conta Nexor, entra na área logada da plataforma e escolhe entre os produtos disponíveis. Ao optar pelo Biteplaner, a conta segue para inscrição no produto para iniciar a jornada especifica.

Resultado esperado:

- conta Nexor criada ou autenticada
- consentimentos e aceites gerais registrados na Nexor
- usuário autenticado acessa a área logada da Nexor
- ao escolher Biteplaner, a conta passa por um seletor de contexto `Acessar como...`
- a plataforma libera sempre o modo `usuário`
- a plataforma libera os modos operacionais apenas quando a conta tiver o perfil Biteplaner correspondente vinculado
- no MVP1, somente contas de clientes/atletas podem seguir pelo fluxo público do Biteplaner
- usuário escolhe explicitamente o Biteplaner como produto de interesse e seleciona o perfil desejado no produto
- inscrição ou vínculo Biteplaner criado para a conta
- dados coletados com finalidade clara
- conta pronta para seguir para o onboarding do produto Biteplaner antes do pre-requisito clínico

### 2.1. Onboarding e licenciamento do dentista

O dentista solicita o perfil Biteplaner dentro do painel Nexor, preenchendo dados profissionais, CRO, resumo profissional e dados obrigatórios de uma ou mais clínicas. Após o envio, o sistema deve exibir disclaimer informando que a Nexor ira verificar o cadastro antes dos proximos passos.

Fluxo de revisão Nexor Admin:

- a solicitação entra na fila administrativa de dentistas querendo se licenciar
- a fila usa o vínculo de produto `dentist` pendente como fonte inicial
- o admin visualiza os dados preenchidos pelo dentista e decide aprovar ou recusar
- em caso de recusa, o motivo fica registrado e o dentista é notificado
- em caso de aprovação, o dentista recebe modal e notificação de sistema informando que o cadastro foi aprovado

Fluxo após aprovação cadastral:

- o dentista confirma o pagamento do licenciamento
- após confirmação do pagamento, assina o Contrato de Intenção de Licenciamento
- a assinatura do contrato deve ficar registrada no sistema com data/hora e versão/aceite
- depois da assinatura, o painel libera a seção de curso de licenciamento
- o curso inicial contém 3 conteúdos de vídeo e documentos de estudo: fundamentos clínicos, fluxo operacional/documentação e acompanhamento/qualidade
- após estudar os conteúdos, o dentista realiza a prova de licenciamento
- a nota mínima sugerida para aprovação no MVP e 70%
- o dentista tem 3 tentativas no total
- se aprovado, assina o Contrato de Licenciamento e recebe o certificado Biteplaner
- se reprovar nas 3 tentativas, assina o Distrato de Intencao de Licenciamento

Regras de liberação operacional:

- aprovação cadastral libera o painel de onboarding do dentista, mas não libera seleção por usuários
- pagamento confirmado não libera operação sozinho
- assinatura do Contrato de Intenção não libera operação sozinho
- curso concluído e prova aprovada não liberam operação sem Contrato de Licenciamento assinado
- somente após assinatura do Contrato de Licenciamento e emissão do certificado o dentista ganha status de licenciado ativo
- locais de atendimento do dentista só devem aparecer na seleção de usuários quando o dentista estiver licenciado ativo
- todas as decisoes administrativas, pagamentos simulados, assinaturas, tentativas de prova, certificados e distratos devem compor histórico/auditoria

### 2.2. Onboarding e licenciamento do laboratório

O laboratório solicita o perfil Biteplaner dentro do painel Nexor, preenchendo nome do laboratório, CNPJ válido, resumo operacional e dados obrigatórios do local. A subseção de local deve ter CEP, cidade, estado, endereço, telefone e horário de operação obrigatórios; complemento é opcional. Quando houver consulta de CEP disponível, a plataforma deve preencher cidade, estado e endereço para reduzir erro operacional.

Fluxo de revisão Nexor Admin:

- a solicitação entra na fila administrativa de laboratórios querendo se licenciar
- a fila usa o vínculo de produto `lab` pendente como fonte inicial
- o admin visualiza CNPJ, resumo operacional, locais preenchidos e decide aprovar ou recusar
- em caso de recusa, o motivo fica registrado e o laboratório é notificado
- em caso de aprovação, o laboratório recebe modal e notificação de sistema informando que o cadastro foi aprovado

Fluxo após aprovação cadastral:

- o laboratório confirma o pagamento do licenciamento
- após confirmação do pagamento, assina o Contrato de Intenção de Licenciamento
- a assinatura do contrato deve ficar registrada no sistema com data/hora e versão/aceite
- depois da assinatura, o painel libera a seção de curso de licenciamento
- o curso inicial contém 3 conteúdos de vídeo e documentos de estudo: fundamentos laboratoriais, fluxo de produção/documentação e controle de qualidade/rastreabilidade
- após estudar os conteúdos, o laboratório realiza a prova de licenciamento
- a nota mínima sugerida para aprovação no MVP e 70%
- o laboratório tem 3 tentativas no total
- se aprovado, assina o Contrato de Licenciamento e recebe o certificado Biteplaner
- se reprovar nas 3 tentativas, assina o Distrato de Intencao de Licenciamento

Regras de liberação operacional:

- aprovação cadastral libera o painel de onboarding do laboratório, mas não libera operação produtiva plena
- pagamento confirmado não libera operação sozinho
- assinatura do Contrato de Intenção não libera operação sozinho
- curso concluído e prova aprovada não liberam operação sem Contrato de Licenciamento assinado
- somente após assinatura do Contrato de Licenciamento e emissão do certificado o laboratório ganha status de licenciado ativo
- laboratórios só devem aparecer como opções de produção quando estiverem licenciados ativos
- todas as decisoes administrativas, pagamentos simulados, assinaturas, tentativas de prova, certificados e distratos devem compor histórico/auditoria

### 3. Onboarding, pre-requisito e avaliação inicial compartilhada Biteplaner

Após o usuário optar por adquirir o Biteplaner no painel, o Biteplaner deve apresentar o onboarding `customer_new_user_onboarding`. Se não houver bloqueio, a jornada segue para a avaliação inicial compartilhada dentro da etapa de pre-requisito. O cliente preenche sua parte do formulário clínico antes da escolha de clínicas, e o dentista complementa o mesmo registro após a consulta.

Essa etapa tem duas funcoes no MVP1:

- registrar o cadastro complementar do produto antes da pre-consulta
- registrar o intake inicial do cliente para preparar a consulta odontológica
- registrar os consentimentos específicos do Biteplaner antes da continuidade

Exemplos de informações que podem entrar na avaliação compartilhada:

- identificação, contato e modalidade esportiva
- histórico médico/odontológico relevante
- dor orofacial, hábitos, rotina esportiva e expectativas
- consentimentos obrigatórios e opcionais do produto

Resultado esperado:

- usuário recebe informativos obrigatórios antes de seguir
- usuário preenche o onboarding Biteplaner e passa pelas regras impeditivas iniciais
- usuário preenche a parte do cliente na avaliação inicial compartilhada
- usuário registra os consentimentos Biteplaner obrigatórios
- a plataforma registra as respostas para suporte da consulta inicial e da decisão clínica
- quando a avaliação do cliente e os consentimentos obrigatórios estiverem concluídos, o fluxo segue para escolha do dentista e consulta inicial

### 4. Escolha do dentista e local de atendimento

Depois da conta Nexor, da escolha do produto, da inscrição no Biteplaner e da conclusão do pre-requisito com avaliação inicial compartilhada e consentimentos, o usuário escolhe um dentista licenciado e um local de atendimento para realizar a primeira consulta.

Como alternativa, o usuário pode indicar o processo de licenciamento a um dentista de preferência que ainda não faça parte da rede licenciada. Nessa ação, o usuário usa uma mensagem pronta em seu nome por WhatsApp ou e-mail, com link para `/parceiros#dentistas`, para que o dentista entenda o processo e os benefícios de se tornar licenciado.

Resultado esperado:

- usuário seleciona dentista e local de atendimento
- usuário pode indicar o processo de licenciamento ao dentista de preferência por WhatsApp ou e-mail, com mensagem pronta e link para `/parceiros#dentistas`
- o dentista indicado entende o processo e os benefícios pela página de parceiros antes de eventual cadastro/licenciamento
- plataforma valida que o dentista está ativo e aprovado
- enquanto o licenciamento não for concluído, o usuário não pode escolher essa clínica/dentista indicado como local valido da consulta
- para seguir com a ordem atual, o usuário precisa escolher uma clínica já licenciada
- plataforma exibe os dados de contato do local selecionado
- o usuário usa esses dados para contato direto fora da plataforma
- quando a consulta estiver combinada, o usuário confirma "Consulta agendada" no sistema
- essa confirmação envia a solicitação ao dentista licenciado do local selecionado e coloca a ordem como aguardando aceite do dentista
- o dentista precisa aceitar a consulta agendada para criar o vínculo operacional e permitir a continuidade da ordem
- a consulta ainda não é considerada realizada até existir match/confirmação operacional entre paciente e dentista

### 5. Consulta inicial e confirmação operacional

Após combinar a consulta fora da plataforma, o cliente confirma "Consulta agendada" no local selecionado. A partir dessa solicitação, o sistema exibe a ordem na fila operacional do dentista licenciado como pendente de aceite. Quando o dentista aceita, o sistema registra que a avaliação inicial está em andamento.

Resultado esperado:

- cliente confirma consulta agendada para uma clínica/licenciado já selecionado
- sistema valida se a ordem ainda está aguardando consulta inicial e se a clínica está licenciada
- sistema envia a solicitação de consulta ao dentista licenciado do local selecionado
- dentista aceita a consulta agendada antes da continuidade da ordem
- sistema vincula operacionalmente a ordem ao dentista após o aceite
- usuário e dentista confirmam posteriormente que o atendimento foi realizado; quando as duas confirmacoes existem, a consulta fica confirmada
- ordem fica apta a receber a decisão clínica do dentista

### 6. Decisão clínica do dentista

Durante ou após a primeira consulta, o dentista declara um de tres desfechos para a ordem: apto, inapto ou necessita tratamento prévio.

Resultado esperado:

- o desfecho clínico fica salvo no histórico da ordem
- o sistema aplica a ramificação correta da jornada
- a ordem não segue para laboratório sem aptidão final registrada

### 7. Cenario apto: pagamento e liberação da ordem

Quando o dentista declara o usuário apto, o Biteplaner pode iniciar a cobrança do produto. Depois disso, a ordem entra em uma etapa operacional em que o dentista precisa preencher a solicitação de produção completa antes do envio ao laboratório.

Resultado esperado:

- pedido comercial apto para cobrança
- pagamento iniciado ou registrado manualmente
- usuário recebe orientação para concluir o pagamento
- ordem entra em `Aguardando preenchimento dentista` para completar documentação e anexos obrigatórios
- o envio ao laboratório só acontece depois do preenchimento completo da solicitação de produção

### 8. Cenario de inaptidão

Durante a consulta, o dentista pode identificar que o usuário não está apto a utilizar o Biteplaner.

Resultado esperado:

- dentista registra inaptidão
- motivo e observação ficam salvos no histórico da ordem
- ordem não segue para laboratório
- processo comercial é encerrado sem cobrança do produto

### 9. Cenario de tratamento prévio necessário

Durante a consulta, o dentista também pode concluir que o usuário podera utilizar o Biteplaner somente após um tratamento prévio.

Resultado esperado:

- dentista registra necessidade de tratamento prévio
- ordem fica em espera sem cobrança do produto
- laboratório continua bloqueado
- após a conclusão do tratamento, o dentista reabre a decisão clínica e declara apto ou inapto

### 10. Formulários odontológicos iniciais

Após a consulta, o dentista revisa/completa o formulário de anamnese e, quando houver aptidão, preenche uma solicitação de produção estruturada.

Resultado esperado:

- anamnese preenchida ou revisada pelo dentista nas secoes abertas ao perfil do dentista
- cliente e dentista confirmam que a consulta aconteceu antes da continuidade operacional
- declaração de aptidão clínica acontece antes da solicitação de produção
- ao declarar apto, a ordem entra em `Aguardando preenchimento dentista`
- o dentista acessa um fluxo próprio para preencher a solicitação de produção
- esse fluxo inclui a solicitação de produção e um campo aberto com orientações extras para o laboratório
- esse fluxo exige o anexo de 1 arquivo de escaneamento 3D intraoral
- esse fluxo exige o anexo de 1 arquivo de prescrição médica do dentista, carimbado e assinado, prescrevendo o Biteplaner ao paciente
- antes do envio ao laboratório, o dentista revisa ou completa a avaliação inicial/anamnese da ordem
- antes do envio ao laboratório, o dentista baixa obrigatóriamente o arquivo final da anamnese ao concluir essa etapa
- o sistema exibe avisó explicito de que o dentista e responsável pela guarda principal desse registro
- a plataforma pode manter esse conteúdo temporariamente somente até a conclusão da entrega do produto
- formulários vinculados ao usuário, dentista, local e ordem

### 11. Envio para laboratório

Com avaliação positiva, formulários preenchidos, anexos obrigatórios validados, LGPD confirmado e laboratório selecionado pelo dentista, a ordem muda para laboratório e o pedido segue para fabricação.

Resultado esperado:

- a liberação para o laboratório só acontece depois da avaliação inicial/anamnese revisada
- a liberação para o laboratório só acontece depois da solicitação de produção preenchida
- a liberação para o laboratório só acontece depois do anexo do arquivo 3D intraoral e da prescrição médica assinada e carimbada
- o dentista seleciona um laboratório licenciado antes de concluir o envio
- ordem entra em `Aguardando inicio da produção` na fila do laboratório
- o laboratório registra explicitamente o inicio da produção antes da conclusão
- depois do inicio, a ordem passa para `Em processo - Laboratório`
- laboratório fabrica o produto
- ao concluir a produção, a ordem passa para `Aguardando recebimento pelo dentista`
- o produto é enviado ao dentista ou local de atendimento
- o dentista confirma o recebimento antes da etapa de adaptação ser liberada

### 12. Recebimento e consulta de adaptação

Após o laboratório concluir a produção, a ordem fica aguardando confirmação de recebimento pelo dentista/local de atendimento. Somente após essa confirmação a ordem muda para `Aguardando adaptação`, e o usuário realiza nova consulta para entrega, avaliação de encaixe e ajustes iniciais.

Resultado esperado:

- produto aguardando confirmação de recebimento pelo dentista depois da conclusão da produção
- recebimento confirmado pelo dentista
- usuário orientado a realizar consulta de adaptação
- ajustes iniciais registrados quando necessários

### 13. Acompanhamento periodico

Após a entrega/adaptação, a ordem entra em `follow_up`. O primeiro `customer_training_report` é liberado para o cliente registrar uso real do Biteplaner em treino ou competição, e novas submissões podem ser criadas após cada envio. O usuário também retorna ao dentista a cada 3 meses, durante até 9 meses, para avaliar uso, ajustes e feedbacks.

Resultado esperado:

- retornos realizados em ciclos de 3 meses
- relatório de treino/competição disponível somente após adaptação e repetível durante acompanhamento
- acompanhamento mantido até completar 9 meses, quando aplicável
- histórico do usuário e do dentista atualizado

## Estados sugeridos da ordem

| Status | Descricao |
|---|---|
| `Cadastro iniciado` | Usuário acessou a Nexor com contexto Biteplaner e iniciou entrada/cadastro. |
| `Pre-requisito pendente` | Conta Nexor criada e inscrição Biteplaner iniciada, mas o formulário obrigatório anterior a consulta ainda não foi concluído. |
| `Aguardando consulta inicial` | Produto escolhido e triagem concluída, mas a primeira consulta ainda não foi vinculada/confirmada. |
| `Aguardando aceite do dentista` | Cliente informou consulta agendada em uma clínica licenciada, mas o dentista ainda precisa aceitar antes da continuidade. |
| `Aguardando decisão clínica` | Consulta inicial em andamento ou concluída, aguardando o desfecho do dentista. |
| `Aguardando pagamento` | Usuário foi declarado apto, mas o pagamento ainda não foi confirmado. |
| `Aguardando preenchimento dentista` | Usuário foi declarado apto, mas o dentista ainda não concluiu a solicitação de produção e os anexos obrigatórios para envio ao laboratório. |
| `Tratamento prévio pendente` | Dentista indicou necessidade de tratamento prévio antes da decisão final de aptidão. |
| `Em andamento` | Consulta inicial em fase operacional, validação clínica ou preparação dos proximos passos. |
| `Consulta confirmada` | Usuário e dentista confirmaram que a consulta aconteceu. |
| `Inapto - Encerrado` | Dentista registrou inaptidão e o fluxo foi encerrado sem cobrança. |
| `Aguardando inicio da produção` | Pedido já foi enviado pelo dentista ao laboratório, mas o laboratório ainda não iniciou formalmente a produção. |
| `Em processo - Laboratório` | Laboratório iniciou a produção e o pedido está em fabricação. |
| `Aguardando recebimento pelo dentista` | Laboratório concluiu a produção e o produto foi enviado ao dentista/local de atendimento, aguardando confirmação de recebimento. |
| `Aguardando adaptação` | Dentista confirmou o recebimento do produto e o usuário precisa realizar consulta de entrega/adaptação. |
| `Em acompanhamento` | Produto entregue e retornos periodicos em andamento. |
| `Concluído` | Ciclo de acompanhamento encerrado. |
| `Cancelado` | Ordem encerrada por cancelamento operacional, financeiro ou administrativo. |

Observacoes:

- `Pagamento confirmado` continua como evento financeiro dentro da ordem, sempre posterior a aptidão clínica.
- Confirmacoes operacionais relevantes devem usar match quando dependerem de duas partes.
- No-show registrado pelo dentista retorna a ordem para `Aguardando consulta inicial`.
- O ciclo de 9 meses não pode ser encerrado antes no MVP.

## Mapeamento atual com a implementação

| Leitura de negocio | Status tecnico atual |
|---|---|
| `Cadastro iniciado` | `registration_started` ou etapa anterior a inscrição Biteplaner/criação da ordem autenticada |
| `Pre-requisito pendente` | novo status recomendado antes da consulta inicial, ainda sem mapeamento tecnico consolidado |
| `Aguardando consulta inicial` | recomendação de novo status de negocio; técnicamente próximo de `awaiting_scheduling` |
| `Aguardando aceite do dentista` | `awaiting_dentist_acceptance` |
| `Aguardando decisão clínica` | etapa de negocio entre a consulta e a decisão final; hoje pode transitar por `in_progress` e `appointment_confirmed` |
| `Aguardando pagamento` | `awaiting_payment` |
| `Aguardando preenchimento dentista` | novo status recomendado após aptidão clínica e antes do envio ao laboratório |
| `Aguardando inicio da produção` | novo status recomendado após envio do dentista e antes do inicio formal pelo laboratório |
| `Tratamento prévio pendente` | novo status recomendado, ainda sem mapeamento tecnico consolidado |
| `Em andamento` | `in_progress` |
| `Consulta confirmada` | `appointment_confirmed` |
| `Inapto - Encerrado` | hoje o tecnico mais próximo continua `ineligible_refund`, embora a regra comercial alvo sejá sem cobrança |
| `Aguardando inicio da produção` | `awaiting_lab_start` |
| `Em processo - Laboratório` | `lab_processing` |
| `Aguardando recebimento pelo dentista` | `product_received_by_clinic` |
| `Aguardando adaptação` | `awaiting_adaptation` |
| `Em acompanhamento` | `follow_up` |
| `Concluído` | `completed` |
| `Cancelado` | `cancelled` |

## Formulários do fluxo

### Formulários operacionais do customer

Preenchidos pelo usuário ou responsável em etapas da triagem, da consulta inicial e da continuidade da ordem Biteplaner, antes ou depois do pagamento conforme a etapa. Estes formulários pertencem ao produto Biteplaner, não ao perfil global Nexor.

Templates atuais da jornada do cliente:

- `customer_new_user_onboarding`: primeiro formulário após a escolha de comprar o Biteplaner no painel. Bloqueia LGPD obrigatório não aceito e menor de idade sem responsável/conta responsável.
- `customer_pre_consultation_intake`: formulário clínico pré-consulta compartilhado; cliente e dentista preenchem seções separadas, e tratamento ortodôntico ativo bloqueia a continuidade automática.
- `customer_training_report`: relatório de treino/competição pós-entrega/adaptação, liberado em `follow_up` e repetível por ordem.

Regra de pré-preenchimento:

- valores existentes na conta Nexor ou em formulários anteriores devem preencher automaticamente campos vazios em etapas posteriores
- valores já salvos pelo usuário prevalecem sobre defaults
- campos definidos como somente visualização aparecem bloqueados para edição

### Formulários de avaliação operacional

Existem formulários de avaliação entre atores da rede para governança, ranking interno e qualidade operacional. Essas avaliações ficam registradas internamente para análise e melhoria da rede.

Avaliações aprovadas nesta etapa:

- **Dentista avaliando laboratório:** prazo de entrega, qualidade do dispositivo bruto, facilidade de contato e comentário opcional.
- **Laboratório avaliando dentista:** qualidade do arquivo de escaneamento 3D intraoral, facilidade de contato e comentário opcional.
- **Cliente avaliando dentista:** facilidade de contato, prazo para consulta, pontualidade, instalações do consultório, gentileza no atendimento, qualidade do ajuste no dispositivo recebido e comentário opcional.
- **Cliente avaliando parceiro academia/coach:** instalações quando aplicável, gentileza, disponibilidade no acompanhamento, qualidade técnica no direcionamento e comentário opcional.

Momentos de disparo dos surveys no MVP:

- **Cliente avaliando parceiro indicador:** após o primeiro cadastro na plataforma Nexor feito por link de recomendação/link de parceiro. O parceiro e a persona que indicou o produto ao cliente, como academia, coach ou instituição de treinamento; portanto o feedback independe de a ordem já ter avançado para etapas clínicas.
- **Cliente avaliando dentista:** após consulta de adaptação ou entrega do dispositivo, quando o cliente já consegue avaliar contato, prazo, pontualidade, instalações, gentileza e qualidade da orientação de uso/ajuste.
- **Dentista avaliando laboratório:** após o laboratório concluir a produção e o dentista receber ou validar o dispositivo bruto.
- **Laboratório avaliando dentista:** quando o laboratório recebe ou inicia a produção e já consegue avaliar a qualidade do arquivo de escaneamento 3D intraoral e a facilidade de contato com o dentista.

Decisoes operacionais associadas:

- validacoes de obrigatoriedade devem existir no frontend e no backend
- os campos devem ficar configurados por template para permitir ajustes futuros sem remodelar toda a feature
- o backend deve manter histórico de revisoes da avaliação enviada quando houver ajuste posterior
- a categoria **influencer parceiro** fica preparada para futuro, mas não entra no fluxo liberado do MVP atual

### Formulário de Anamnese

Preenchido pelo dentista após a consulta inicial para registrar informações clínicas e histórico necessário.

### Formulário de Pedido de Produção

Preenchido pelo dentista quando a avaliação for positiva para viabilizar a fabricação. Pode ficar em espera até a quitação do pagamento.

### Formulário de Acompanhamento

Preenchido pelo dentista nos retornos periódicos para registrar evolução, adaptações e observações técnicas.

## Notificacoes e alertas

O sistema deve alertar os envolvidos nos principais marcos da jornada:

- entrada Nexor com contexto Biteplaner
- inscrição Biteplaner iniciada ou concluída
- formulário pre-requisito pendente, concluído ou bloqueado por impeditivo
- liberação dos dados de contato do local de atendimento
- indicação de dentista de preferência pelo usuário e envio do convite/notificação de licenciamento
- cadastro de dentista aprovado ou recusado pela Nexor Admin
- pagamento, assinaturas, curso, prova, certificado e distrato do fluxo de licenciamento do dentista
- confirmação de consulta
- decisão clínica do dentista
- aptidão clínica confirmada
- pagamento confirmado
- registro de tratamento prévio quando aplicável
- envio para laboratório
- recebimento do produto
- necessidade de consulta de adaptação
- retornos de acompanhamento a cada 3 meses

No MVP, os canais implementaveis são painel e e-mail.

## Historico e rastreabilidade

Todos os eventos relevantes devem compor o histórico da ordem, do usuário e do dentista.

Eventos que devem ser rastreados:

- origem da indicação
- criação ou autenticação da conta Nexor quando relevante para a jornada
- inscrição no produto Biteplaner
- aceites e consentimentos gerais na Nexor
- preenchimento do formulário pre-requisito do Biteplaner e eventual bloqueio por impeditivo declarado
- complemento cadastral do produto realizado no pre-requisito, incluindo documento quando aplicável
- consentimentos e formulários específicos do Biteplaner
- criação do pedido
- escolha do dentista/local de atendimento
- indicação de dentista de preferência ainda não licenciado
- solicitação de licenciamento enviada pelo dentista
- aprovação ou recusa da solicitação de licenciamento pela Nexor Admin
- confirmação de pagamento do licenciamento do dentista
- assinatura do Contrato de Intenção de Licenciamento
- conclusão de conteúdos do curso de licenciamento
- tentativas e resultado da prova de licenciamento
- assinatura do Contrato de Licenciamento
- emissão do certificado Biteplaner
- assinatura do Distrato de Intencao de Licenciamento quando houver reprova nas tentativas permitidas
- solicitação de consulta agendada pelo cliente
- aceite da consulta agendada pelo dentista
- decisão clínica do dentista
- confirmação de pagamento
- liberação produtiva para laboratório
- preenchimento da solicitação de produção pelo dentista
- download final da anamnese pelo dentista
- anexo do escaneamento 3D intraoral
- anexo da prescrição médica assinada e carimbada
- seleção do laboratório licenciado
- confirmacoes de comparecimento
- registro de inaptidão
- registro de tratamento prévio
- preenchimento e alterácao de formulários
- mudancas de status da ordem
- envio ao laboratório
- recebimento do produto
- consultas de adaptação
- consultas de acompanhamento
- encerramentos
- alterações manuais de status pelo admin
- correcoes de origem da indicação pelo admin
- falhas de notificação e reenvios manuais

## Regras de acesso e dados

- Parceiros indicadores podem ver apenas nome, e-mail e telefone dos usuários indicados.
- Parceiros devem gerar um novo link por usuário abordado, mantendo a rastreabilidade individual da indicação.
- No pós-login do Biteplaner, cada contexto `Acessar como...` deve abrir uma área diferente:
  - `usuário`: fluxo principal do cliente/atleta
  - `parceiro licenciado`: usuários vinculados ao link/codigo, status operacional, informativos do usuário, comentários futuros e edicao cadastral
  - `dentista licenciado`: ordens do dentista, pendencias sob responsabilidade do dentista, aceite de consulta agendada solicitada pelo cliente, match de comparecimento, comentários futuros e edicao cadastral
  - `laboratório licenciado`: fila de produção, início formal da produção, status, documentos/observações do pedido, retorno ao dentista, comentários futuros e edição cadastral
- Admin pode operar ordens, auditoria, pagamentos e cadastros sem ler conteúdo clínico.
- Laboratório recebe apenas os dados necessários para produção.
- Dados globais de conta pertencem a Nexor; dados odontológicos, formulários clínicos e histórico operacional pertencem ao Biteplaner.
- Roles globais da conta Nexor não substituem autorização especifica do Biteplaner.
- Ações sensíveis devem ser auditaveis.
- Retencao decidida para o MVP:

| Tipo de dado | Retencao |
|---|---|
| dados de conta Nexor | 5 anos |
| inscrição/vínculo Biteplaner | 5 anos |
| dados de compra | 5 anos |
| formulários odontológicos | 5 anos |
| dados clínicos | até 10 anos quando houver obrigação profissional ou regulatória |
| logs de auditoria | 2 anos |

## Fluxo de parceiros

O fluxo de parceiros indicadores permite que academias, coaches, instituições de treinamento ou profissionais autorizados apresentem o Biteplaner a clientes potenciais por links individuais rastreáveis. O parceiro solicita cadastro complementar dentro do painel Nexor, escolhendo cadastro como CPF ou CNPJ, e a Nexor Admin aprova ou recusa essa solicitação antes de liberar o modo parceiro.

Após a aprovação, o parceiro tem escopo operacional reduzido:

- acessar a Home com visão analítica de links gerados, clientes cadastrados, conversões e compras finalizadas
- acessar o submenu `Indicar` para gerar um novo link individual, compartilhar por QR Code, WhatsApp, e-mail ou cópia de link
- acessar `Avaliações` para consultar feedbacks recebidos de clientes cadastrados por link de recomendação

O parceiro não acessa ordens clínicas como operador, não vê dados odontológicos e não recebe o submenu `Ordem`. A associação entre cliente e parceiro depende de invite token válido, preservado por cookie no frontend e validado pelo backend no momento de cadastro, inscrição Biteplaner, rascunho ou criação da ordem.

## Perguntas em aberto para decisão

- Quais provedores serão usados para e-mail e demais canais futuros?
- Qual deve ser o conteúdo e a cadência da notificação enviada ao dentista indicado para processo de licenciamento?
- Qual será a politica fiscal/nota fiscal e qual sistema externo será usado?
- Como será calculada exatamente a comissão de 5% quando houver desconto de 10%?
- Como será feito o tratamento de arquivos 3D quando essa etapa existir?
- Quais regras de licenciamento, aprovação e suspensão de dentistas e laboratórios devem bloquear operação?
- Quais dados ficarão no perfil global Nexor e quais serão duplicados ou referênciados no vínculo Biteplaner?
- O fluxo de referral Biteplaner será resolvido por link direto da Nexor, subdomínio de contas ou parametro preservado entre frontends?
- A Nexor terá dashboard multi-produto no MVP ou apenas cadastro/login e redirecionamento para Biteplaner?

## Resumo executivo

O Biteplaner opera como uma jornada conectada entre indicação, conta Nexor, inscrição no produto, escolha do dentista, avaliação odontológica, decisão clínica, pagamento quando houver aptidão, produção laboratorial e acompanhamento. O ponto central do fluxo Biteplaner continua sendo a ordem do usuário, que nasce antes da decisão clínica, passa pela validação do dentista e só gera cobrança quando houver aptidão final; em caso de inaptidão, a jornada é encerrada sem pagamento, e em caso de tratamento prévio a ordem fica em espera até nova avaliação.
