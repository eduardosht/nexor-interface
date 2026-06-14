import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-CaZkqeYb.js";import{a as n,h as r,o as i,v as a}from"./blocks-DLBgbvkV.js";var o=e((()=>{r()}));function s(e){let t={code:`code`,h1:`h1`,h2:`h2`,li:`li`,p:`p`,ul:`ul`,...a(),...e.components};return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(n,{title:`Introduction/Overview`}),`
`,(0,l.jsx)(t.h1,{id:`nexor-design-system`,children:`Nexor Design System`}),`
`,(0,l.jsx)(t.p,{children:`Este Storybook e a documentacao viva da lib compartilhada.`}),`
`,(0,l.jsx)(t.h2,{id:`como-usar`,children:`Como usar`}),`
`,(0,l.jsxs)(t.ul,{children:[`
`,(0,l.jsxs)(t.li,{children:[`componentes vivem em `,(0,l.jsx)(t.code,{children:`project/packages/design-system/src`})]}),`
`,(0,l.jsxs)(t.li,{children:[`apps consomem via `,(0,l.jsx)(t.code,{children:`@nexor/design-system`})]}),`
`,(0,l.jsxs)(t.li,{children:[`a marca ativa deve ser inicializada uma vez via `,(0,l.jsx)(t.code,{children:`initDesignSystem({ brand })`})]}),`
`,(0,l.jsxs)(t.li,{children:[`componentes leem a marca pelo contexto e nao recebem `,(0,l.jsx)(t.code,{children:`brand`}),` como prop`]}),`
`]}),`
`,(0,l.jsx)(t.h2,{id:`objetivo`,children:`Objetivo`}),`
`,(0,l.jsxs)(t.ul,{children:[`
`,(0,l.jsx)(t.li,{children:`documentar o comportamento real dos componentes`}),`
`,(0,l.jsx)(t.li,{children:`reduzir variacoes visuais fora da lib`}),`
`,(0,l.jsx)(t.li,{children:`acelerar a reutilizacao entre Nexor e Biteplaner`}),`
`,(0,l.jsx)(t.li,{children:`preparar a futura evolucao para uma biblioteca multimarca mais robusta`}),`
`]}),`
`,(0,l.jsx)(t.h2,{id:`regras-atuais`,children:`Regras atuais`}),`
`,(0,l.jsxs)(t.ul,{children:[`
`,(0,l.jsxs)(t.li,{children:[(0,l.jsx)(t.code,{children:`Button`}),`: apenas `,(0,l.jsx)(t.code,{children:`primary`}),`, `,(0,l.jsx)(t.code,{children:`secondary`}),` e `,(0,l.jsx)(t.code,{children:`ghost`})]}),`
`,(0,l.jsxs)(t.li,{children:[(0,l.jsx)(t.code,{children:`Field`}),`: um unico componente para `,(0,l.jsx)(t.code,{children:`input`}),`, `,(0,l.jsx)(t.code,{children:`select`}),` e `,(0,l.jsx)(t.code,{children:`textarea`})]}),`
`,(0,l.jsxs)(t.li,{children:[(0,l.jsx)(t.code,{children:`Surface`}),`: base unica para cards e paineis`]}),`
`,(0,l.jsxs)(t.li,{children:[(0,l.jsx)(t.code,{children:`Badge`}),`: base unica para chips e rotulos pequenos`]}),`
`]}),`
`,(0,l.jsx)(t.h2,{id:`toolbar-de-marca`,children:`Toolbar de marca`}),`
`,(0,l.jsxs)(t.p,{children:[`Use o seletor `,(0,l.jsx)(t.code,{children:`Brand`}),` na toolbar do Storybook para alternar entre:`]}),`
`,(0,l.jsxs)(t.ul,{children:[`
`,(0,l.jsx)(t.li,{children:(0,l.jsx)(t.code,{children:`Biteplaner`})}),`
`,(0,l.jsx)(t.li,{children:(0,l.jsx)(t.code,{children:`Nexor`})}),`
`]}),`
`,(0,l.jsx)(t.p,{children:`Isso permite validar o mesmo componente com tokens e atmosfera diferentes sem duplicar stories.`})]})}function c(e={}){let{wrapper:t}={...a(),...e.components};return t?(0,l.jsx)(t,{...e,children:(0,l.jsx)(s,{...e})}):s(e)}var l;e((()=>{l=t(),o(),i()}))();export{c as default};