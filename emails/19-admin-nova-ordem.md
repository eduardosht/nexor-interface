# E-mail: Nova ordem criada — admin

**Destinatário:** Admin / Operação interna  
**Gatilho:** Usuário conclui cadastro e inicia pedido (pagamento registrado)  
**Status da ordem:** Aguardando pagamento

---

## Assunto

[Admin] Nova ordem registrada — {{nome_cliente}}

---

## Corpo

Uma nova ordem foi registrada na plataforma e aguarda confirmação de pagamento.

**Detalhes**

- **Cliente:** {{nome_cliente}}
- **E-mail:** {{email_cliente}}
- **Número da ordem:** {{numero_ordem}}
- **Origem:** {{parceiro_indicador, se houver}}
- **Valor:** R$ {{valor_ordem}}

Acesse o painel administrativo para confirmar o pagamento e liberar a próxima etapa da jornada.

**[Abrir ordem no admin]**
{{link_admin_ordem}}

---

Biteplaner — painel administrativo
