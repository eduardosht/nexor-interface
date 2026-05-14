import{j as t}from"./jsx-runtime-D_zvdyIk.js";import{r as m}from"./index-DK_B2187.js";import{u as j,a as r}from"./provider-CsyxAWo3.js";const k=r.div`
  display: flex;
  flex-direction: column;
  gap: ${({$tokens:e})=>e.spacing.form.helperGap};
`,v=r.label`
  color: ${({$tokens:e})=>e.colors.text};
  font-family: ${({$tokens:e})=>e.fonts.body};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`,q=r.div`
  display: flex;
  align-items: center;
  gap: ${({$tokens:e})=>e.spacing.form.controlGap};
  background: ${({$tokens:e,$invalid:o})=>o?e.colors.dangerBg:e.colors.surface};
  border: 1px solid
    ${({$tokens:e,$invalid:o})=>o?e.colors.dangerBorder:e.colors.border};
  border-radius: ${({$tokens:e})=>e.radius.md};
  padding: 0 12px;
  transition:
    border-color ${({$tokens:e})=>e.motion.base} ease,
    background ${({$tokens:e})=>e.motion.base} ease,
    box-shadow ${({$tokens:e})=>e.motion.base} ease;

  &:focus-within {
    border-color: ${({$tokens:e,$invalid:o})=>o?e.colors.danger:e.colors.accentStrong};
    box-shadow: 0 0 0 3px
      ${({$tokens:e,$invalid:o})=>o?`${e.colors.danger}18`:`${e.colors.accent}18`};
  }
`,d=`
  flex: 1;
  width: 100%;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: inherit;
  font: inherit;
  box-sizing: border-box;

  &::placeholder {
    color: inherit;
    opacity: 0.65;
  }
`,w=r.input`
  ${d}
  min-height: 42px;
  color: ${({$tokens:e})=>e.colors.text};
  font-family: ${({$tokens:e})=>e.fonts.body};
  font-size: 14px;
`,z=r.select`
  ${d}
  min-height: 42px;
  color: ${({$tokens:e})=>e.colors.text};
  font-family: ${({$tokens:e})=>e.fonts.body};
  font-size: 14px;
  appearance: none;
  cursor: pointer;
`,S=r.textarea`
  ${d}
  min-height: 110px;
  color: ${({$tokens:e})=>e.colors.text};
  font-family: ${({$tokens:e})=>e.fonts.body};
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  padding: 12px 0;
`,h=r.span`
  color: ${({$tokens:e,$tone:o})=>o==="error"?e.colors.danger:e.colors.textSoft};
  font-family: ${({$tokens:e})=>e.fonts.body};
  font-size: 11px;
  line-height: 1.4;
`,$=r.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({$tokens:e})=>e.colors.textSoft};
  flex-shrink: 0;
`,T=m.forwardRef(function({as:o="input",label:p,hint:f,error:i,id:g,leadingIcon:x,trailingIcon:u,children:b,...a},c){const{tokens:n}=j(),y=m.useId(),s=g??y,l=!!i;return t.jsxs(k,{$tokens:n,children:[p?t.jsx(v,{$tokens:n,htmlFor:s,children:p}):null,t.jsxs(q,{$tokens:n,$invalid:l,children:[x?t.jsx($,{$tokens:n,children:x}):null,o==="select"?t.jsx(z,{$tokens:n,id:s,ref:c,"aria-invalid":l,...a,children:b}):null,o==="textarea"?t.jsx(S,{$tokens:n,id:s,ref:c,"aria-invalid":l,...a}):null,o==="input"?t.jsx(w,{$tokens:n,id:s,ref:c,"aria-invalid":l,...a}):null,u?t.jsx($,{$tokens:n,children:u}):null]}),i?t.jsx(h,{$tokens:n,$tone:"error",children:i}):null,!i&&f?t.jsx(h,{$tokens:n,$tone:"hint",children:f}):null]})});T.__docgenInfo={description:"",methods:[],displayName:"Field",props:{label:{required:!1,tsType:{name:"string"},description:""},hint:{required:!1,tsType:{name:"string"},description:""},error:{required:!1,tsType:{name:"string"},description:""},leadingIcon:{required:!1,tsType:{name:"ReactNode"},description:""},trailingIcon:{required:!1,tsType:{name:"ReactNode"},description:""},children:{required:!1,tsType:{name:"ReactNode"},description:""},as:{defaultValue:{value:"'input'",computed:!1},required:!1}}};export{T as F};
