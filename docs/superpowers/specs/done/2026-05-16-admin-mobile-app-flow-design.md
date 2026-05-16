# Admin Mobile App Flow Design

## Contexto

O painel administrativo Nexor concentra rotas de dashboard, ordens, licenciamento, usuarios e configuracoes. No desktop, a estrutura atual funciona como um painel classico com sidebar, cards, filtros e tabelas. No mobile, essa mesma composicao fica apertada porque a interface tenta preservar a navegacao lateral, cards, filtros, tabelas e textos explicativos dentro de uma largura pequena.

A decisao desta spec e tratar o mobile como uma experiencia de app operacional, nao como uma versao encolhida do desktop. O conteudo principal deve ocupar a tela, com navegacao compacta, fluxos por etapas e acoes persistentes quando o usuario estiver preenchendo ou revisando informacoes.

## Direcao Aprovada

Adotar a estrategia **Fluxo guiado por etapas** para o admin mobile.

Em telas pequenas, paginas densas devem ser reorganizadas em tarefas curtas e sequenciais. O usuario deve enxergar primeiro o que precisa preencher, revisar ou decidir agora. Informacoes secundarias continuam disponiveis, mas ficam em passos posteriores, detalhes expansivos ou telas de detalhe.

## Principios Mobile

- Priorizar conteudo e acao, nao a moldura do painel.
- Remover a sidebar fixa do fluxo mobile.
- Usar comportamento de app: topo compacto, bottom bar quando fizer sentido, drawers/sheets para navegacao e filtros.
- Transformar formularios longos em etapas com progresso.
- Transformar tabelas densas em listas de cards ou fluxos de detalhe no mobile.
- Manter desktop produtivo e denso; a mudanca principal e adaptativa por breakpoint.
- Evitar textos institucionais longos em telas de trabalho mobile; descricao deve ser curta e contextual.

## Arquitetura de Experiencia

### Shell Mobile

O `PortalLayout` deve ter um modo mobile especifico:

- topbar compacta com titulo da area atual, notificacoes e botao de menu;
- sidebar desktop escondida no mobile;
- menu completo em drawer lateral ou bottom sheet;
- bottom bar opcional para destinos frequentes do admin;
- conteudo com largura total, padding menor e sem competir com navegacao fixa.

A bottom bar deve ser usada apenas para destinos recorrentes e mutuamente claros, como:

- Dashboard;
- Ordens;
- Usuarios;
- Configuracoes.

Rotas menos frequentes, como parceiros, dentistas, laboratorios e configuracoes especificas, devem ficar no drawer para nao poluir a navegacao principal.

### Formularios e Configuracoes

Paginas de configuracao, cadastro operacional ou licenciamento devem virar fluxos em etapas no mobile.

Modelo base:

1. Dados principais
2. Licenca e documentos
3. Operacao e regras
4. Revisao

Cada etapa deve:

- conter poucos campos por viewport;
- preservar campos em uma unica coluna;
- exibir progresso simples, como `2/4`;
- permitir voltar sem perder dados;
- salvar rascunho quando a tela tiver risco de perda de preenchimento;
- mostrar resumo das etapas concluidas;
- manter acao primaria fixa no rodape mobile.

Acoes esperadas:

- `Salvar e avancar`;
- `Voltar`;
- `Salvar rascunho`;
- `Enviar para analise` ou `Publicar`, quando aplicavel.

Accordions podem ser usados para resumo e revisao, mas nao devem esconder campos obrigatorios em uma estrutura confusa. Se a tela tem ordem de preenchimento clara, usar stepper em vez de varios accordions independentes.

### Ordens, Tabelas e Listas

No desktop, tabelas continuam sendo adequadas para comparacao e varredura. No mobile, a tabela deve virar uma experiencia de lista e detalhe.

Lista mobile de ordens:

- busca principal sempre visivel;
- botao `Filtros` abrindo sheet;
- chips de filtros ativos abaixo da busca;
- cards por ordem, com os dados prioritarios:
  - codigo do pedido;
  - cliente;
  - status;
  - etapa;
  - pendencia ou proxima acao;
  - data relevante.

Detalhe mobile da ordem:

1. Resumo
2. Pendencias
3. Documentos
4. Historico
5. Acoes

Esse fluxo evita scroll horizontal e reduz a carga visual sem remover informacao importante.

### Filtros

Filtros mobile devem funcionar como uma tarefa propria:

- busca textual no corpo da pagina;
- filtros avancados em bottom sheet;
- botao de aplicar;
- botao de limpar;
- chips visiveis para filtros ativos;
- contagem de resultados depois da aplicacao.

Filtros nao devem ocupar a primeira viewport inteira quando a tarefa principal for analisar registros.

### Acoes Fixas

Usar rodape fixo no mobile quando a tela tiver preenchimento, revisao ou decisao.

Padrao:

- rodape com borda superior e fundo solido;
- uma acao primaria clara;
- acao secundaria menor quando necessaria;
- respeito a safe-area inferior;
- conteudo com padding inferior suficiente para nao ficar escondido atras do rodape.

Nao usar rodape fixo em telas puramente informativas ou dashboards sem acao principal.

## Componentes Provaveis

Esta spec sugere criar ou evoluir componentes no design system/painel:

- `MobileAdminShell` ou variantes responsivas no `PortalLayout`;
- `BottomNavigation`;
- `MobileDrawerMenu`;
- `MobileStepFlow`;
- `StickyActionBar`;
- `FilterSheet`;
- `ResponsiveDataList`, mantendo tabela no desktop e cards no mobile;
- `OrderSummaryCard`;
- `StepReviewSummary`.

Os nomes finais podem mudar durante implementacao, mas as responsabilidades devem permanecer separadas.

## Regras de Conteudo

No mobile, cada pagina deve responder a uma pergunta principal:

- O que o admin precisa fazer agora?
- Qual informacao minima permite decidir?
- Qual detalhe pode ficar para depois?

Titulos devem ser curtos. Subtitulos longos do desktop devem virar ajuda contextual, tooltip, detalhe expansivo ou texto secundario em etapa de revisao.

## Acessibilidade e Usabilidade

- Areas tocaveis devem ter pelo menos 44px de altura.
- Bottom bar e sticky action bar precisam ter foco visivel.
- Drawers e sheets devem prender foco enquanto abertos e fechar com Escape.
- Stepper deve expor progresso em texto, nao apenas visualmente.
- Erros de formulario devem aparecer no campo e no resumo da etapa quando necessario.
- Estados de carregamento e vazio devem continuar legiveis em uma coluna.

## Fora do Escopo

- Redesenhar a identidade visual da Nexor.
- Substituir a experiencia desktop.
- Alterar backend ou contratos de API.
- Implementar app nativo.
- Criar novas regras de negocio para aprovacao, licenciamento ou ordens.

## Testes e Verificacao

Implementacoes derivadas desta spec devem incluir:

- testes de renderizacao do shell mobile;
- testes de navegacao por bottom bar/drawer;
- testes do fluxo de etapas preservando dados;
- testes de filtros em sheet;
- testes de listas responsivas substituindo tabelas em viewport pequena;
- verificacao manual ou automatizada em larguras de 360px, 390px e 430px.

## Referencias de UX

- Baymard: formularios mobile e reducao de friccao em preenchimento.
- Baymard: cuidado com accordions e tabs quando o usuario interpreta a interface como fluxo de etapas.
- Material Design: layout responsivo por breakpoints.
- SAP Fiori: tabelas complexas em mobile podem precisar de alternativa que nao seja tabela.
