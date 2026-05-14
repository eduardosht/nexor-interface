import{j as l}from"./jsx-runtime-D_zvdyIk.js";import{u as d,f as r,a as n}from"./provider-CsyxAWo3.js";const u={sm:r`
    padding: 12px;
  `,md:r`
    padding: 16px;
  `,lg:r`
    padding: 24px;
  `};function i(e,a){return a==="subtle"?r`
      background: ${e.colors.surfaceSubtle};
      border-color: ${e.colors.border};
    `:a==="accent"?r`
      background: ${e.colors.accentSoft};
      border-color: ${e.colors.border};
    `:r`
    background: ${e.colors.surface};
    border-color: ${e.colors.border};
  `}const c=n.div`
  border: 1px solid;
  border-radius: ${({$tokens:e})=>e.radius.lg};
  box-shadow: ${({$tokens:e})=>e.shadow.sm};
  transition:
    background ${({$tokens:e})=>e.motion.base} ease,
    border-color ${({$tokens:e})=>e.motion.base} ease,
    box-shadow ${({$tokens:e})=>e.motion.base} ease,
    transform ${({$tokens:e})=>e.motion.fast} ease;

  ${({$tokens:e,$tone:a})=>i(e,a)}
  ${({$padding:e})=>u[e]}

  ${({$interactive:e,$tokens:a})=>e?r`
          cursor: pointer;

          &:hover {
            transform: translateY(-2px);
            box-shadow: ${a.shadow.md};
          }
        `:""}
`;function m({tone:e="default",padding:a="md",interactive:o=!1,...t}){const{tokens:s}=d();return l.jsx(c,{$tokens:s,$tone:e,$padding:a,$interactive:o,...t})}m.__docgenInfo={description:"",methods:[],displayName:"Surface",props:{tone:{required:!1,tsType:{name:"union",raw:"'default' | 'subtle' | 'accent'",elements:[{name:"literal",value:"'default'"},{name:"literal",value:"'subtle'"},{name:"literal",value:"'accent'"}]},description:"",defaultValue:{value:"'default'",computed:!1}},padding:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:"",defaultValue:{value:"'md'",computed:!1}},interactive:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}},composes:["HTMLAttributes"]};export{m as S};
