# Publicação estática no GitHub Pages

O MVP1 é publicado como um site estático Vite/React no GitHub Pages. Não há backend, autenticação, Supabase ou portal administrativo no entrypoint público.

## Configuração única do repositório

1. No GitHub, abra **Settings → Pages** e selecione **GitHub Actions** como fonte.
2. Mantenha o workflow `.github/workflows/deploy-pages.yml` na branch `main`.
3. Configure os registros DNS do domínio `nexoradvance.com.br` para o GitHub Pages conforme os endereços exibidos nas configurações do repositório. Para o domínio raiz, use os quatro registros A publicados pelo GitHub; para `www`, use o CNAME indicado pelo GitHub.
4. Ative **Enforce HTTPS** depois que o certificado for emitido.

O workflow copia `dist/index.html` para `dist/404.html`, permitindo que o `BrowserRouter` continue funcionando quando uma rota pública for recarregada diretamente.

## Rotas públicas

`/`, `/sobre`, `/biteplaner`, `/conheca-biteplaner`, `/parceiros`, `/privacidade`, `/termos` e `/cookies`.

## Verificação local

```bash
cd project/nexor
npm ci
npm run typecheck
npm run build
npm run preview
```
