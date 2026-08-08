# Biteplaner: categoria do esporte como dado de produção

## Contexto

O checkout do Biteplaner atualmente solicita um campo `model`/“Modelo do Biteplaner”. Essa informação não deve ser escolhida pelo dentista, porque as características de fabricação serão definidas posteriormente a partir do esporte praticado.

## Decisão

- Remover o campo “Modelo do Biteplaner” da página `/painel/compra`.
- A categoria do esporte será o único dado técnico usado para orientar a futura relação entre esporte e características da moldeira.
- A configuração escolhida no checkout terá apenas cor e quantidade, além dos dados obrigatórios de produção já existentes.
- O contrato de criação de rascunho não exigirá `model` para novos pedidos.
- Pedidos históricos que ainda possuam `model` continuarão sendo aceitos e exibidos sem migração destrutiva.
- Listagens e detalhes novos devem priorizar “Categoria do esporte”; quando o backend ainda retornar apenas `model`, o valor legado poderá ser exibido como fallback técnico.

## Escopo

- Frontend: formulário de compra, tipos da API, resumo e textos relacionados.
- Backend: validação do rascunho, serviço e persistência para aceitar `model` nulo/ausente em novos pedidos, mantendo leitura de dados antigos.
- Interfaces operacionais: exibir categoria do esporte onde o contexto de produção estiver disponível.
- Testes: garantir que o input não seja renderizado, o payload não envie `model` e a categoria seja preservada.

## Fora de escopo

- Definir agora os tipos de moldeira ou as características por esporte.
- Criar a tabela de relacionamento esporte → característica.
- Alterar preço, quantidade máxima ou regras dos uploads obrigatórios.

## Critérios de aceite

1. O dentista não visualiza nem precisa preencher “Modelo do Biteplaner”.
2. O botão de checkout depende dos campos obrigatórios já existentes, incluindo categoria do esporte, cor, quantidade e arquivos.
3. O request de criação do rascunho envia cor, quantidade e categoria do esporte, sem `model`.
4. A categoria do esporte é salva e retornada na ordem.
5. Pedidos antigos com `model` continuam sendo exibidos e não quebram os fluxos administrativos.

