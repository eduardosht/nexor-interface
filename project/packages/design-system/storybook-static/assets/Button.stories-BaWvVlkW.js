import{j as r}from"./jsx-runtime-D_zvdyIk.js";import{a as c}from"./provider-CsyxAWo3.js";import{B as n}from"./Button-Dc7LZi83.js";import"./index-DK_B2187.js";import"./_commonjsHelpers-CqkleIqs.js";const E={title:"Components/Button",component:n,tags:["autodocs"],args:{children:"Primary action",variant:"primary",tone:"default",size:"md",fullWidth:!1,loading:!1,disabled:!1},argTypes:{onClick:{action:"clicked"}}},t={},o={render:a=>r.jsxs(e,{children:[r.jsx(n,{...a,variant:"primary",children:"Primary action"}),r.jsx(n,{...a,variant:"secondary",children:"Secondary action"}),r.jsx(n,{...a,variant:"ghost",children:"Ghost action"})]})},s={render:a=>r.jsxs(e,{children:[r.jsx(n,{...a,size:"sm",children:"Small"}),r.jsx(n,{...a,size:"md",children:"Medium"}),r.jsx(n,{...a,size:"lg",children:"Large"})]})},i={render:a=>r.jsxs(w,{children:[r.jsxs(e,{children:[r.jsx(n,{...a,variant:"primary",children:"Primary default"}),r.jsx(n,{...a,variant:"primary",loading:!0,children:"Primary loading"}),r.jsx(n,{...a,variant:"primary",disabled:!0,children:"Primary disabled"})]}),r.jsxs(e,{children:[r.jsx(n,{...a,variant:"secondary",children:"Secondary default"}),r.jsx(n,{...a,variant:"secondary",loading:!0,children:"Secondary loading"}),r.jsx(n,{...a,variant:"secondary",disabled:!0,children:"Secondary disabled"})]}),r.jsxs(e,{children:[r.jsx(n,{...a,variant:"ghost",children:"Ghost default"}),r.jsx(n,{...a,variant:"ghost",loading:!0,children:"Ghost loading"}),r.jsx(n,{...a,variant:"ghost",disabled:!0,children:"Ghost disabled"})]})]})},d={render:a=>r.jsx(R,{children:r.jsxs(e,{children:[r.jsx(n,{...a,tone:"inverse",variant:"primary",children:"Primary inverse"}),r.jsx(n,{...a,tone:"inverse",variant:"secondary",children:"Secondary inverse"}),r.jsx(n,{...a,tone:"inverse",variant:"ghost",children:"Ghost inverse"})]})})},e=c.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`,w=c.div`
  display: grid;
  gap: 12px;
`,R=c.div`
  background: linear-gradient(160deg, #0d1a0f 0%, #132719 100%);
  padding: 24px;
  border-radius: 16px;
`;var l,u,m;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:"{}",...(m=(u=t.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var g,p,h;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: args => <Row>\r
      <Button {...args} variant="primary">Primary action</Button>\r
      <Button {...args} variant="secondary">Secondary action</Button>\r
      <Button {...args} variant="ghost">Ghost action</Button>\r
    </Row>
}`,...(h=(p=o.parameters)==null?void 0:p.docs)==null?void 0:h.source}}};var v,y,B;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: args => <Row>\r
      <Button {...args} size="sm">Small</Button>\r
      <Button {...args} size="md">Medium</Button>\r
      <Button {...args} size="lg">Large</Button>\r
    </Row>
}`,...(B=(y=s.parameters)==null?void 0:y.docs)==null?void 0:B.source}}};var x,j,S;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: args => <Column>\r
      <Row>\r
        <Button {...args} variant="primary">Primary default</Button>\r
        <Button {...args} variant="primary" loading>Primary loading</Button>\r
        <Button {...args} variant="primary" disabled>Primary disabled</Button>\r
      </Row>\r
      <Row>\r
        <Button {...args} variant="secondary">Secondary default</Button>\r
        <Button {...args} variant="secondary" loading>Secondary loading</Button>\r
        <Button {...args} variant="secondary" disabled>Secondary disabled</Button>\r
      </Row>\r
      <Row>\r
        <Button {...args} variant="ghost">Ghost default</Button>\r
        <Button {...args} variant="ghost" loading>Ghost loading</Button>\r
        <Button {...args} variant="ghost" disabled>Ghost disabled</Button>\r
      </Row>\r
    </Column>
}`,...(S=(j=i.parameters)==null?void 0:j.docs)==null?void 0:S.source}}};var f,P,b;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: args => <DarkPanel>\r
      <Row>\r
        <Button {...args} tone="inverse" variant="primary">Primary inverse</Button>\r
        <Button {...args} tone="inverse" variant="secondary">Secondary inverse</Button>\r
        <Button {...args} tone="inverse" variant="ghost">Ghost inverse</Button>\r
      </Row>\r
    </DarkPanel>
}`,...(b=(P=d.parameters)==null?void 0:P.docs)==null?void 0:b.source}}};const I=["Playground","Variants","Sizes","States","Inverse"];export{d as Inverse,t as Playground,s as Sizes,i as States,o as Variants,I as __namedExportsOrder,E as default};
