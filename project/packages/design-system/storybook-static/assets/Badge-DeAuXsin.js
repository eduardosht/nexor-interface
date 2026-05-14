import{j as c}from"./jsx-runtime-D_zvdyIk.js";import{u as l,a as t,f as o}from"./provider-CsyxAWo3.js";function n(r,e){return e==="accent"?o`
      background: ${r.colors.accentSoft};
      color: ${r.colors.accent};
      border-color: ${r.colors.border};
    `:e==="error"?o`
      background: ${r.colors.dangerBg};
      color: ${r.colors.danger};
      border-color: ${r.colors.dangerBorder};
    `:e==="success"?o`
      background: ${r.colors.successBg};
      color: ${r.colors.text};
      border-color: ${r.colors.successBorder};
    `:e==="warning"?o`
      background: #fff7e6;
      color: #9a6700;
      border-color: #f5d08a;
    `:o`
    background: ${r.colors.surfaceSubtle};
    color: ${r.colors.textMuted};
    border-color: ${r.colors.border};
  `}const s=t.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 4px 10px;
  border: 1px solid;
  border-radius: ${({$tokens:r})=>r.radius.pill};
  font-family: ${({$tokens:r})=>r.fonts.body};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;

  ${({$tokens:r,$tone:e})=>n(r,e)}
`;function i({tone:r="neutral",...e}){const{tokens:a}=l();return c.jsx(s,{$tokens:a,$tone:r,...e})}i.__docgenInfo={description:"",methods:[],displayName:"Badge",props:{tone:{required:!1,tsType:{name:"union",raw:"'neutral' | 'accent' | 'warning' | 'error' | 'success'",elements:[{name:"literal",value:"'neutral'"},{name:"literal",value:"'accent'"},{name:"literal",value:"'warning'"},{name:"literal",value:"'error'"},{name:"literal",value:"'success'"}]},description:"",defaultValue:{value:"'neutral'",computed:!1}}},composes:["HTMLAttributes"]};export{i as B};
