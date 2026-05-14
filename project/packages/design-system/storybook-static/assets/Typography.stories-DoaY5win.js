import{j as a}from"./jsx-runtime-D_zvdyIk.js";import{a as c}from"./provider-CsyxAWo3.js";import{S as L}from"./Surface-CDLUlGBu.js";import{T as r}from"./Typography-BXUXbHWb.js";import"./index-DK_B2187.js";import"./_commonjsHelpers-CqkleIqs.js";const t="A interface precisa ser clara, confiante e legivel em qualquer ponto de contato com a marca.",C=["heading-1","heading-2","heading-3","heading-4","heading-5","heading-6"],M={title:"Components/Typography",component:r,tags:["autodocs"],args:{variant:"paragraph-md",tone:"default",children:t}},o={},s={render:()=>a.jsx(f,{children:C.map(d=>a.jsxs(e,{children:[a.jsx(n,{children:d}),a.jsx(r,{variant:d,children:"Nexor design system heading"})]},d))})},p={render:()=>a.jsxs(f,{children:[a.jsxs(e,{children:[a.jsx(n,{children:"paragraph-lg"}),a.jsx(r,{variant:"paragraph-lg",children:t})]}),a.jsxs(e,{children:[a.jsx(n,{children:"paragraph-md"}),a.jsx(r,{variant:"paragraph-md",children:t})]}),a.jsxs(e,{children:[a.jsx(n,{children:"paragraph-sm"}),a.jsx(r,{variant:"paragraph-sm",children:t})]}),a.jsxs(e,{children:[a.jsx(n,{children:"description-lg"}),a.jsx(r,{variant:"description-lg",tone:"muted",children:"Copy de apoio para explicar contexto, beneficios ou proximos passos."})]}),a.jsxs(e,{children:[a.jsx(n,{children:"description-md"}),a.jsx(r,{variant:"description-md",tone:"muted",children:"Texto curto de suporte com contraste mais suave e leitura fluida."})]}),a.jsxs(e,{children:[a.jsx(n,{children:"caption-md"}),a.jsx(r,{variant:"caption-md",tone:"accent",children:"System label"})]}),a.jsxs(e,{children:[a.jsx(n,{children:"caption-sm"}),a.jsx(r,{variant:"caption-sm",tone:"soft",children:"Metadata"})]})]})},i={render:()=>a.jsxs(k,{children:[a.jsx(r,{variant:"caption-md",tone:"accent",children:"Performance System"}),a.jsx(r,{variant:"heading-3",children:"Componentes com hierarquia tipografica consistente"}),a.jsx(r,{variant:"description-lg",tone:"muted",children:"Headlines, paragrafos, descritions e legendas agora compartilham uma escala unica por marca dentro do design system."}),a.jsx(r,{variant:"paragraph-md",children:"Isso facilita a composicao de landing pages, paineis e documentacao sem espalhar tamanhos arbitrarios pelo codigo."})]})},f=c.div`
  display: grid;
  gap: 18px;
  width: min(900px, 100%);
`,e=c.div`
  display: grid;
  gap: 8px;
  padding: 18px 20px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.6);
`,n=c.span`
  font-family: monospace;
  font-size: 12px;
  opacity: 0.7;
`,k=c(L)`
  display: grid;
  gap: 12px;
  width: min(640px, 100%);
`;var m,l,g;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:"{}",...(g=(l=o.parameters)==null?void 0:l.docs)==null?void 0:g.source}}};var h,y,x;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <Stack>\r
      {headingVariants.map(variant => <Sample key={variant}>\r
          <Label>{variant}</Label>\r
          <Typography variant={variant}>Nexor design system heading</Typography>\r
        </Sample>)}\r
    </Stack>
}`,...(x=(y=s.parameters)==null?void 0:y.docs)==null?void 0:x.source}}};var u,S,j;p.parameters={...p.parameters,docs:{...(u=p.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <Stack>\r
      <Sample>\r
        <Label>paragraph-lg</Label>\r
        <Typography variant="paragraph-lg">{sampleText}</Typography>\r
      </Sample>\r
      <Sample>\r
        <Label>paragraph-md</Label>\r
        <Typography variant="paragraph-md">{sampleText}</Typography>\r
      </Sample>\r
      <Sample>\r
        <Label>paragraph-sm</Label>\r
        <Typography variant="paragraph-sm">{sampleText}</Typography>\r
      </Sample>\r
      <Sample>\r
        <Label>description-lg</Label>\r
        <Typography variant="description-lg" tone="muted">\r
          Copy de apoio para explicar contexto, beneficios ou proximos passos.\r
        </Typography>\r
      </Sample>\r
      <Sample>\r
        <Label>description-md</Label>\r
        <Typography variant="description-md" tone="muted">\r
          Texto curto de suporte com contraste mais suave e leitura fluida.\r
        </Typography>\r
      </Sample>\r
      <Sample>\r
        <Label>caption-md</Label>\r
        <Typography variant="caption-md" tone="accent">\r
          System label\r
        </Typography>\r
      </Sample>\r
      <Sample>\r
        <Label>caption-sm</Label>\r
        <Typography variant="caption-sm" tone="soft">\r
          Metadata\r
        </Typography>\r
      </Sample>\r
    </Stack>
}`,...(j=(S=p.parameters)==null?void 0:S.docs)==null?void 0:j.source}}};var T,v,b;i.parameters={...i.parameters,docs:{...(T=i.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <Card>\r
      <Typography variant="caption-md" tone="accent">\r
        Performance System\r
      </Typography>\r
      <Typography variant="heading-3">Componentes com hierarquia tipografica consistente</Typography>\r
      <Typography variant="description-lg" tone="muted">\r
        Headlines, paragrafos, descritions e legendas agora compartilham uma escala unica por\r
        marca dentro do design system.\r
      </Typography>\r
      <Typography variant="paragraph-md">\r
        Isso facilita a composicao de landing pages, paineis e documentacao sem espalhar tamanhos\r
        arbitrarios pelo codigo.\r
      </Typography>\r
    </Card>
}`,...(b=(v=i.parameters)==null?void 0:v.docs)==null?void 0:b.source}}};const N=["Playground","Headings","ContentStyles","InContext"];export{p as ContentStyles,s as Headings,i as InContext,o as Playground,N as __namedExportsOrder,M as default};
