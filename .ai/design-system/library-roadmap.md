# Library Roadmap

Este arquivo descreve como a documentação atual deve evoluir para uma biblioteca React real.

## Objetivo

Criar uma biblioteca de design system Nexor com suporte multimarca e componentes compartilhados.

## Direcao de arquitetura

### Nivel 1: core

Pacote com:

- tokens semanticos
- helpers de tema
- primitives de layout
- `Button`, `Field`, `Surface`, `Badge`, `NavItem`

### Nivel 2: marcas

Cada marca fornece:

- tokens da marca
- mapeamento semantico de cor
- tipografia
- overrides leves de componentes

Marcas previstas:

- `nexor`
- `biteplaner`
- futuras marcas do grupo

### Nivel 3: canais

Canais previstos:

- `default`
- `painel`

Papel dos canais:

- `default`: experiência pública, institucional, landing e jornadas menos densas
- `painel`: experiência administrativa, operacional e de produtividade

### Nivel 4: contextos

Especialmente para Biteplaner:

- `client`
- `partner`
- `dentist`
- `lab`
- `admin`

Esses contextos devem trocar acentos e pequenas prioridades visuais, sem criar componentes paralelos.

Exemplo de combinacao:

- `brand = biteplaner`
- `channel = painel`
- `context = admin`

## Ordem recomendada de implementacao

1. extrair tokens comuns
2. consolidar `Button`
3. consolidar `Field`
4. consolidar `Surface` e `Section`
5. consolidar primitives e patterns do canal `painel`
6. consolidar `PortalLayout` e `AdminLayout`
7. migrar landing e paginas públicas
8. migrar dashboards e portais

## Regra para o futuro pacote

- o pacote não deve aceitar explosão de props cosmeticas
- as variacoes validas devem continuar pequenas e previsiveis
- se um caso exigir componente novo, ele precisa provar que não cabe em uma familia existente
