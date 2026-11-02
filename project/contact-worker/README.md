# Contato institucional sem backend Nexor

O site estático no GitHub Pages envia `POST /v1/contact` para
`https://nexor-contact.eduardoshoitifujiwara.workers.dev`.
O Cloudflare Worker encaminha a mensagem via Resend para
`contato@nexoradvance.com.br`. As caixas e o recebimento permanecem na Hostinger.

## Publicação

1. Instalar dependências com `npm install` nesta pasta.
2. Autenticar a conta Cloudflare correta com `npx wrangler login`.
3. Executar `npm test` e `npm run deploy`. O arquivo `wrangler.jsonc` configura
   o limite de cinco solicitações por minuto por IP em cada localidade Cloudflare.
4. Criar uma chave Resend com permissão **Sending access**, restrita ao domínio
   `nexoradvance.com.br`. Guardá-la com `npx wrangler secret put RESEND_API_KEY`.
   Nunca colocar a chave em arquivos versionados, variáveis `VITE_*` ou no navegador.
5. Validar um envio para a caixa de contato e conferir a entrega no Resend antes
   de publicar o frontend pelo fluxo existente do GitHub Pages.

Sem chave ou binding de limite de envios, a função responde 503 e não envia.
O endpoint aceita somente os domínios públicos Nexor, JSON de até 16 KB,
nome de 2–120 caracteres, e-mail até 160 caracteres, assunto conhecido e mensagem
de 10–2000 caracteres. O campo `website` é uma armadilha antispam e deve ficar vazio.
O campo opcional `telefone` aceita celular como `(11) 9 8765-4321` ou fixo como
`(11) 3456-7890` e é incluído no corpo do e-mail apenas quando preenchido.
As origens permitidas são uma restrição de navegador; o limite de envios também
é necessário porque clientes externos podem forjar o cabeçalho Origin.

Não há banco de dados nem logs de conteúdo das mensagens. O Resend processa o
nome, o e-mail e a mensagem para entrega. O endereço do visitante fica em Reply-To;
remetente e destinatário são fixos e não podem ser escolhidos pelo cliente.
O formulário orienta o visitante a não enviar documentos ou dados de saúde.

## Validação

`npm test` testa o Worker sem enviar mensagens reais. Os testes de interface ficam
em `../nexor/src/sections/Contato/Contato.test.tsx`.

Uma resposta `{ "ok": true }` indica aceitação pelo Resend, não confirmação de
entrega na caixa final. Erros preservam o formulário para nova tentativa.
