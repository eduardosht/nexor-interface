# Nexor Frontend

Aplicacao React + Vite do portal Nexor. O frontend consome o backend Nexor por `VITE_API_URL` e nunca deve receber chaves privadas do Supabase.

## Stack

- React
- Vite
- TypeScript
- React Router
- Vitest
- MirageJS para modo mock

## Requisitos

- Node.js 20.11+
- npm
- Backend Nexor rodando para fluxos reais
- Supabase local ou remoto configurado no backend

## Instalar

```powershell
cd C:\Users\Pichau\Projetos\NexorProjects\nexor-interface\project\nexor
npm install
```

## Variaveis de ambiente

Crie o `.env` a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

Variaveis obrigatorias para os fluxos principais:

- `VITE_API_URL`: URL do backend Nexor. Local padrao: `http://127.0.0.1:3333`.
- `VITE_BITEPLANER_URL`: URL externa/local do Biteplaner quando a aplicacao precisa navegar para esse produto.

Variaveis opcionais:

- `VITE_APP_URL`: URL publica do proprio frontend.
- `VITE_SUPABASE_URL`: somente se o frontend usar o Supabase diretamente em algum fluxo publico.
- `VITE_SUPABASE_ANON_KEY`: somente chave publica/anon/publishable. Nunca use service role no frontend.
- `VITE_CONTACT_EMAIL`: email exibido em fluxos de contato.
- `VITE_CONTACT_WHATSAPP`: WhatsApp exibido em fluxos de contato.

Sem `VITE_API_URL`, as chamadas reais ao backend quebram em runtime. Sem `VITE_BITEPLANER_URL`, navegacoes para o Biteplaner podem quebrar.

## Rodar contra backend local e Supabase local

Suba primeiro o backend com Supabase local:

```powershell
cd C:\Users\Pichau\Projetos\NexorProjects\nexor-backend\project\api
npm run supabase:start -- --exclude vector
npm run supabase:db:reset
npm run dev:local:supabase
```

No frontend, deixe o `.env` assim:

```env
VITE_API_URL=http://127.0.0.1:3333
VITE_BITEPLANER_URL=http://localhost:5174
VITE_APP_URL=http://localhost:5173
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CONTACT_EMAIL=contato@nexor.com
VITE_CONTACT_WHATSAPP=
```

Depois rode:

```powershell
npm run dev
```

Abra o Vite na URL indicada no terminal, normalmente `http://localhost:5173`.

## Rodar apontando para producao ou staging

Para apontar o frontend local para uma API remota, altere apenas:

```env
VITE_API_URL=https://api-do-ambiente.example.com
VITE_BITEPLANER_URL=https://biteplaner-do-ambiente.example.com
VITE_APP_URL=http://localhost:5173
```

O backend remoto decide qual Supabase usar. O frontend nao deve receber `SUPABASE_SERVICE_ROLE_KEY`.

## Modo mock

Para testar telas sem backend real:

```powershell
Copy-Item .env.mock.example .env.local
npm run dev
```

O modo mock ativa `VITE_MOCK=true` e usa MirageJS. Ele e util para UI, mas nao valida persistencia real no banco.

## Validacao

```powershell
npm run typecheck
npm run test:run
npm run build
```

## Fluxo recomendado para testar ponta a ponta

1. Backend: `npm run supabase:start -- --exclude vector`.
2. Backend: `npm run supabase:db:reset`.
3. Backend: `npm run dev:local:supabase`.
4. Frontend: conferir `VITE_API_URL=http://127.0.0.1:3333`.
5. Frontend: `npm run dev`.
6. Validar dados no Studio: `http://127.0.0.1:54323`.
