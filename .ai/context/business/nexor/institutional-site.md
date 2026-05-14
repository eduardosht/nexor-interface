# Nexor - Contexto Institucional E Plataforma

Este documento descreve o papel institucional da Nexor, seu papel como plataforma multi-produto, seu público, sua oferta e os limites de escopo entre canal institucional, conta Nexor e produtos.

## Visão geral

O canal institucional da Nexor existe para apresentar a empresa, reforcar credibilidade e explicar o portfólio de produtos para visitantes, atletas, parceiros e stakeholders.

A Nexor também passa a ser a camada de entrada multi-produto do ecossistema. Cadastro, login, conta, sessoes, preferências globais, consentimentos gerais, seleção de produtos e perfis por produto pertencem a Nexor, não a um produto isolado.

No fluxo atual aprovado, o cadastro público base na Nexor deve ser simples e enxuto, com nome, e-mail, senha e confirmação de senha. O cadastro não deve exigir documento, dados clínicos, endereço detalhado ou validações operacionais do produto nessa etapa.

Produtos como Biteplaner continuam donos de seus domínios operacionais específicos. No caso do Biteplaner, ordens, rede odontológica, dados complementares de parceiro/dentista/laboratório, locais de atendimento, formulários odontológicos, aprovações operacionais, produção e acompanhamento permanecem dentro do domínio Biteplaner.

## Proposito da Nexor

Nexor e uma empresa de pesquisa, criação, tecnologia e precisão voltada a produtos para performance esportiva. Seu posicionamento institucional combina confianca técnica, foco em resultado e desenvolvimento orientado por produto.

## Público-alvo

- atletas amadores e profissionais
- praticantes de atividades de alta exigencia fisica
- parceiros comerciais, consultórios e distribuidores
- investidores e stakeholders institucionais

## Objetivos do canal institucional

- apresentar a Nexor e seu posicionamento
- comunicar os produtos ativos da empresa
- abrir canal de contato para interesse comercial, institucional ou de parceria
- reforcar credibilidade para lancamentos e expansão de portfólio

## Objetivos da plataforma Nexor

- centralizar cadastro, login e sessão dos usuários do ecossistema
- operar cadastro público simples com nome, e-mail, senha e confirmação de senha para a conta base
- permitir que uma mesma conta acesse diferentes produtos Nexor
- permitir que uma mesma conta tenha multiplos perfis escopados por produto, como cliente, parceiro, dentista ou laboratório no Biteplaner
- registrar consentimentos e preferências globais de conta
- permitir que o usuário, na área logada, escolha entre os produtos disponíveis da Nexor depois do cadastro ou login
- direcionar o usuário para o produto adequado a partir dessa seleção
- oferecer uma área administrativa Nexor para contas com perfil `admin`, separada do hub simples do usuário final
- permitir que o administrador selecione qual produto desejá gerenciar antes de abrir modulos operacionais
- sustentar crescimento futuro de portfólio sem duplicar cadastro por produto

## Oferta institucional atual

Produtos ativos:

| Produto | Descricao curta | Status |
|---|---|---|
| Biteplaner | Protetor bucal premium para atletas, com plataforma digital e acompanhamento odontológico. | Ativo |

## Regras de escopo

- O canal institucional não substitui a plataforma de produto.
- Cadastro, login, conta, sessoes e consentimentos gerais pertencem a plataforma Nexor.
- O cadastro público base da Nexor deve coletar nome, e-mail, senha e confirmação de senha.
- O cadastro base da Nexor não deve coletar dados clínicos, elegibilidade operacional do produto ou formulários específicos de jornada.
- Checkout, ordem, jornada operacional, papéis profissionais e dados clínicos permanecem nos domínios dos produtos.
- A Nexor pode ter área de conta e seleção de produtos, mas não executa a operação específica do Biteplaner.
- A conta Nexor não torna automaticamente o usuário elegível para operar um produto; cada produto deve ter inscrição e perfil por produto registrados na camada Nexor, com complementos e aprovações operacionais no domínio do produto.
- A área logada da Nexor funciona como hub de produtos: após cadastro ou login, o usuário acessa sua conta e escolhe qual produto desejá utilizar.
- No estado atual, a lista de produtos disponíveis na área logada terá apenas o Biteplaner, mas o modelo deve continuar preparado para expansão futura.
- Se o perfil autenticado for `admin`, o pós-login não cai no hub simples do usuário final; ele entra no portal administrativo da Nexor.
- O portal administrativo da Nexor continua orientado por produto: o administrador escolhe o produto ativo e só entao visualiza ordens, usuários e configurações daquele contexto.
- No estado atual, o portal administrativo terá apenas o contexto do Biteplaner, mas a arquitetura e a navegação devem suportar futuros produtos.
- Novos produtos devem ser adicionados ao contexto institucional quando passarem a fazer parte do portfólio oficial.
- Canais de contato devem coletar apenas o necessário para retorno comercial ou institucional.

## Modelo de conta e produtos

O modelo recomendado separa identidade de participação em produto:

| Camada | Responsabilidade |
|---|---|
| Conta Nexor | identidade, login, sessão, credenciais básicas, preferências, consentimentos gerais |
| Admin Nexor | governança da plataforma, escolha do produto administrativo ativo, configurações globais e navegação entre modulos internos |
| Inscrição em produto | vínculo entre conta Nexor e um produto específico, como Biteplaner |
| Perfil por produto Nexor | papel escopado a um produto, como cliente, parceiro, dentista ou laboratório no Biteplaner |
| Dominio do produto | regras, dados complementares, aprovações operacionais, ordens, formulários e histórico específico |

Exemplo: uma pessoa pode ter uma conta Nexor e estar inscrita no Biteplaner como cliente. A mesma conta também pode solicitar perfil de dentista, parceiro ou laboratório no Biteplaner. A Nexor registra o perfil por produto; CRO, CNPJ, local de atendimento, licenciamento e permissão operacional continuam no contexto Biteplaner.

Na interface logada da Nexor, a home do portal funciona como hub do produto Biteplaner. Cliente inicia imediatamente a inscrição e segue para o pre-requisito. Parceiro, dentista e laboratório seguem para páginas dedicadas de cadastro complementar, com campos obrigatórios preliminares, aceite de termos/privacidade e mensagem de sucesso após envio; esses cadastros criam solicitações pendentes até aprovação operacional.

Fluxo esperado na conta Nexor:

1. usuário cria conta ou faz login na Nexor
2. usuário acessa a área logada da conta
3. usuário visualiza os produtos disponíveis no ecossistema Nexor
4. usuário escolhe o produto desejado, atualmente o Biteplaner
5. a Nexor encaminha o usuário para a inscrição ou continuidade do fluxo desse produto

Fluxo esperado para conta admin Nexor:

1. usuário com role `admin` faz login na Nexor
2. a Nexor valida o perfil administrativo antes de definir o destino pós-login
3. o usuário entra no portal administrativo da Nexor
4. o usuário escolhe qual produto desejá gerenciar, atualmente o Biteplaner
5. a Nexor abre os modulos administrativos desse produto, mantendo shell e identidade visual consistentes

## Portal administrativo Nexor

Escopo atual aprovado para contas admin:

- seleção do produto administrativo ativo
- listagem de usuários do sistema com filtros por perfil e busca por nome, e-mail ou identificador
- listagem de ordens do sistema com status e etapa atual
- configuração de negocio por segmento operacional do produto
- configuração de sistema com mensagem global pós-login e bloqueio imediato de novas compras

Limites:

- o portal administrativo da Nexor não substitui autorização de backend; permissoes sensíveis continuam obrigatórias no servidor
- alterár ou públicar contratos, regras comerciais e bloqueios globais exige trilha de auditoria quando sair do prototipo/front-end
- a administração continua sendo por produto; um admin Nexor não deve ver dados operacionais misturados sem escolher contexto

## Fronteira com Biteplaner

- A entrada por campanha, QR Code ou link de parceiro pode iniciar na Nexor e carregar contexto do produto Biteplaner.
- A Nexor deve preservar a origem da indicação e entregar esse contexto ao fluxo Biteplaner quando a ordem for criada.
- O cadastro primario do usuário final acontece na Nexor.
- Esse cadastro primario e simples e pede nome, e-mail, senha e confirmação de senha.
- Depois do cadastro ou login, o usuário entra primeiro na área logada da Nexor e escolhe o Biteplaner antes de seguir para o fluxo do produto.
- A ordem Biteplaner nasce apenas quando o usuário entra no fluxo do produto e inicia a compra ou jornada operacional.
- Dentistas, parceiros indicadores e laboratórios usam conta Nexor para login e tem perfis por produto registrados na Nexor. Seus cadastros complementares, status de aprovação e permissoes operacionais são tratados no contexto Biteplaner.
- Dados odontológicos e dados de saúde não pertencem ao perfil global Nexor.

## Conteúdo institucional esperado

- quem e a Nexor
- quais produtos fazem parte do portfólio
- como parceiros ou interessados entram em contato
- mensagens coerentes com posicionamento tecnico e confiavel
- entrada para cadastro/login da conta Nexor quando a plataforma estiver ativa
- área logada com vitrine de produtos disponíveis para a conta
- direcionamento para produtos disponíveis conforme contexto e elegibilidade

## Perguntas em aberto para decisão

- Qual canal operacional recebera os contatos institucionais?
- Quais depoimentos, provas sociais ou cases estão aprovados para uso público?
- O lancamento institucional exigira versão em mais de um idioma?
- Novos produtos terão página própria ou apenas apresentação institucional resumida?
- A conta Nexor usara domínio principal, subdomínio dedicado ou área `/conta` no site institucional?
- O dashboard Nexor terá apenas seleção de produtos no MVP ou também histórico/resumo multi-produto?
- Como será apresentado ao usuário o repasse do contexto de referral do Biteplaner durante o cadastro Nexor?

## Resumo executivo

O contexto da Nexor combina apresentação institucional e camada de plataforma. A Nexor comunica a empresa e o portfólio, centraliza conta/cadastro/login e direciona o usuário aos produtos. A operação específica de cada produto permanece no domínio correspondente; no Biteplaner, isso inclui ordens, rede odontológica, formulários, laboratório e acompanhamento.
