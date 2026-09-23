# Publicação estática no GitHub Pages

O MVP1 é publicado como um site estático pré-renderizado (SSG) no GitHub Pages. O build gera HTML para cada rota institucional; não há backend, autenticação, Supabase ou portal administrativo no entrypoint público.

## Configuração única do repositório

1. No GitHub, abra **Settings → Pages** e selecione **GitHub Actions** como fonte.
2. Mantenha o workflow `.github/workflows/deploy-pages.yml` na branch `main`.
3. Configure os registros DNS do domínio `nexoradvance.com.br` para o GitHub Pages conforme os endereços exibidos nas configurações do repositório. Para o domínio raiz, use os quatro registros A publicados pelo GitHub; para `www`, use o CNAME indicado pelo GitHub.
4. Ative **Enforce HTTPS** depois que o certificado for emitido.

O build usa o plugin oficial do React Router com `ssr: false` e `prerender: true`. O artefato publicado fica em `build/client`, com um `index.html` por rota e um fallback SPA para navegação client-side.

Para usar uma CDN gratuita, o mesmo artefato pode ser publicado no Cloudflare Pages. Nesse caso, use `project/nexor/build/client` como diretório de saída e conecte o repositório GitHub ao projeto Pages.

## Rotas públicas

`/`, `/sobre`, `/biteplaner`, `/conheca-biteplaner`, `/parceiros`, `/privacidade`, `/termos` e `/cookies`.

## Verificação local

```bash
cd project/nexor
npm ci
npm run typecheck
npm run build
npm run verify:ssg
npm run preview
```
