import{j as l}from"./jsx-runtime-D_zvdyIk.js";import{u as p,a as n,f as r}from"./provider-CsyxAWo3.js";const m={sm:r`
    min-height: 36px;
    padding: 8px 14px;
    font-size: 12px;
  `,md:r`
    min-height: 44px;
    padding: 12px 20px;
    font-size: 14px;
  `,lg:r`
    min-height: 50px;
    padding: 14px 24px;
    font-size: 15px;
  `};function g(e,a,o){return a==="primary"?o==="inverse"?r`
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(8px);

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.4);
        }
      `:e.name==="biteplaner"?r`
        background: #5b9b74;
        color: ${e.colors.accentContrast};
        border: 1px solid #5b9b74;

        &:hover:not(:disabled) {
          background: ${e.colors.accent};
          border-color: ${e.colors.accent};
          box-shadow: ${e.shadow.md};
        }

        &:active:not(:disabled) {
          background: ${e.colors.accentStrong};
          border-color: ${e.colors.accentStrong};
          box-shadow: ${e.shadow.sm};
        }

        &:disabled {
          background: ${e.colors.surfaceStrong};
          border-color: ${e.colors.surfaceStrong};
          color: ${e.colors.textSoft};
        }
      `:r`
      background: ${e.colors.text};
      color: ${e.colors.accentContrast};
      border: 1px solid ${e.colors.text};

      &:hover:not(:disabled) {
        opacity: 0.88;
        box-shadow: ${e.shadow.sm};
      }
    `:a==="secondary"?o==="inverse"?r`
        background: transparent;
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.28);

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.44);
        }
      `:r`
      background: ${e.colors.accentSoft};
      color: ${e.colors.accent};
      border: 1px solid ${e.colors.borderStrong};

      &:hover:not(:disabled) {
        border-color: ${e.colors.accent};
        background: ${e.colors.surfaceStrong};
        color: ${e.colors.accentContrast};
      }

      &:active:not(:disabled) {
        background: ${e.colors.accent};
        border-color: ${e.colors.accent};
        color: ${e.colors.accentContrast};
      }

      &:disabled {
        background: ${e.colors.surfaceSubtle};
        border-color: ${e.colors.border};
        color: ${e.colors.textSoft};
      }
    `:o==="inverse"?r`
      background: transparent;
      color: rgba(255, 255, 255, 0.72);
      border: 1px solid transparent;

      &:hover:not(:disabled) {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.12);
      }
    `:r`
    background: transparent;
    color: ${e.colors.textMuted};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      color: ${e.colors.text};
      background: ${e.colors.accentSoft};
    }

    &:active:not(:disabled) {
      color: ${e.colors.accentStrong};
      background: ${e.colors.surfaceStrong};
    }

    &:disabled {
      color: ${e.colors.textSoft};
    }
  `}const $=n.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${({$fullWidth:e})=>e?"100%":"auto"};
  border-radius: ${({$tokens:e})=>e.radius.sm};
  font-family: ${({$tokens:e})=>e.fonts.display};
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background ${({$tokens:e})=>e.motion.base} ease,
    color ${({$tokens:e})=>e.motion.base} ease,
    border-color ${({$tokens:e})=>e.motion.base} ease,
    filter ${({$tokens:e})=>e.motion.base} ease,
    transform ${({$tokens:e})=>e.motion.fast} ease,
    box-shadow ${({$tokens:e})=>e.motion.base} ease;

  &:focus-visible {
    outline: 2px solid ${({$tokens:e})=>e.colors.accent};
    outline-offset: 2px;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    cursor: not-allowed;
    box-shadow: none;
  }

  ${({$size:e})=>m[e]}
  ${({$tokens:e,$variant:a,$tone:o})=>g(e,a,o)}
`,x=n.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;function v({variant:e="primary",tone:a="default",size:o="md",fullWidth:s=!1,loading:t=!1,leadingIcon:c,trailingIcon:d,children:i,disabled:u,...f}){const{tokens:b}=p();return l.jsx($,{$tokens:b,$variant:e,$tone:a,$size:o,$fullWidth:s,disabled:u||t,...f,children:l.jsxs(x,{children:[c,t?"Carregando...":i,d]})})}v.__docgenInfo={description:"",methods:[],displayName:"Button",props:{variant:{required:!1,tsType:{name:"union",raw:"'primary' | 'secondary' | 'ghost'",elements:[{name:"literal",value:"'primary'"},{name:"literal",value:"'secondary'"},{name:"literal",value:"'ghost'"}]},description:"",defaultValue:{value:"'primary'",computed:!1}},tone:{required:!1,tsType:{name:"union",raw:"'default' | 'inverse'",elements:[{name:"literal",value:"'default'"},{name:"literal",value:"'inverse'"}]},description:"",defaultValue:{value:"'default'",computed:!1}},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:"",defaultValue:{value:"'md'",computed:!1}},fullWidth:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},loading:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},leadingIcon:{required:!1,tsType:{name:"ReactNode"},description:""},trailingIcon:{required:!1,tsType:{name:"ReactNode"},description:""},children:{required:!1,tsType:{name:"ReactNode"},description:""}}};export{v as B};
