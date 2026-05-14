import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{a as o}from"./provider-CsyxAWo3.js";import{S as t}from"./Surface-CDLUlGBu.js";import"./index-DK_B2187.js";import"./_commonjsHelpers-CqkleIqs.js";const I={title:"Components/Surface",component:t,tags:["autodocs"],args:{tone:"default",padding:"md",interactive:!1}},n={render:r=>e.jsxs(t,{...r,children:[e.jsx(S,{children:"Surface title"}),e.jsx(j,{children:"Reusable container for cards, panels and grouped content."})]})},a={render:r=>e.jsxs(h,{children:[e.jsx(t,{...r,tone:"default",children:e.jsx(c,{title:"Default"})}),e.jsx(t,{...r,tone:"subtle",children:e.jsx(c,{title:"Subtle"})}),e.jsx(t,{...r,tone:"accent",children:e.jsx(c,{title:"Accent"})})]})},s={render:r=>e.jsx(t,{...r,interactive:!0,children:e.jsx(c,{title:"Interactive surface"})})};function c({title:r}){return e.jsxs(e.Fragment,{children:[e.jsx(S,{children:r}),e.jsx(j,{children:"Use this family for cards, summaries, panels and grouped interface blocks."})]})}const h=o.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  width: min(960px, 100%);
`,S=o.h3`
  margin: 0 0 8px;
  font-size: 16px;
`,j=o.p`
  margin: 0;
  line-height: 1.6;
  font-size: 14px;
`;var i,d,l;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <Surface {...args}>\r
      <Title>Surface title</Title>\r
      <Text>Reusable container for cards, panels and grouped content.</Text>\r
    </Surface>
}`,...(l=(d=n.parameters)==null?void 0:d.docs)==null?void 0:l.source}}};var u,p,m;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: args => <Grid>\r
      <Surface {...args} tone="default"><CardContent title="Default" /></Surface>\r
      <Surface {...args} tone="subtle"><CardContent title="Subtle" /></Surface>\r
      <Surface {...args} tone="accent"><CardContent title="Accent" /></Surface>\r
    </Grid>
}`,...(m=(p=a.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var f,x,g;s.parameters={...s.parameters,docs:{...(f=s.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: args => <Surface {...args} interactive>\r
      <CardContent title="Interactive surface" />\r
    </Surface>
}`,...(g=(x=s.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};const G=["Playground","Tones","Interactive"];export{s as Interactive,n as Playground,a as Tones,G as __namedExportsOrder,I as default};
