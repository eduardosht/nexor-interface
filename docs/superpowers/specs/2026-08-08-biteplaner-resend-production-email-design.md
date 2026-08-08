# Envio interno de produção externa via Resend

## Objetivo

Substituir o fluxo atual que monta um `mailto:` e abre o provedor de e-mail do administrador por um envio transacional feito pelo backend da Nexor usando o Resend.

## Escopo aprovado

- O destinatário principal será o e-mail do laboratório selecionado na ordem.
- O remetente será o endereço Nexor configurado em `CONTACT_EMAIL_FROM`.
- Não haverá CC fixo nesta primeira versão.
- Os três arquivos continuarão privados no S3 e serão referenciados no corpo do e-mail por links assinados com expiração.
- O navegador não abrirá mais o provedor de e-mail.

## Arquitetura e fluxo

1. O administrador aciona o botão de produção externa na página de ordens.
2. O frontend chama um endpoint autenticado de envio para a ordem.
3. O `CommerceAdminService` valida permissão, status da ordem, laboratório selecionado e os três anexos confirmados.
4. O serviço gera links privados temporários para os objetos confirmados no S3.
5. O serviço monta texto e HTML equivalentes e chama o `EmailClient` já integrado ao Resend.
6. O backend retorna sucesso e o identificador da mensagem do Resend, quando disponível.
7. O frontend informa que o e-mail foi enviado e permanece na página.

## Contratos

O endpoint atual de composição será substituído por uma operação de envio, mantendo a ordem como parâmetro. A resposta terá, no mínimo:

```json
{
  "sent": true,
  "recipient": "laboratorio@example.com",
  "providerMessageId": "..."
}
```

O serviço deverá rejeitar com mensagem segura quando:

- a ordem não estiver em revisão técnica ou pronta para produção;
- não houver laboratório selecionado;
- o laboratório não possuir e-mail válido;
- os três anexos não estiverem confirmados;
- o armazenamento privado não conseguir gerar os links;
- o Resend não estiver configurado ou rejeitar a mensagem.

O motivo técnico será registrado no log do backend sem expor token, conteúdo dos arquivos ou links assinados completos.

## Frontend

- Remover a montagem de `mailto:`, `window.open` e fallback de navegação.
- Manter o botão desabilitado durante o envio.
- Exibir estado de sucesso com o destinatário mascarado ou nome do laboratório.
- Exibir falhas retornadas pela API junto da referência da requisição, quando disponível.
- Cobrir a ausência de efeitos colaterais no `window` e a chamada correta do endpoint.

## Testes

- Serviço administrativo: laboratório selecionado, links privados, payload enviado ao `EmailClient` e falhas de validação/provedor.
- Rotas: autenticação, contrato de resposta e propagação de erros seguros.
- Frontend: clique chama envio, não abre janela, mostra sucesso e trata erro.
- Build e typecheck dos dois projetos.

## Fora do escopo

- Anexar binários diretamente ao e-mail.
- Criar CC configurável.
- Criar histórico persistido de envio ou política de reenvio idempotente.
