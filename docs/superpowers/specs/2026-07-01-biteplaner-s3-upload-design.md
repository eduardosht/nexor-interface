# Spec de Integração S3 para Anexos de Produção Biteplaner

## Objetivo

Integrar o fluxo de anexo do escaneamento 3D intraoral da solicitação de produção do dentista com Amazon S3, substituindo a referência simulada atual por armazenamento privado, auditável e autorizado pelo backend.

O primeiro rollout não inclui GuardDuty Malware Protection for S3 nem outro scanner automático de malware. A arquitetura deve deixar o modelo preparado para uma verificação futura, mas a entrega inicial deve assumir controles compensatórios de autorização, bucket privado, validação de metadados e auditoria.

## Contexto Atual

O fluxo de produção do dentista já exige o anexo obrigatório de 1 arquivo de escaneamento 3D intraoral.

Arquivos relevantes:

- `nexor-interface/project/nexor/src/pages/painel/ProducaoDentista/ProductionRequestFields.tsx`
- `nexor-interface/project/nexor/src/features/demo/externalUploadGateway.ts`
- `nexor-backend/project/api/src/modules/biteplaner/production/production-request.application.ts`
- `nexor-backend/project/api/src/routes/order.routes.ts`
- `nexor-backend/project/api/src/security/upload-storage-policy.ts`
- `nexor-backend/project/api/tests/security/upload-storage-policy.test.ts`

Hoje o frontend cria uma referência `simulated-external-storage` para o arquivo e o backend aceita apenas essa referência simulada quando valida a solicitação de produção. A política LGPD já descreve o propósito `production_scan3d`, com bucket privado, ausência de URL pública, URLs assinadas, limite de 100 MB e formatos permitidos.

## Decisão de Arquitetura

O upload será feito diretamente do navegador para o S3 usando URL pré-assinada gerada pelo backend.

O backend continua sendo a autoridade de segurança:

- autentica o dentista;
- valida que o dentista pode atuar na ordem;
- valida propósito, extensão, MIME, tamanho e checksum informado;
- cria a chave privada do objeto no S3;
- gera a URL pré-assinada de upload com expiração curta;
- confirma o upload antes de persistir a referência no formulário;
- gera URLs pré-assinadas de download apenas para atores autorizados.

O frontend nunca recebe credenciais AWS e nunca escolhe livremente o caminho final do objeto. O banco nunca persiste `publicUrl`, `downloadUrl`, `signedUrl` ou qualquer URL pré-assinada.

## Fluxo de Upload

1. Dentista seleciona o arquivo no campo "Escaneamento 3D intraoral".
2. Frontend valida rapidamente extensão e tamanho para feedback imediato.
3. Frontend chama uma nova rota do backend para preparar o upload.
4. Backend valida ator, ordem, status da ordem, propósito `production_scan3d`, nome, tamanho, MIME e checksum quando disponível.
5. Backend cria uma chave privada, por exemplo `biteplaner/production-scans/{orderId}/{uploadId}/{safeFileName}`.
6. Backend retorna `uploadId`, `objectKey`, `uploadUrl`, headers obrigatórios e expiração.
7. Frontend envia o arquivo diretamente ao S3 via `PUT` usando a URL pré-assinada.
8. Frontend chama uma rota de confirmação do backend com `uploadId`, `objectKey`, nome original, tamanho, MIME e checksum.
9. Backend verifica a consistência da confirmação e salva uma referência privada como `scan3dFileRef`.
10. A solicitação de produção passa a enviar ao backend apenas metadados seguros e a referência privada confirmada.

## Fluxo de Download

O laboratório não recebe o `objectKey` como URL de acesso direto.

1. Laboratório abre a documentação de produção vinculada à ordem.
2. Frontend solicita ao backend uma URL de download temporária para o anexo.
3. Backend valida que o ator é o laboratório selecionado da ordem ou outro papel autorizado.
4. Backend gera URL pré-assinada de download com expiração curta.
5. Frontend abre ou baixa o arquivo usando essa URL temporária.

Como não haverá scanner automático no MVP, o arquivo terá `scanStatus = "not_scanned"`. A interface deve evitar linguagem de "arquivo verificado" ou "arquivo seguro"; o texto operacional deve indicar apenas que o arquivo foi recebido.

## Modelo de Dados

A referência persistida no payload da solicitação de produção deve ter formato controlado:

```json
{
  "id": "upload_...",
  "provider": "amazon-s3",
  "purpose": "production_scan3d",
  "bucket": "nome-logico-ou-alias-do-bucket",
  "objectKey": "biteplaner/production-scans/{orderId}/{uploadId}/scan.stl",
  "fileName": "scan.stl",
  "mimeType": "model/stl",
  "sizeBytes": 123456,
  "checksumSha256": "hex-ou-base64-quando-disponivel",
  "scanStatus": "not_scanned",
  "uploadedByProfileId": "profile-id",
  "uploadedAt": "2026-07-01T00:00:00.000Z"
}
```

Campos proibidos no payload:

- `publicUrl`
- `downloadUrl`
- `signedUrl`
- `url`
- `prescriptionFileName`
- `prescriptionFileRef`
- campos médicos ou clínicos não necessários ao laboratório

## Segurança e LGPD

Requisitos obrigatórios:

- bucket S3 privado com Block Public Access habilitado;
- criptografia em repouso no S3;
- credenciais AWS apenas no backend;
- IAM mínimo para o backend acessar somente o bucket/prefixos necessários;
- URLs pré-assinadas com expiração curta;
- chave S3 gerada pelo backend, nunca pelo frontend;
- validação backend de extensão, MIME, tamanho e vínculo com a ordem;
- rejeição de qualquer URL pública ou assinada enviada pelo cliente;
- auditoria de geração de upload, confirmação de upload e geração de download;
- não logar `uploadUrl`, `downloadUrl`, headers assinados ou dados sensíveis do arquivo;
- minimizar o payload visível ao laboratório aos campos operacionais necessários para produção.

O MVP assume o risco controlado de não realizar varredura automática de malware. Esse risco deve ficar documentado como decisão temporária, com caminho futuro para `scanStatus = "pending_scan" | "clean" | "blocked"` quando GuardDuty, ClamAV ou outro mecanismo for adotado.

## Configuração Esperada

Variáveis de ambiente esperadas no backend:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_UPLOAD_BUCKET`
- `S3_UPLOAD_PREFIX`
- `S3_PRESIGNED_UPLOAD_TTL_SECONDS`
- `S3_PRESIGNED_DOWNLOAD_TTL_SECONDS`

Em produção, os valores devem apontar para um bucket privado. Em desenvolvimento e testes, a camada de storage deve aceitar implementação fake/in-memory para não depender de AWS real.

## Rotas de API Propostas

### Preparar upload

`POST /v1/orders/:orderId/attachments/production-scan3d/upload-intent`

Entrada:

```json
{
  "fileName": "scan.stl",
  "mimeType": "model/stl",
  "sizeBytes": 123456,
  "checksumSha256": "opcional"
}
```

Saída:

```json
{
  "uploadId": "upload_...",
  "objectKey": "biteplaner/production-scans/{orderId}/{uploadId}/scan.stl",
  "uploadUrl": "https://...",
  "requiredHeaders": {
    "Content-Type": "model/stl"
  },
  "expiresAt": "2026-07-01T00:10:00.000Z"
}
```

### Confirmar upload

`POST /v1/orders/:orderId/attachments/production-scan3d/confirm`

Entrada:

```json
{
  "uploadId": "upload_...",
  "objectKey": "biteplaner/production-scans/{orderId}/{uploadId}/scan.stl",
  "fileName": "scan.stl",
  "mimeType": "model/stl",
  "sizeBytes": 123456,
  "checksumSha256": "opcional"
}
```

Saída:

```json
{
  "fileRef": {
    "id": "upload_...",
    "provider": "amazon-s3",
    "purpose": "production_scan3d",
    "objectKey": "biteplaner/production-scans/{orderId}/{uploadId}/scan.stl",
    "fileName": "scan.stl",
    "mimeType": "model/stl",
    "sizeBytes": 123456,
    "checksumSha256": "opcional",
    "scanStatus": "not_scanned",
    "uploadedAt": "2026-07-01T00:00:00.000Z"
  }
}
```

### Gerar download

`POST /v1/orders/:orderId/attachments/production-scan3d/download-url`

Entrada:

```json
{
  "fileRefId": "upload_..."
}
```

Saída:

```json
{
  "downloadUrl": "https://...",
  "expiresAt": "2026-07-01T00:05:00.000Z"
}
```

A URL é retornada apenas na resposta imediata e nunca deve ser persistida.

## Frontend

O componente de solicitação de produção deve substituir `uploadProductionRequestFile` simulado por um cliente real de anexos:

- validar formato e tamanho localmente;
- solicitar `uploadIntent`;
- executar `PUT` no S3;
- confirmar upload no backend;
- gravar `scan3dFileName` e `scan3dFileRef` no draft;
- exibir estados de carregamento, erro, sucesso e remoção;
- impedir envio da solicitação de produção sem `scan3dFileRef` confirmado;
- preservar os testes existentes de formatos aceitos e limite de 100 MB.

O demo/mock deve continuar funcionando sem AWS real, usando handlers que simulam as novas rotas.

## Backend

Criar uma camada de storage focada em anexos de produção:

- interface `ObjectStorageGateway`;
- implementação S3 com AWS SDK;
- implementação fake para testes;
- serviço de anexos que centraliza políticas de upload/download;
- validação de autorização usando os vínculos de ordem já existentes;
- auditoria para upload intent, upload confirmado e download gerado.

A validação da solicitação de produção deve passar a aceitar `provider = "amazon-s3"` e `purpose = "production_scan3d"`, mantendo rejeição explícita para URLs públicas e campos bloqueados.

## Testes

Cobertura mínima esperada:

- backend rejeita upload intent para ator sem vínculo com a ordem;
- backend rejeita extensão, MIME e tamanho inválidos;
- backend gera chave S3 sob prefixo permitido e sem confiar em caminho vindo do cliente;
- backend rejeita confirmação com `objectKey` fora do prefixo esperado;
- backend rejeita payload de produção com URL pública ou assinada;
- backend aceita `scan3dFileRef` Amazon S3 confirmado;
- laboratório só recebe URL de download quando autorizado;
- frontend exibe erro de upload e não permite envio sem confirmação;
- mocks da demo simulam upload intent, confirmação e download;
- auditoria LGPD de upload continua passando.

## Fora de Escopo

- GuardDuty Malware Protection for S3;
- ClamAV, Lambda ou qualquer scanner automático de malware;
- upload multipart para arquivos acima de 100 MB;
- múltiplos anexos por solicitação de produção;
- prescrição médica ou documentos clínicos adicionais;
- armazenamento público de arquivos;
- exposição direta de `objectKey` como URL acessível.

## Critérios de Aceite

- Dentista consegue anexar arquivo aceito no fluxo de solicitação de produção usando S3 privado.
- Solicitação de produção persiste somente referência privada e metadados seguros.
- Laboratório autorizado consegue baixar o arquivo por URL temporária gerada pelo backend.
- Atores não autorizados não conseguem preparar upload, confirmar upload nem gerar download.
- Payloads com URLs públicas, assinadas ou campos médicos bloqueados são rejeitados.
- Testes backend/frontend e auditoria LGPD relevante passam.
- Arquivos de texto alterados permanecem em UTF-8 sem BOM e sem mojibake.

