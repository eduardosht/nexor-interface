# Deploy da Nexor na Netlify

Este frontend da Nexor pode ser publicado na Netlify usando o `netlify.toml` da raiz do repositório.

## O que já ficou configurado

- `base`: `project/frontend/nexor`
- `build command`: `npm install --prefix ../../packages/design-system && npm run build`
- `publish directory`: `dist`
- redirect SPA para `index.html`

Arquivo de referência:

- [netlify.toml](/C:/Users/Pichau/Projetos/nexor/netlify.toml)

## Por que esse comando extra existe

O frontend Nexor importa o design system local diretamente de:

- `project/packages/design-system/src`

Na Netlify, as dependências da app são instaladas em `project/frontend/nexor`, mas o TypeScript também entra na pasta do design system durante o build. Por isso, o comando instala antes as dependências do pacote `design-system`, evitando erros como:

- `Cannot find module 'react'`
- `Cannot find module 'styled-components'`
- `react/jsx-runtime`

## Como criar o projeto na Netlify

1. No painel da Netlify, clique em `Add new site` > `Import an existing project`.
2. Conecte o provider Git do repositório.
3. Selecione este repositório.
4. A Netlify deve ler o `netlify.toml` automaticamente.
5. Confirme que os campos ficaram assim:
   - Base directory: `project/frontend/nexor`
   - Build command: `npm install --prefix ../../packages/design-system && npm run build`
   - Publish directory: `dist`

## Variáveis de ambiente obrigatórias

Cadastre no painel da Netlify estas variáveis:

- `VITE_API_URL`
  - URL pública da sua API backend
  - Exemplo: `https://api.seudominio.com`
- `VITE_BITEPLANER_URL`
  - URL pública do produto Biteplaner
  - Exemplo: `https://biteplaner.seudominio.com`

## Variáveis opcionais

- `VITE_APP_URL`
  - URL pública deste frontend Nexor
  - Exemplo: `https://nexor.seudominio.com`
- `VITE_SUPABASE_URL`
  - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`
  - Chave pública anon do Supabase
- `VITE_CONTACT_EMAIL`
  - E-mail exibido na seção de contato
- `VITE_CONTACT_WHATSAPP`
  - Link público do WhatsApp exibido na seção de contato

## Observações importantes

- Sem `VITE_API_URL` e `VITE_BITEPLANER_URL`, o app pode até buildar, mas vai falhar em integrações e navegações externas em runtime.
- Como o app usa React Router, o redirect `/* -> /index.html` é necessário para recarregar rotas como `/entrar`, `/cadastro` e `/painel/...`.
- Se você for usar Supabase em produção, preencha também `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- Nunca coloque secrets privados do backend no frontend da Netlify.

## Verificação local antes do deploy

Dentro de `project/frontend/nexor`:

```bash
npm run typecheck
npm run build
```
