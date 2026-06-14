import{i as e}from"./preload-helper-xPQekRTU.js";import{l as t,o as n}from"./provider-U3c13AK_.js";import{t as r}from"./jsx-runtime-CaZkqeYb.js";import{n as i,t as a}from"./Button-MmDnPfJI.js";var o,s,c,l,u,d,f,p,m,h,g;e((()=>{n(),i(),o=r(),s={title:`Components/Button`,component:a,tags:[`autodocs`],args:{children:`Primary action`,variant:`primary`,tone:`default`,size:`md`,fullWidth:!1,loading:!1,disabled:!1},argTypes:{onClick:{action:`clicked`}}},c={},l={render:e=>(0,o.jsxs)(p,{children:[(0,o.jsx)(a,{...e,variant:`primary`,children:`Primary action`}),(0,o.jsx)(a,{...e,variant:`secondary`,children:`Secondary action`}),(0,o.jsx)(a,{...e,variant:`ghost`,children:`Ghost action`})]})},u={render:e=>(0,o.jsxs)(p,{children:[(0,o.jsx)(a,{...e,size:`sm`,children:`Small`}),(0,o.jsx)(a,{...e,size:`md`,children:`Medium`}),(0,o.jsx)(a,{...e,size:`lg`,children:`Large`})]})},d={render:e=>(0,o.jsxs)(m,{children:[(0,o.jsxs)(p,{children:[(0,o.jsx)(a,{...e,variant:`primary`,children:`Primary default`}),(0,o.jsx)(a,{...e,variant:`primary`,loading:!0,children:`Primary loading`}),(0,o.jsx)(a,{...e,variant:`primary`,disabled:!0,children:`Primary disabled`})]}),(0,o.jsxs)(p,{children:[(0,o.jsx)(a,{...e,variant:`secondary`,children:`Secondary default`}),(0,o.jsx)(a,{...e,variant:`secondary`,loading:!0,children:`Secondary loading`}),(0,o.jsx)(a,{...e,variant:`secondary`,disabled:!0,children:`Secondary disabled`})]}),(0,o.jsxs)(p,{children:[(0,o.jsx)(a,{...e,variant:`ghost`,children:`Ghost default`}),(0,o.jsx)(a,{...e,variant:`ghost`,loading:!0,children:`Ghost loading`}),(0,o.jsx)(a,{...e,variant:`ghost`,disabled:!0,children:`Ghost disabled`})]})]})},f={render:e=>(0,o.jsx)(h,{children:(0,o.jsxs)(p,{children:[(0,o.jsx)(a,{...e,tone:`inverse`,variant:`primary`,children:`Primary inverse`}),(0,o.jsx)(a,{...e,tone:`inverse`,variant:`secondary`,children:`Secondary inverse`}),(0,o.jsx)(a,{...e,tone:`inverse`,variant:`ghost`,children:`Ghost inverse`})]})})},p=t.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`,m=t.div`
  display: grid;
  gap: 12px;
`,h=t.div`
  background: linear-gradient(160deg, #0d1a0f 0%, #132719 100%);
  padding: 24px;
  border-radius: 16px;
`,c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => <Row>\r
      <Button {...args} variant="primary">Primary action</Button>\r
      <Button {...args} variant="secondary">Secondary action</Button>\r
      <Button {...args} variant="ghost">Ghost action</Button>\r
    </Row>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: args => <Row>\r
      <Button {...args} size="sm">Small</Button>\r
      <Button {...args} size="md">Medium</Button>\r
      <Button {...args} size="lg">Large</Button>\r
    </Row>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => <DarkPanel>\r
      <Row>\r
        <Button {...args} tone="inverse" variant="primary">Primary inverse</Button>\r
        <Button {...args} tone="inverse" variant="secondary">Secondary inverse</Button>\r
        <Button {...args} tone="inverse" variant="ghost">Ghost inverse</Button>\r
      </Row>\r
    </DarkPanel>
}`,...f.parameters?.docs?.source}}},g=[`Playground`,`Variants`,`Sizes`,`States`,`Inverse`]}))();export{f as Inverse,c as Playground,u as Sizes,d as States,l as Variants,g as __namedExportsOrder,s as default};