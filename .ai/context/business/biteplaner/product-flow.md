# Fluxo de negócio do Biteplaner

Este documento descreve a jornada operacional atual do Biteplaner no MVP Nexor. Ele deve ser lido antes de qualquer alteração em telas, status, formulários, integrações, notificações ou regras de permissão do produto.

## Produto

O Biteplaner é um dispositivo odontológico personalizado para uso esportivo. A jornada envolve cliente, parceiro indicador, dentista licenciado e laboratório licenciado, com controle de consentimentos, avaliação clínica, pagamento, produção laboratorial e acompanhamento posterior.

## Atores

| Ator | Responsabilidade principal |
| --- | --- |
| Cliente | Criar conta, aceitar consentimentos, preencher onboarding e pré-consulta, escolher clínica, confirmar consulta, pagar quando estiver apto, acompanhar produção e adaptação. |
| Parceiro | Indicar clientes por link individual, acompanhar links gerados e acessar apenas informações operacionais da indicação. |
| Dentista licenciado | Confirmar consulta, revisar a pré-consulta, decidir aptidão clínica, preencher solicitação de produção e enviar a ordem ao laboratório. |
| Laboratório licenciado | Receber solicitação de produção, acompanhar pedido e retornar atualizações operacionais do dispositivo. |
| Operação Nexor | Aprovar perfis profissionais, auditar dados, configurar regras e dar suporte ao fluxo. |

## Etapas obrigatórias de jornada

Todas as tabelas que exibem coluna `Etapa` devem usar exclusivamente uma destas labels de jornada do cliente:

1. Pre-requisito
2. Consulta inicial
3. Decisão clínica
4. Compra
5. Laboratório
6. Adaptação e acompanhamento

Labels internas de preenchimento operacional, confirmação transitória de pagamento ou termos técnicos de status não devem aparecer como etapa para cliente, dentista, parceiro ou laboratório.

## Fluxo ponta a ponta

1. Parceiro gera um link individual para indicar um cliente.
2. Cliente acessa o link, cria conta Nexor e aceita consentimentos obrigatórios.
3. Cliente preenche onboarding do Biteplaner.
4. Cliente preenche pre-requisito e pré-consulta compartilhada.
5. Cliente escolhe uma clínica de dentista licenciado e confirma que combinou a consulta com o consultório.
6. Dentista aceita a solicitação de consulta.
7. Após a consulta, dentista abre a produção da ordem e vê a etapa `Avaliação inicial / anamnese` somente quando ainda precisa preencher o complemento daquele vínculo de consulta.
8. Dentista responde `Cliente está apto para uso do Biteplaner?`.
9. Se a resposta for `Sim`, a ordem vai para `Aguardando pagamento` e o cliente acessa a etapa `Compra`.
10. Cliente paga via Stripe Checkout.
11. A confirmação de pagamento é recebida pelo backend por webhook Stripe, registra os dados do pagamento e libera a ordem para o dentista finalizar a solicitação de produção.
12. Dentista preenche a solicitação de produção, anexa os arquivos obrigatórios e escolhe laboratório.
13. Laboratório recebe a ordem e executa a produção.
14. Cliente segue para adaptação, consulta de retorno e acompanhamento.

## Inaptidão clínica

Status técnico de refund por inaptidão não deve existir para o Biteplaner.

Quando o dentista marca `Cliente está apto para uso do Biteplaner? = Não`, o sistema deve:

- exigir o campo `Descrição da inaptidão para o cliente`;
- salvar a ordem em status técnico de inaptidão com possibilidade de reavaliação;
- exibir para cliente e dentista o label simples `Inaptidão`;
- encerrar o fluxo clínico atual sem cobrança;
- liberar para o cliente a ação de marcar nova consulta na etapa `Consulta inicial`;
- permitir que o cliente selecione a mesma clínica ou outra clínica licenciada;
- considerar o novo dentista escolhido como o único dentista vinculado ao novo ciclo da ordem.

Se o cliente escolher outro dentista após uma inaptidão, a etapa `Avaliação inicial / anamnese` deve aparecer para esse novo dentista, porque se trata de uma nova consulta e um novo complemento clínico. Se o mesmo complemento já tiver sido enviado pelo dentista atualmente vinculado, a tela deve abrir direto no `Resumo anamnese` ou na próxima etapa aplicável.

## Regras da avaliação inicial / anamnese

O formulário é compartilhado entre cliente e dentista:

- cliente preenche histórico médico, odontológico/orofacial, sintomas, função mandibular, impacto no treino, hábitos, expectativas e consentimentos;
- dentista complementa com decisão de aptidão, descrição de inaptidão quando aplicável, data da consulta, medidas clínicas e declaração profissional;
- depois que o dentista salva ou envia o complemento, as respostas do cliente ficam bloqueadas para edição na ordem atual;
- o dentista não pode avançar para solicitação de produção antes do pagamento confirmado;
- após concluir o complemento, a tela deve parar no `Resumo anamnese` e a ordem deve ir para pagamento se o cliente estiver apto;
- se a tela não tiver dados carregados, deve exibir aviso de processamento/carregamento em vez de mostrar vários campos como `Não informado` sem ação.

## Pagamento Stripe

O pagamento real deve acontecer via Stripe Checkout hospedado pela Stripe.

Regras:

- a tela `/painel/compra` inicia o checkout somente quando a ordem está em `Aguardando pagamento`;
- o sucesso retorna para `/painel/compra?checkout=success`;
- a URL de sucesso não é fonte de verdade do pagamento, apenas feedback visual;
- a confirmação oficial vem por webhook Stripe;
- o backend deve salvar sessão, payment intent, valor, moeda, status, método de pagamento, cupom/desconto quando houver, e dados de recibo quando enviados pela Stripe;
- depois do webhook de sucesso, o status `payment_confirmed` é transitório e a ordem deve seguir para o dentista finalizar a solicitação de produção;
- para o dentista, a ordem deve aparecer com ação operacional de envio ao laboratório, não parada em `Pagamento confirmado`.

## Status técnicos recomendados

| Status técnico | Label amigável | Observação |
| --- | --- | --- |
| `prerequisite_pending` | Pre-requisito | Cliente ainda precisa completar dados iniciais. |
| `consultation_selection` | Consulta inicial | Cliente pode escolher clínica/dentista. |
| `awaiting_dentist_acceptance` | Consulta inicial | Aguardando aceite do dentista. |
| `awaiting_clinical_decision` | Decisão clínica | Dentista deve revisar anamnese e decidir aptidão. |
| `ineligible_reassessment` | Inaptidão | Cliente pode marcar nova consulta; não usar refund. |
| `awaiting_payment` | Compra | Cliente apto deve pagar o Biteplaner. |
| `payment_confirmed` | Compra | Estado transitório após webhook Stripe. |
| `awaiting_dentist_forms` | Decisão clínica | Dentista deve finalizar solicitação de produção para envio ao laboratório. Label operacional recomendada: `Aguardando envio ao laboratório`. |
| `lab_selection_pending` | Laboratório | Dentista deve escolher laboratório se ainda não escolheu. |
| `sent_to_lab` | Laboratório | Ordem enviada ao laboratório. |
| `lab_in_progress` | Laboratório | Produção em andamento. |
| `adaptation_pending` | Adaptação e acompanhamento | Dispositivo produzido, aguardando adaptação/retorno. |
| `follow_up` | Adaptação e acompanhamento | Acompanhamento pós-entrega. |

## Formulários principais

### Cliente - onboarding Biteplaner

Coleta perfil pessoal, endereço, dados esportivos, saúde/lesões, perfil financeiro, objetivos, interesse no SIN, consentimentos e feedback aberto.

### Cliente e dentista - pré-consulta/anamnese

Coleta consentimento clínico, dados iniciais, histórico médico, histórico odontológico/orofacial, sintomas atuais, função mandibular, impacto no treino, hábitos, expectativas e complemento clínico do dentista.

### Dentista - solicitação de produção

Coleta resumo da avaliação/anamnese, solicitação de produção, observações técnicas ao laboratório, escaneamento 3D intraoral, prescrição assinada/carimbada e aceite LGPD de envio mínimo necessário ao laboratório.

### Onboarding profissional

Parceiro, dentista e laboratório têm cadastro complementar próprio, com dados profissionais/operacionais, local de atuação ou clínica/local operacional e aceite de termos/privacidade.

## Rastreabilidade

Cada transição relevante deve registrar ator, papel, data/hora, status anterior, status novo, formulário/versão quando aplicável e origem da ação. Pagamentos devem registrar IDs Stripe para reconciliação.
