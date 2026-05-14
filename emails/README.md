# Biteplaner — E-mails transacionais e notificações

Este diretório contém os templates de e-mail do produto Biteplaner, organizados por gatilho e destinatário.

## Índice

### Usuário (cliente)

| Arquivo | Assunto resumido | Gatilho |
|---|---|---|
| `01-confirmacao-cadastro.md` | Confirme seu e-mail | Cadastro concluído |
| `02-boas-vindas-usuario.md` | Boas-vindas | E-mail confirmado |
| `03-pagamento-pendente.md` | Pagamento aguardando | Pedido criado |
| `04-pagamento-confirmado.md` | Pagamento confirmado | Admin/gateway confirma |
| `05-local-atendimento-selecionado.md` | Dados do consultório liberados | Usuário seleciona local |
| `06-consulta-confirmada-usuario.md` | Consulta registrada | Match de consulta |
| `07-aptidao-confirmada.md` | Apto — fabricação iniciada | Dentista registra aptidão |
| `08-inaptidao-ressarcimento.md` | Inaptidão — ressarcimento | Dentista registra inaptidão |
| `09-produto-recebido-adaptacao.md` | Produto no consultório | Match de entrega |
| `10-acompanhamento-periodico.md` | Lembrete de retorno | A cada 3 meses |
| `11-ciclo-concluido.md` | Jornada concluída | 9 meses de acompanhamento |

### Parceiro indicador

| Arquivo | Assunto resumido | Gatilho |
|---|---|---|
| `12-cadastro-parceiro-aprovado.md` | Cadastro aprovado | Admin aprova parceiro |
| `13-comissao-parceiro.md` | Nova comissão registrada | Ordem avança para produção |

### Dentista licenciado

| Arquivo | Assunto resumido | Gatilho |
|---|---|---|
| `14-cadastro-dentista-aprovado.md` | Cadastro aprovado | Admin aprova dentista |
| `15-dentista-novo-cliente.md` | Novo cliente selecionou seu consultório | Usuário seleciona local |
| `16-dentista-pedido-producao.md` | Pedido encaminhado ao laboratório | Dentista envia pedido |

### Laboratório

| Arquivo | Assunto resumido | Gatilho |
|---|---|---|
| `17-laboratorio-novo-pedido.md` | Novo pedido de produção | Dentista envia pedido |
| `18-laboratorio-cadastro-aprovado.md` | Cadastro aprovado | Admin aprova laboratório |

### Admin / Operação interna

| Arquivo | Assunto resumido | Gatilho |
|---|---|---|
| `19-admin-nova-ordem.md` | Nova ordem registrada | Pedido criado |
| `20-admin-inaptidao-ressarcimento.md` | Inaptidão — ressarcimento pendente | Dentista registra inaptidão |
| `21-admin-cadastro-parceiro-pendente.md` | Novo cadastro aguardando aprovação | Qualquer ator se cadastra |

## Variáveis de template

Todas as variáveis são marcadas com `{{nome_variavel}}`. O sistema de e-mail deverá substituí-las pelos valores reais antes do envio.

## Diretrizes de conteúdo

- Não expor dados clínicos em nenhum e-mail.
- Não incluir dados financeiros sensíveis além do necessário (valor da ordem, valor da comissão).
- Dados de saúde e formulários clínicos ficam apenas na plataforma, nunca no corpo do e-mail.
- Parceiros não recebem dados clínicos nem detalhes da avaliação odontológica.
- Admin não acessa conteúdo clínico — os e-mails de admin são operacionais.
- Todos os e-mails devem conter um link direto para a plataforma (painel ou ordem).
