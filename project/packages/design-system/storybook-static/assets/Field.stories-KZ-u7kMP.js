import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{u as k,a as P}from"./provider-CsyxAWo3.js";import"./Button-Dc7LZi83.js";import{F as r}from"./Field-CJuwh9w6.js";import"./Surface-CDLUlGBu.js";import"./Badge-DeAuXsin.js";import"./Typography-BXUXbHWb.js";import"./index-DK_B2187.js";import"./_commonjsHelpers-CqkleIqs.js";const _={title:"Components/Field",component:r,tags:["autodocs"],args:{label:"Nome",placeholder:"Digite aqui",hint:"Texto auxiliar do campo",error:""}},o={args:{as:"input"}},s={args:{as:"input",error:"Este campo e obrigatorio"}},t={render:a=>e.jsxs(r,{...a,as:"select",label:"Assunto",hint:"Selecione uma opcao",children:[e.jsx("option",{children:"Produto"}),e.jsx("option",{children:"Parceria"}),e.jsx("option",{children:"Suporte"})]})},n={args:{as:"textarea",label:"Mensagem",placeholder:"Escreva a sua mensagem"}},i={render:()=>e.jsxs(T,{children:[e.jsx(r,{as:"input",label:"Nome",placeholder:"Seu nome"}),e.jsx(r,{as:"input",label:"E-mail",placeholder:"voce@empresa.com"}),e.jsxs(r,{as:"select",label:"Tipo",children:[e.jsx("option",{children:"Cliente"}),e.jsx("option",{children:"Parceiro"})]}),e.jsx(r,{as:"textarea",label:"Observacoes",placeholder:"Detalhes adicionais"})]})};function T({children:a}){const{tokens:v}=k();return e.jsx(D,{$tokens:v,children:a})}const D=P.div`
  display: grid;
  gap: ${({$tokens:a})=>a.spacing.form.fieldGap};
  width: min(420px, 100%);
`;var c,p,l;o.parameters={...o.parameters,docs:{...(c=o.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    as: 'input'
  }
}`,...(l=(p=o.parameters)==null?void 0:p.docs)==null?void 0:l.source}}};var m,d,u;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    as: 'input',
    error: 'Este campo e obrigatorio'
  }
}`,...(u=(d=s.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var g,h,x;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: args => <Field {...args} as="select" label="Assunto" hint="Selecione uma opcao">\r
      <option>Produto</option>\r
      <option>Parceria</option>\r
      <option>Suporte</option>\r
    </Field>
}`,...(x=(h=t.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};var S,b,j;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    as: 'textarea',
    label: 'Mensagem',
    placeholder: 'Escreva a sua mensagem'
  }
}`,...(j=(b=n.parameters)==null?void 0:b.docs)==null?void 0:j.source}}};var E,F,f;i.parameters={...i.parameters,docs:{...(E=i.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <Stack>\r
      <Field as="input" label="Nome" placeholder="Seu nome" />\r
      <Field as="input" label="E-mail" placeholder="voce@empresa.com" />\r
      <Field as="select" label="Tipo">\r
        <option>Cliente</option>\r
        <option>Parceiro</option>\r
      </Field>\r
      <Field as="textarea" label="Observacoes" placeholder="Detalhes adicionais" />\r
    </Stack>
}`,...(f=(F=i.parameters)==null?void 0:F.docs)==null?void 0:f.source}}};const $=["Input","WithError","Select","Textarea","Group"];export{i as Group,o as Input,t as Select,n as Textarea,s as WithError,$ as __namedExportsOrder,_ as default};
