# Form Controls Validation Design

## Contexto

Depois da extracao inicial de `RadioQuestionGroup`, os formularios ainda mantem controles locais para checkbox, documento e alguns campos de nome aceitam numeros. O objetivo desta rodada e consolidar esses padroes no design system e aplicar nos principais formularios do frontend Nexor.

## Decisao

Criar controles reutilizaveis no design system para:

- radios com opcoes realmente inline;
- documentos com seletor de tipo a esquerda e mascara no campo a direita;
- checkboxes com visual de card, mais visiveis e coerentes com radios;
- sanitizacao basica de nomes e documentos.

## Componentes e helpers

### `RadioQuestionGroup`

Adicionar prop `inline?: boolean`.

Quando `inline` for `true`, todas as opcoes renderizam na mesma linha em desktop, sem depender de `columns`. Em telas pequenas, o componente pode quebrar para multiplas linhas para evitar overflow.

`variant="cards"` continua sendo usado para opcoes grandes.

### `DocumentField`

Componente controlado com:

- `label`
- `documentType`
- `documentNumber`
- `documentTypes`
- `onDocumentTypeChange`
- `onDocumentNumberChange`
- `error?`
- `hint?`

Tipos iniciais nesta entrega:

- `cpf`: mascara `000.000.000-00`, valor emitido somente com digitos;
- `rg`: mascara flexivel `00.000.000-0`, valor emitido em uppercase sem caracteres fora de letras/numeros.

O seletor de tipo fica a esquerda e o input a direita, no mesmo contorno visual.

### `CheckboxField`

Componente controlado com visual de card:

- input nativo preservado;
- area clicavel maior;
- borda, fundo e foco visiveis;
- estado selecionado com borda/fundo destacados;
- texto principal e descricao opcional.

## Validacao de nomes

Adicionar helper `sanitizePersonName(value: string): string`, removendo numeros durante digitacao e preservando letras, espacos, acentos, apostrofo e hifen.

Aplicar em:

- `Cadastro`: nome completo;
- `MinhaConta`: nome completo;
- `Contato`: nome;
- `PreRequisito`: nome do responsavel legal.

Campos de busca por nome nao entram nesta regra porque precisam aceitar texto livre.

## Aplicacao em telas

- `Cadastro`: usar `CheckboxField` nos consentimentos e sanitizar nome.
- `MinhaConta`: sanitizar nome antes de salvar.
- `Contato`: sanitizar nome.
- `PreRequisito`: trocar documento por `DocumentField` com CPF/RG, remover RNE nesta entrega, sanitizar nome do responsavel e usar `CheckboxField` nos consentimentos.
- `ProducaoDentista`: usar `CheckboxField` no aceite LGPD final se a substituicao for local e sem alterar fluxo.

## Fora do escopo

- Alterar backend/API.
- Validar CPF/RG por algoritmo oficial.
- Adicionar outros documentos alem de CPF/RG.
- Alterar campos de busca, tabelas ou dados mockados que apenas exibem nomes.
- Refatorar cookie consent nesta rodada, porque ele ja usa cards especificos de preferencia.

## Testes

- Design system: `RadioQuestionGroup` com `inline`, `DocumentField`, `CheckboxField` e helpers.
- Frontend Nexor: `Cadastro`, `PreRequisito` e `Contato` com sanitizacao/mascara; manter testes existentes de submissao.
