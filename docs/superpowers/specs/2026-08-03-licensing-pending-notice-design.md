# Aviso de Licenciamento Pendente

## Objetivo

Tornar mais evidente, na home do painel (`/painel/home`), quando um card de licenciamento estiver pendente de análise.

## Comportamento

- Cards com status `pending` continuam exibindo o selo `Pendente`.
- O card pendente exibirá um aviso interno destacado, abaixo da descrição, com ícone de relógio.
- O aviso informará: `Cadastro enviado. Aguarde a Nexor verificar seus dados para seguir para aprovação.`
- O card continuará sem botão de nova solicitação enquanto estiver pendente.
- Cards com outros status permanecerão sem o aviso.

## Implementação

A `PainelHome` renderizará o aviso condicionalmente a partir de `isPending`. O estilo será adicionado ao conjunto de estilos existente da página, usando contraste e borda de atenção sem alterar o layout dos cards ou a lógica de navegação.

## Testes

Adicionar um teste que renderize um licenciamento de dentista pendente e confirme o texto do aviso dentro do card, mantendo as verificações atuais de bloqueio e ausência de ação duplicada.