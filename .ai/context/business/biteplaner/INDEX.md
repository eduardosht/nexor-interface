# Biteplaner Business Context

Biteplaner é o primeiro produto da Nexor: um dispositivo odontológico personalizado para atletas, com plataforma digital associada, avaliação odontológica, pagamento, produção laboratorial e acompanhamento.

## Arquivos

- `product-flow.md`: fluxo de negócio completo, atores, jornada, status técnicos, formulários, pagamento Stripe, inaptidão, rastreabilidade e regras de interface.

## Regras-chave atuais do MVP

- Cadastro, login, sessão, perfil básico e consentimentos gerais pertencem à Nexor.
- O Biteplaner mantém dados complementares, aprovações, vínculos operacionais e status específicos do produto.
- A plataforma não faz agendamento odontológico dentro do sistema; ela registra a escolha da clínica, a solicitação de consulta e a confirmação operacional entre cliente e dentista.
- O fluxo público de compra/triagem do Biteplaner é para clientes atletas.
- Dentistas, parceiros e laboratórios podem solicitar perfil Biteplaner pela conta Nexor, mas seus acessos operacionais dependem de aprovação.
- O formulário de pré-consulta/anamnese é compartilhado entre cliente e dentista.
- Após a consulta, o dentista decide se o cliente está apto para usar o Biteplaner.
- Se estiver apto, a ordem vai para pagamento do cliente via Stripe Checkout.
- Se estiver inapto, a ordem fica em `Inaptidão`, exibe a descrição do dentista para o cliente e permite marcar uma nova consulta para reavaliação.
- Status técnico de refund por inaptidão não deve existir no produto.
- A confirmação de pagamento vem do webhook Stripe; `/painel/compra?checkout=success` é apenas feedback visual pós-redirecionamento.
- Depois do pagamento confirmado, o status deve avançar para o dentista finalizar a solicitação de produção e enviar ao laboratório.
- Toda coluna `Etapa` deve exibir somente: Pre-requisito, Consulta inicial, Decisão clínica, Compra, Laboratório ou Adaptação e acompanhamento.

## Regra de uso

Leia este contexto antes de implementar qualquer feature do Biteplaner. Se o pedido criar novo ator, etapa, regra comercial, dado, notificação, status, integração ou processo operacional não descrito aqui, atualize este contexto junto com a implementação.
