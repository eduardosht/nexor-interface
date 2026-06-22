# Painel Home Em Breve Design

## Objetivo

Atualizar `/painel/home` para trocar a area principal direita do painel por uma experiencia visual de "Em breve" inspirada na referencia enviada, mantendo a sidebar/layout do portal e preservando os cards funcionais de acoes rapidas.

## Escopo Aprovado

- Remover do conteudo principal atual o cabecalho "Informacoes da conta", banners auxiliares, hero atual do Biteplaner, aviso de ambiente seguro e demais conteudos que nao fazem parte da nova composicao.
- Criar um hero escuro no topo da area principal com o texto exato:
  - "Em breve no nosso site."
  - "A compra do Biteplaner estará disponível em breve."
  - "Fique ligado."
  - "Novidades chegando para elevar sua performance."
  - "TECNOLOGIA • PERFORMANCE • PROTEÇÃO"
- Criar ou usar uma nova imagem do Biteplaner mais parecida com a referencia, com produto flutuando e branding "NEXOR / BITEPLANER" no aparelho.
- Manter os cards de "Acoes rapidas" abaixo do hero, com a mesma logica, navegacao, estados dinamicos e permissoes atuais.
- Reestilizar os cards para se aproximarem da segunda referencia: cards brancos grandes, icone verde em circulo suave, status no canto superior direito, titulo forte, pequena linha verde, descricao, divisor e acao com seta no rodape.

## Layout

A area principal sera uma coluna responsiva:

1. Hero "Em breve" com fundo verde/preto, brilho radial verde, textura sutil e produto em destaque a direita.
2. Secao "Acoes rapidas" em fundo claro, com titulo e subtitulo "Atalhos para otimizar sua rotina no Biteplaner."
3. Grid de quatro cards em desktop, duas colunas em tablets e uma coluna em mobile.

O hero deve adaptar a imagem do produto para nao cobrir textos em telas menores. Em mobile, o texto vem primeiro e a imagem deve ficar reduzida/ao fundo ou abaixo, sem quebra visual grosseira.

## Comportamento

As funcoes atuais devem ser preservadas:

- Cliente sem ordem ativa pode iniciar compra/onboarding.
- Cliente com perfil ativo ou ordem em andamento ve "Acompanhar sua ordem" e navega para a jornada.
- Solicitacoes de parceiro, dentista e laboratorio continuam navegando para suas paginas dedicadas.
- Estados `active`, `pending`, `rejected`, `suspended` e bloqueios de papeis operacionais continuam refletidos nos cards.
- Erros de carregamento continuam acessiveis, mas integrados discretamente ao novo layout.

## Assets

Gerar um asset novo de produto para uso no hero, salvo dentro de `src/assets` ou subpasta existente de assets do projeto. O asset deve ter aparencia de render premium, produto escuro, iluminacao verde, sensacao flutuante e texto/branding no objeto. Se a geracao nao reproduzir texto com fidelidade suficiente, usar o melhor render visual e manter textos importantes code-native no hero.

## Testes E Verificacao

- Atualizar os testes de `PainelHome` para refletir a nova copy do hero e o visual/estrutura esperados dos cards, sem enfraquecer as verificacoes de comportamento.
- Rodar testes focados da pagina.
- Rodar build ou suite relevante disponivel.
- Verificar visualmente `/painel/home` em desktop e mobile, comparando com as referencias: hero escuro fiel, produto destacado, cards claros semelhantes, textos sem sobreposicao e cards funcionais.

## Fora De Escopo

- Alterar sidebar, `PortalLayout`, rotas globais ou fluxo de autenticacao.
- Desativar funcionalidades existentes dos cards.
- Alterar backend ou regras de produto.
