# Dentist Referral Share Design

## Context

Na etapa de consulta inicial do Biteplaner, o usuario escolhe uma clinica licenciada para prosseguir com a ordem atual. O contexto de negocio ja permite indicar um dentista de preferencia ainda nao licenciado, mas a experiencia precisa deixar claro que essa indicacao nao substitui a escolha de uma clinica licenciada.

## Design

A tela de consulta inicial tera um bloco secundario para o usuario indicar o processo de licenciamento ao dentista de preferencia. O bloco fica disponivel quando a busca por clinicas licenciadas esta liberada, junto da lista/mapa de consultorios.

O bloco mostra:

- uma explicacao curta de que a mensagem sera enviada em nome do cliente pelo canal escolhido;
- uma mensagem pronta falando brevemente do Biteplaner e do licenciamento para dentistas;
- acoes para enviar por WhatsApp e por e-mail;
- um aviso explicito de que, para continuar a ordem atual, o usuario ainda precisa selecionar uma clinica ja licenciada, porque o licenciamento de um novo dentista pode demorar.

Os links de compartilhamento usam a pagina institucional `/parceiros#dentistas`. A pagina `/parceiros` passa a expor ancoras estaveis para suas trilhas: `#dentistas`, `#parceiros` e `#laboratorios`.

## Business Rules

- A indicacao e uma acao opcional do cliente.
- A mensagem e disparada pelo cliente usando WhatsApp ou e-mail; a plataforma nao persiste nem envia diretamente essa indicacao neste incremento.
- A indicacao nao torna o dentista selecionavel na ordem atual.
- A continuidade da ordem atual continua exigindo a escolha de uma clinica/dentista ja licenciado.
- O link compartilhado deve levar o dentista diretamente ao conteudo de dentistas na pagina de parceiros.

## Testing

- Testar que `/parceiros` renderiza a ancora `dentistas` na trilha de dentistas.
- Testar que a tela de consulta inicial exibe a feature de indicacao apos o intake estar completo.
- Testar que os links de WhatsApp e e-mail incluem a URL `/parceiros#dentistas`.
- Testar que a copia informa que a ordem atual exige clinica ja licenciada.
