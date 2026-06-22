import{i as e}from"./preload-helper-xPQekRTU.js";import{l as t,o as n,r}from"./provider-U3c13AK_.js";import{t as i}from"./jsx-runtime-CaZkqeYb.js";import{j as a,t as o}from"./iframe-D7aB48g8.js";function s({children:e}){let{tokens:t}=r();return(0,c.jsx)(h,{$tokens:t,children:e})}var c,l,u,d,f,p,m,h,g;e((()=>{n(),o(),c=i(),l={title:`Components/Field`,component:a,tags:[`autodocs`],args:{label:`Nome`,placeholder:`Digite aqui`,hint:`Texto auxiliar do campo`,error:``}},u={args:{as:`input`}},d={args:{as:`input`,error:`Este campo e obrigatorio`}},f={render:e=>(0,c.jsxs)(a,{...e,as:`select`,label:`Assunto`,hint:`Selecione uma opcao`,children:[(0,c.jsx)(`option`,{children:`Produto`}),(0,c.jsx)(`option`,{children:`Parceria`}),(0,c.jsx)(`option`,{children:`Suporte`})]})},p={args:{as:`textarea`,label:`Mensagem`,placeholder:`Escreva a sua mensagem`}},m={render:()=>(0,c.jsxs)(s,{children:[(0,c.jsx)(a,{as:`input`,label:`Nome`,placeholder:`Seu nome`}),(0,c.jsx)(a,{as:`input`,label:`E-mail`,placeholder:`voce@empresa.com`}),(0,c.jsxs)(a,{as:`select`,label:`Tipo`,children:[(0,c.jsx)(`option`,{children:`Cliente`}),(0,c.jsx)(`option`,{children:`Parceiro`})]}),(0,c.jsx)(a,{as:`textarea`,label:`Observacoes`,placeholder:`Detalhes adicionais`})]})},h=t.div`
  display: grid;
  gap: ${({$tokens:e})=>e.spacing.form.fieldGap};
  width: min(420px, 100%);
`,u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    as: 'input'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    as: 'input',
    error: 'Este campo e obrigatorio'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => <Field {...args} as="select" label="Assunto" hint="Selecione uma opcao">\r
      <option>Produto</option>\r
      <option>Parceria</option>\r
      <option>Suporte</option>\r
    </Field>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    as: 'textarea',
    label: 'Mensagem',
    placeholder: 'Escreva a sua mensagem'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Stack>\r
      <Field as="input" label="Nome" placeholder="Seu nome" />\r
      <Field as="input" label="E-mail" placeholder="voce@empresa.com" />\r
      <Field as="select" label="Tipo">\r
        <option>Cliente</option>\r
        <option>Parceiro</option>\r
      </Field>\r
      <Field as="textarea" label="Observacoes" placeholder="Detalhes adicionais" />\r
    </Stack>
}`,...m.parameters?.docs?.source}}},g=[`Input`,`WithError`,`Select`,`Textarea`,`Group`]}))();export{m as Group,u as Input,f as Select,p as Textarea,d as WithError,g as __namedExportsOrder,l as default};