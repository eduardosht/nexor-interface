import{i as e}from"./preload-helper-xPQekRTU.js";import{l as t,n,o as r,r as i,s as a}from"./provider-U3c13AK_.js";import{t as o}from"./jsx-runtime-CaZkqeYb.js";function s(e,t,n){return t===`primary`?n===`inverse`?a`
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(8px);

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.4);
        }
      `:e.name===`biteplaner`?a`
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
      `:a`
      background: ${e.colors.text};
      color: ${e.colors.accentContrast};
      border: 1px solid ${e.colors.text};

      &:hover:not(:disabled) {
        opacity: 0.88;
        box-shadow: ${e.shadow.sm};
      }

      &:disabled {
        background: ${e.colors.surfaceStrong};
        border-color: ${e.colors.surfaceStrong};
        color: ${e.colors.textSoft};
      }
    `:t===`secondary`?n===`inverse`?a`
        background: transparent;
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.28);

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.44);
      }

      &:disabled {
        color: rgba(255, 255, 255, 0.42);
        border-color: rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.04);
      }
    `:a`
      background: ${e.colors.accentSoft};
      color: ${e.colors.accent};
      border: 1px solid ${e.colors.borderStrong};

      &:hover:not(:disabled) {
        border-color: ${e.colors.accent};
        background: ${e.colors.accentSoft};
        color: ${e.colors.accentStrong};
        box-shadow: ${e.shadow.sm};
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
    `:n===`inverse`?a`
      background: transparent;
      color: rgba(255, 255, 255, 0.72);
      border: 1px solid transparent;

      &:hover:not(:disabled) {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.12);
      }
    `:a`
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
      background: transparent;
    }
  `}function c({variant:e=`primary`,tone:t=`default`,size:n=`md`,type:r=`button`,fullWidth:a=!1,loading:o=!1,leadingIcon:s,trailingIcon:c,children:u,disabled:p,...m}){let{tokens:h}=i();return(0,l.jsx)(d,{$tokens:h,$variant:e,$tone:t,$size:n,$fullWidth:a,"data-variant":e,type:r,disabled:p||o,...m,children:(0,l.jsxs)(f,{children:[s,o?`Carregando...`:u,c]})})}var l,u,d,f,p=e((()=>{r(),n(),l=o(),u={sm:a`
    min-height: 40px;
    padding: 9px 16px;
    font-size: 13px;
  `,md:a`
    min-height: 46px;
    padding: 12px 20px;
    font-size: 14px;
  `,lg:a`
    min-height: 52px;
    padding: 14px 24px;
    font-size: 14px;
  `},d=t.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${({$fullWidth:e})=>e?`100%`:`auto`};
  max-width: ${({$fullWidth:e})=>e?`100%`:`none`};
  min-width: ${({$fullWidth:e})=>e?`0`:`max-content`};
  border-radius: ${({$tokens:e})=>e.radius.sm};
  font-family: ${({$tokens:e})=>e.fonts.display};
  font-weight: 400;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
  overflow-wrap: normal;
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
    opacity: 0.56;
    filter: saturate(0.72);
    transform: none;
  }

  ${({$size:e})=>u[e]}
  ${({$tokens:e,$variant:t,$tone:n})=>s(e,t,n)}
`,f=t.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: none;
  min-width: 0;
  line-height: inherit;
  overflow-wrap: normal;
  white-space: inherit;
  text-wrap: nowrap;

  svg {
    flex: 0 0 auto;
  }
`,c.__docgenInfo={description:``,methods:[],displayName:`Button`,props:{variant:{required:!1,tsType:{name:`union`,raw:`'primary' | 'secondary' | 'ghost'`,elements:[{name:`literal`,value:`'primary'`},{name:`literal`,value:`'secondary'`},{name:`literal`,value:`'ghost'`}]},description:``,defaultValue:{value:`'primary'`,computed:!1}},tone:{required:!1,tsType:{name:`union`,raw:`'default' | 'inverse'`,elements:[{name:`literal`,value:`'default'`},{name:`literal`,value:`'inverse'`}]},description:``,defaultValue:{value:`'default'`,computed:!1}},size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md' | 'lg'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`}]},description:``,defaultValue:{value:`'md'`,computed:!1}},fullWidth:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},loading:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},leadingIcon:{required:!1,tsType:{name:`ReactNode`},description:``},trailingIcon:{required:!1,tsType:{name:`ReactNode`},description:``},children:{required:!1,tsType:{name:`ReactNode`},description:``},type:{defaultValue:{value:`'button'`,computed:!1},required:!1}}}}));export{p as n,c as t};