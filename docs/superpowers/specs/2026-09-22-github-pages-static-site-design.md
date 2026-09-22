# GitHub Pages Static Site Design

## Goal

Publicar o frontend institucional da NEXOR ADVANCE como um site estático no GitHub Pages, usando o domínio `https://nexoradvance.com.br/`, sem dependência de backend, autenticação, Supabase ou portal administrativo no build público do MVP1.

## Decisions

- O site publicado usará `BrowserRouter` com URLs limpas.
- O domínio canônico será `https://nexoradvance.com.br/`.
- O deploy será feito por GitHub Actions para GitHub Pages.
- O Vite usará `base: '/'` no build publicado.
- O build público conterá somente rotas institucionais.
- O portal e o backend permanecerão no repositório para uma possível fase futura, mas ficarão fora da entrada estática publicada.

## Public surface

Rotas públicas:

- `/`
- `/sobre`
- `/biteplaner`
- `/conheca-biteplaner`
- `/parceiros`
- `/privacidade`
- `/termos`
- `/cookies`

Rotas fora do MVP1 estático:

- `/entrar`
- `/cadastro`
- `/recuperar-senha`
- `/conta`
- `/painel/*`

## Architecture

O frontend terá uma entrada pública que monta o layout institucional e um router público sem imports de autenticação, Supabase, API ou componentes do portal. O código operacional poderá permanecer em módulos separados para retomada futura, mas não será importado pelo entrypoint estático.

O deploy usará o artefato `project/nexor/dist`. O workflow será responsável por instalar dependências, executar validações, gerar o build e publicá-lo com as actions oficiais do GitHub Pages.

Como o site usará `BrowserRouter`, o build deverá fornecer um fallback `404.html` compatível com o shell React. O fallback precisa permitir acesso direto e refresh nas rotas públicas sem expor rotas autenticadas.

## Domain and assets

O HTML e os assets serão preparados para hospedagem na raiz do domínio próprio. Favicon, manifest, sitemap, robots, Open Graph e links internos não poderão depender do caminho `/nexor-interface/`.

O DNS deverá apontar o domínio apex para os endereços oficiais do GitHub Pages e configurar o subdomínio `www` para o domínio Pages da conta. A configuração de domínio e HTTPS será feita no GitHub após o primeiro deploy.

## Runtime constraints

O build público não exigirá `VITE_API_URL`, `VITE_BITEPLANER_URL`, `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY`. O site deve abrir e navegar com ambiente vazio, sem servidor local de API e sem sessão de usuário.

## Acceptance criteria

- O domínio canônico abre a página inicial por HTTPS.
- Todas as rotas públicas abrem diretamente e continuam funcionando após refresh.
- O site não exibe links públicos para login, cadastro ou portal.
- O bundle público não inicializa API, Supabase ou autenticação.
- O build funciona sem arquivo `.env` operacional.
- O workflow publica o conteúdo de `project/nexor/dist` automaticamente.
- O pipeline valida typecheck, testes públicos e build antes do deploy.
- Metadados, favicon, sitemap e robots apontam para `nexoradvance.com.br`.
- O site mantém acentuação UTF-8 e não introduz mojibake.
