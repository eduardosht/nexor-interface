# Planejamento de publicacao do Nexor

Atualizado em: 2026-05-14

## Decisoes registradas

- Banco de dados: manter no Supabase.
- Hospedagem escolhida para aplicacao: Hostinger, plano Business da Hospedagem de aplicacoes web em Node.js.
- Observacao: a pagina escolhida e de hospedagem Node.js gerenciada, nao VPS tradicional com acesso root.
- Uso pretendido: publicar backend Fastify/Node e avaliar publicar tambem o frontend Vite/React na Hostinger.

## Dados do plano Hostinger Business observados em 2026-05-14

- Preco promocional exibido: R$ 13,99/mes em contrato de 48 meses.
- Renovacao exibida: R$ 64,99/mes.
- Capacidade informada: 5 aplicacoes Node.js gerenciadas.
- Sites informados: ate 50 sites.
- Recursos informados: 2 nucleos de CPU, 3 GB RAM, 50 GB NVMe.
- Recursos incluidos: SSL gerenciado, CDN, WAF, backups diarios e sob demanda, GitHub com deploy automatico.
- Frameworks frontend listados: React e Vite, entre outros.
- Frameworks backend listados: Fastify, Express.js e NestJS, entre outros.

## Perguntas ainda abertas

- Manter o frontend atual na Netlify ou migrar tambem para a Hostinger?
- Usar um dominio para o frontend e subdominio `api` para o backend?
- Escolher plano Supabase Free ou Pro para producao.
- Definir checklist de deploy, variaveis de ambiente e rotina de backup/rollback.

## Configuracao planejada para publicar o backend na Hostinger

Servico: `project/backend/api`

Stack detectada:

- Runtime: Node.js 20 ou superior.
- Framework: Fastify.
- Build command: `npm run build`.
- Start command: `npm start`.
- Entry file: `dist/server.js`.
- Output directory: `dist`.
- Health check manual: `/health`.
- Documentacao Swagger em producao: `/docs`.

### Variaveis de ambiente do backend

Configurar no hPanel apenas para a aplicacao backend:

```text
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
API_PUBLIC_ORIGIN=https://SEU-FRONTEND
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_ANON_KEY=SUA_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
```

Notas:

- Se a Hostinger informar/injetar uma porta propria para a aplicacao, usar a porta indicada por ela no lugar de `3333`.
- `SUPABASE_SERVICE_ROLE_KEY` deve existir somente no backend. Nunca configurar essa chave no frontend.
- `API_PUBLIC_ORIGIN` deve conter as origens reais do frontend separadas por virgula, por exemplo `https://nexor.com.br,https://www.nexor.com.br`.
- Enquanto o frontend continuar na Netlify, incluir a URL final da Netlify ou o dominio customizado usado por ela.

### Forma recomendada de deploy

Preferencia 1: deploy via GitHub se o hPanel permitir escolher a pasta raiz `project/backend/api`.

Preferencia 2: se o hPanel nao tiver campo de pasta raiz/root directory, publicar por ZIP contendo apenas o conteudo de `project/backend/api`, ou criar um repositorio separado somente para o backend.

Motivo: o repositorio atual e um monorepo. Se a Hostinger executar os comandos no root errado, ela encontrara `project/package.json`, que nao possui `build` e `start` do backend.

### Checklist apos deploy

- Abrir `https://api.SEUDOMINIO/health` e confirmar `{"status":"ok","service":"nexor-backend"}`.
- Abrir `https://api.SEUDOMINIO/docs` e confirmar Swagger carregando.
- Testar login/rota autenticada a partir do frontend.
- Conferir logs do hPanel sem expor tokens, CPF, dados de saude ou payloads sensiveis.
- Conferir no Supabase se nenhuma chave `service_role` foi usada no frontend.

## Comparacao registrada: Hostinger Apps Node.js Business vs VPS KVM

### Hospedagem de aplicacoes web em Node.js Business

- Produto gerenciado para publicar apps Node.js, frontend e sites.
- Mais simples para deploy: GitHub, ZIP ou deploy via IDE.
- A propria Hostinger cuida de servidor, seguranca, SSL, CDN, WAF e parte da escala.
- Suporta explicitamente Vite/React no frontend e Fastify no backend.
- Limite informado: 5 aplicacoes Node.js gerenciadas.
- Menos controle de baixo nivel: nao e o produto ideal quando precisar de root, Docker Compose livre, processos auxiliares ou configuracoes especificas do sistema operacional.

### VPS KVM Hostinger

- Servidor virtual isolado com acesso root completo.
- Mais controle sobre sistema operacional, Docker, Nginx, PM2, jobs, filas, Redis, observabilidade e configuracoes customizadas.
- Planos observados em 2026-05-14:
  - KVM 1: R$ 29,99/mes promocional, renovacao R$ 59,99/mes, 1 vCPU, 4 GB RAM, 50 GB NVMe, 4 TB bandwidth.
  - KVM 2: R$ 43,99/mes promocional, renovacao R$ 77,99/mes, 2 vCPU, 8 GB RAM, 100 GB NVMe, 8 TB bandwidth.
  - KVM 4: R$ 59,99/mes promocional, renovacao R$ 149,99/mes, 4 vCPU, 16 GB RAM, 200 GB NVMe, 16 TB bandwidth.
- Inclui backups semanais, firewall, velocidade de rede de 1 Gbps, terminal web, Docker Compose e acesso root.
- Mais responsabilidade: atualizacoes do sistema, hardening, processo Node, proxy reverso, SSL se nao usar painel, logs, monitoramento, deploy e rollback.

### Leitura inicial

Para o Nexor no estado atual, a Hospedagem de aplicacoes web Business parece suficiente e operacionalmente mais simples. A VPS KVM passa a fazer mais sentido se precisarmos de Docker, servicos auxiliares, controle total de runtime, workers persistentes, automacoes complexas, self-hosting de ferramentas ou tunings de servidor.
