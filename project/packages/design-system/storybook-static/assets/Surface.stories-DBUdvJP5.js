import{i as e}from"./preload-helper-xPQekRTU.js";import{l as t,o as n}from"./provider-U3c13AK_.js";import{t as r}from"./jsx-runtime-CaZkqeYb.js";import{C as i,w as a}from"./iframe-D7aB48g8.js";function o({title:e}){return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(p,{children:e}),(0,s.jsx)(m,{children:`Use this family for cards, summaries, panels and grouped interface blocks.`})]})}var s,c,l,u,d,f,p,m,h;e((()=>{n(),a(),s=r(),c={title:`Components/Surface`,component:i,tags:[`autodocs`],args:{tone:`default`,padding:`md`,interactive:!1}},l={render:e=>(0,s.jsxs)(i,{...e,children:[(0,s.jsx)(p,{children:`Surface title`}),(0,s.jsx)(m,{children:`Reusable container for cards, panels and grouped content.`})]})},u={render:e=>(0,s.jsxs)(f,{children:[(0,s.jsx)(i,{...e,tone:`default`,children:(0,s.jsx)(o,{title:`Default`})}),(0,s.jsx)(i,{...e,tone:`subtle`,children:(0,s.jsx)(o,{title:`Subtle`})}),(0,s.jsx)(i,{...e,tone:`accent`,children:(0,s.jsx)(o,{title:`Accent`})})]})},d={render:e=>(0,s.jsx)(i,{...e,interactive:!0,children:(0,s.jsx)(o,{title:`Interactive surface`})})},f=t.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  width: min(960px, 100%);
`,p=t.h3`
  margin: 0 0 8px;
  font-size: 16px;
`,m=t.p`
  margin: 0;
  line-height: 1.6;
  font-size: 14px;
`,l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => <Surface {...args}>\r
      <Title>Surface title</Title>\r
      <Text>Reusable container for cards, panels and grouped content.</Text>\r
    </Surface>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: args => <Grid>\r
      <Surface {...args} tone="default"><CardContent title="Default" /></Surface>\r
      <Surface {...args} tone="subtle"><CardContent title="Subtle" /></Surface>\r
      <Surface {...args} tone="accent"><CardContent title="Accent" /></Surface>\r
    </Grid>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => <Surface {...args} interactive>\r
      <CardContent title="Interactive surface" />\r
    </Surface>
}`,...d.parameters?.docs?.source}}},h=[`Playground`,`Tones`,`Interactive`]}))();export{d as Interactive,l as Playground,u as Tones,h as __namedExportsOrder,c as default};