# Biteplaner: checkout com documentação técnica prévia

## Objetivo

Atualizar a compra profissional do Biteplaner para R$ 1.400,00 por unidade e exigir, antes da criação do checkout Asaas, três arquivos técnicos e três atributos da ordem: categoria do esporte, idade e sexo biológico.

## Escopo aprovado

O dentista autenticado e licenciado preencherá a página de compra com:

- modelo, cor e quantidade do Biteplaner;
- categoria esportiva em lista fechada;
- idade inteira do paciente;
- sexo biológico em lista fechada;
- arquivo de escaneamento 3D das duas arcadas;
- arquivo de escaneamento 3D lateral com JIG;
- imagem da prescrição.

O botão de compra permanecerá desabilitado enquanto qualquer campo ou arquivo obrigatório estiver ausente, em upload ou com erro. O backend repetirá a validação e nunca confiará somente no bloqueio da interface.

Categorias esportivas iniciais:

1. Esportes de combate
2. Esportes coletivos
3. Esportes de raquete
4. Corrida e atletismo
5. Força e musculação
6. Ciclismo
7. Esportes aquáticos
8. Outros esportes

## Arquitetura

O fluxo usará um pedido `draft` criado no backend antes do checkout. Esse pedido já terá o dentista proprietário, a configuração de compra e os três atributos da ordem. Os uploads usarão intenções S3 privadas vinculadas ao `orderId` do rascunho e serão confirmados no banco somente depois de o objeto existir no bucket.

Quando todos os anexos forem confirmados, o frontend chamará o checkout com o `draftOrderId`. O backend verificará propriedade, status, campos estruturados e os três slots antes de alocar o laboratório, travar o pedido, calcular o total e criar a sessão Asaas. O valor unitário será `140000` centavos e o total será `140000 * quantity`.

Os objetos permanecerão em bucket privado. O banco armazenará apenas bucket, chave, slot, metadados, status e auditoria. O e-mail operacional continuará usando URLs assinadas temporárias geradas pelo backend no momento da composição; URLs não serão persistidas nem logadas e os binários não serão anexados ao e-mail nesta etapa.

## Slots de arquivo

Os slots atuais serão substituídos por nomes que refletem a regra de produção:

- `two_arches_scan`: escaneamento 3D das duas arcadas;
- `lateral_jig_scan`: escaneamento 3D lateral com JIG;
- `prescription_image`: imagem da prescrição.

As políticas de tamanho e MIME permanecerão centralizadas no backend. Scans aceitarão os formatos já suportados pelo componente e gateway de produção, incluindo STL, PLY, OBJ e ZIP quando aplicável; a prescrição aceitará imagem e PDF conforme a política de upload. O limite máximo continuará sendo 100 MB por arquivo, salvo ajuste motivado por teste existente.

## Dados da ordem

Os três atributos serão persistidos como colunas estruturadas em `commerce_orders`, com validação de domínio:

- `sport_category`: texto limitado aos valores do catálogo fechado;
- `athlete_age`: inteiro entre 0 e 120;
- `biological_sex`: enum textual fechado e neutro para evolução do catálogo.

Esses campos serão incluídos nos presenters administrativos e no resumo do e-mail ao laboratório. Eles não serão copiados para logs, URLs, metadata de provedor ou mensagens de auditoria além dos identificadores mínimos necessários.

## Estados e falhas

- `draft`: permite edição dos campos e substituição dos arquivos.
- `awaiting_payment`: só é alcançado depois da validação completa e da criação da cobrança.
- `payment_failed`: mantém o rascunho técnico para permitir nova tentativa segura de checkout.
- pagamento confirmado: como todos os anexos já existem, a ordem segue para `technical_review` em vez de aguardar um complemento posterior.
- upload expirado ou falho: não libera o checkout; o usuário pode reenviar o slot.
- rascunho abandonado: permanece elegível para limpeza futura por rotina de retenção, sem excluir arquivos confirmados durante esta entrega.

O backend rejeitará tentativa de finalizar um pedido de outro dentista, de usar um slot inválido, de confirmar uma chave S3 que não corresponda à intenção ou de criar cobrança sem os três anexos confirmados.

## Interface

A página `/painel/compra` reutilizará `UploadField`, `Select`, `Field` e os padrões de formulário existentes. A configuração e os dados da ordem ficarão em uma seção de dados de produção; os três uploads ficarão em uma seção de documentação técnica. Cada slot exibirá estado pendente, selecionado, enviando, enviado ou erro. O resumo lateral exibirá R$ 1.400,00 por unidade e recalculará o total pela quantidade.

O componente de upload será reutilizado sem expor URL pública. A API de frontend fará a sequência intenção → PUT na URL assinada → confirmação, com tratamento de erro por slot. O CTA exibirá uma orientação quando ainda houver pendências.

## E-mail para o laboratório

O serviço administrativo continuará compondo links assinados com expiração curta. O corpo incluirá ordem, dentista, produto, configuração, total, categoria esportiva, idade, sexo biológico e os três links privados. O laboratório não receberá acesso direto ao bucket nem poderá consultar a API da Nexor.

## Testes e verificação

O backend terá testes de serviço para preço, validação do pedido incompleto, autorização por dentista, confirmação de slots, transição para checkout e transição pós-pagamento. O frontend terá testes para preço, cálculo por quantidade, CTA bloqueado/desbloqueado, sequência de upload e payload do checkout. Também serão atualizados os handlers/mock contracts, migrations, documentação de jornada e ADR S3.

Antes da conclusão serão executados:

- testes focados frontend e backend;
- suíte completa de cada repositório;
- build de frontend e backend;
- auditoria de arquivos alterados por marcadores de mojibake;
- verificação de que não foram adicionados secrets, URLs assinadas persistidas ou permissões públicas no storage.

