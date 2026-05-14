import{j as t}from"./jsx-runtime-D_zvdyIk.js";import{D as n,g as e,S as i,a as s}from"./provider-CsyxAWo3.js";import"./Button-Dc7LZi83.js";import"./Field-CJuwh9w6.js";import"./Surface-CDLUlGBu.js";import"./Badge-DeAuXsin.js";import"./Typography-BXUXbHWb.js";import"./index-DK_B2187.js";import"./_commonjsHelpers-CqkleIqs.js";const d=i`
  *, *::before, *::after { box-sizing: border-box; }

  html, body, #storybook-root {
    margin: 0;
    min-height: 100%;
  }

  body {
    color: ${({$brand:o})=>e(o).colors.text};
    font-family: ${({$brand:o})=>e(o).fonts.body};
    -webkit-font-smoothing: antialiased;
  }
`,l=s.div`
  width: 100%;
  padding: 0;
  color: ${({$brand:o})=>e(o).colors.text};
`,h={globalTypes:{brand:{name:"Brand",description:"Marca ativa do design system",defaultValue:"biteplaner",toolbar:{icon:"paintbrush",items:[{value:"biteplaner",title:"Biteplaner"},{value:"nexor",title:"Nexor"}]}}},parameters:{controls:{expanded:!0},layout:"padded",options:{storySort:{order:["Introduction","Foundations","Components"]}}},decorators:[(o,a)=>{const r=a.globals.brand;return t.jsxs(n,{brand:r,children:[t.jsx(d,{$brand:r}),t.jsx(l,{$brand:r,children:t.jsx(o,{})})]})}]};export{h as default};
