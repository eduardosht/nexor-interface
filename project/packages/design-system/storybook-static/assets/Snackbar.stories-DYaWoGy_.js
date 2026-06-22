import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-CaZkqeYb.js";import{n,t as r}from"./Button-MmDnPfJI.js";import{i,n as a,r as o}from"./iframe-D7aB48g8.js";var s,c,l,u,d,f,p;e((()=>{n(),i(),s=t(),c={title:`Components/Snackbar`,component:a,args:{title:`Rascunho salvo`,message:`As alteracoes foram persistidas e ja podem ser retomadas depois.`}},l={args:{tone:`success`}},u={args:{tone:`warning`,title:`Pendencia clinica`,message:`Ainda falta anexar a prescricao assinada para concluir o envio.`}},d={args:{tone:`error`,title:`Falha ao salvar`,message:`Nao foi possivel persistir o formulario agora. Tente novamente.`}},f={render:()=>(0,s.jsxs)(o,{children:[(0,s.jsx)(a,{tone:`success`,title:`Pedido encaminhado`,message:`A ordem BP-DEMO-004 foi enviada ao laboratorio.`}),(0,s.jsx)(a,{tone:`warning`,title:`Aguardando confirmacao`,message:`O laboratorio ainda nao confirmou o recebimento da ordem.`,action:(0,s.jsx)(r,{variant:`ghost`,size:`sm`,children:`Abrir detalhes`})})]})},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    title: 'Pendencia clinica',
    message: 'Ainda falta anexar a prescricao assinada para concluir o envio.'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'error',
    title: 'Falha ao salvar',
    message: 'Nao foi possivel persistir o formulario agora. Tente novamente.'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <SnackbarStack>\r
      <Snackbar tone="success" title="Pedido encaminhado" message="A ordem BP-DEMO-004 foi enviada ao laboratorio." />\r
      <Snackbar tone="warning" title="Aguardando confirmacao" message="O laboratorio ainda nao confirmou o recebimento da ordem." action={<Button variant="ghost" size="sm">Abrir detalhes</Button>} />\r
    </SnackbarStack>
}`,...f.parameters?.docs?.source}}},p=[`Success`,`Warning`,`Error`,`Stacked`]}))();export{d as Error,f as Stacked,l as Success,u as Warning,p as __namedExportsOrder,c as default};