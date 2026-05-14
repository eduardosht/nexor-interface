import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{useMDXComponents as s}from"./index-BLAA6swr.js";import{M as o}from"./index-BUPKPwJ2.js";import"./index-DK_B2187.js";import"./_commonjsHelpers-CqkleIqs.js";import"./iframe-Bsi3cENQ.js";import"./index-B2MllvBW.js";import"./index-DgH-xKnr.js";import"./index-DrFu-skq.js";function i(r){const n={code:"code",h1:"h1",h2:"h2",li:"li",p:"p",ul:"ul",...s(),...r.components};return e.jsxs(e.Fragment,{children:[e.jsx(o,{title:"Introduction/Overview"}),`
`,e.jsx(n.h1,{id:"nexor-design-system",children:"Nexor Design System"}),`
`,e.jsx(n.p,{children:"Este Storybook e a documentacao viva da lib compartilhada."}),`
`,e.jsx(n.h2,{id:"como-usar",children:"Como usar"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["componentes vivem em ",e.jsx(n.code,{children:"project/packages/design-system/src"})]}),`
`,e.jsxs(n.li,{children:["apps consomem via ",e.jsx(n.code,{children:"@nexor/design-system"})]}),`
`,e.jsxs(n.li,{children:["a marca ativa deve ser inicializada uma vez via ",e.jsx(n.code,{children:"initDesignSystem({ brand })"})]}),`
`,e.jsxs(n.li,{children:["componentes leem a marca pelo contexto e nao recebem ",e.jsx(n.code,{children:"brand"})," como prop"]}),`
`]}),`
`,e.jsx(n.h2,{id:"objetivo",children:"Objetivo"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"documentar o comportamento real dos componentes"}),`
`,e.jsx(n.li,{children:"reduzir variacoes visuais fora da lib"}),`
`,e.jsx(n.li,{children:"acelerar a reutilizacao entre Nexor e Biteplaner"}),`
`,e.jsx(n.li,{children:"preparar a futura evolucao para uma biblioteca multimarca mais robusta"}),`
`]}),`
`,e.jsx(n.h2,{id:"regras-atuais",children:"Regras atuais"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"Button"}),": apenas ",e.jsx(n.code,{children:"primary"}),", ",e.jsx(n.code,{children:"secondary"})," e ",e.jsx(n.code,{children:"ghost"})]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"Field"}),": um unico componente para ",e.jsx(n.code,{children:"input"}),", ",e.jsx(n.code,{children:"select"})," e ",e.jsx(n.code,{children:"textarea"})]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"Surface"}),": base unica para cards e paineis"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"Badge"}),": base unica para chips e rotulos pequenos"]}),`
`]}),`
`,e.jsx(n.h2,{id:"toolbar-de-marca",children:"Toolbar de marca"}),`
`,e.jsxs(n.p,{children:["Use o seletor ",e.jsx(n.code,{children:"Brand"})," na toolbar do Storybook para alternar entre:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.code,{children:"Biteplaner"})}),`
`,e.jsx(n.li,{children:e.jsx(n.code,{children:"Nexor"})}),`
`]}),`
`,e.jsx(n.p,{children:"Isso permite validar o mesmo componente com tokens e atmosfera diferentes sem duplicar stories."})]})}function p(r={}){const{wrapper:n}={...s(),...r.components};return n?e.jsx(n,{...r,children:e.jsx(i,{...r})}):i(r)}export{p as default};
