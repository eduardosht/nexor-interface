import{j as o}from"./jsx-runtime-D_zvdyIk.js";import{u as f,f as a,a as d}from"./provider-CsyxAWo3.js";const i={"heading-1":{defaultAs:"h1",style:e=>a`
      font-family: ${e.fonts.display};
      font-size: ${e.typography.heading[1].fontSize};
      line-height: ${e.typography.heading[1].lineHeight};
      letter-spacing: ${e.typography.heading[1].letterSpacing};
      font-weight: 700;
    `},"heading-2":{defaultAs:"h2",style:e=>a`
      font-family: ${e.fonts.display};
      font-size: ${e.typography.heading[2].fontSize};
      line-height: ${e.typography.heading[2].lineHeight};
      letter-spacing: ${e.typography.heading[2].letterSpacing};
      font-weight: 700;
    `},"heading-3":{defaultAs:"h3",style:e=>a`
      font-family: ${e.fonts.display};
      font-size: ${e.typography.heading[3].fontSize};
      line-height: ${e.typography.heading[3].lineHeight};
      letter-spacing: ${e.typography.heading[3].letterSpacing};
      font-weight: 700;
    `},"heading-4":{defaultAs:"h4",style:e=>a`
      font-family: ${e.fonts.display};
      font-size: ${e.typography.heading[4].fontSize};
      line-height: ${e.typography.heading[4].lineHeight};
      letter-spacing: ${e.typography.heading[4].letterSpacing};
      font-weight: 700;
    `},"heading-5":{defaultAs:"h5",style:e=>a`
      font-family: ${e.fonts.display};
      font-size: ${e.typography.heading[5].fontSize};
      line-height: ${e.typography.heading[5].lineHeight};
      letter-spacing: ${e.typography.heading[5].letterSpacing};
      font-weight: 700;
    `},"heading-6":{defaultAs:"h6",style:e=>a`
      font-family: ${e.fonts.display};
      font-size: ${e.typography.heading[6].fontSize};
      line-height: ${e.typography.heading[6].lineHeight};
      letter-spacing: ${e.typography.heading[6].letterSpacing};
      font-weight: 700;
    `},"paragraph-lg":{defaultAs:"p",style:e=>a`
      font-family: ${e.fonts.body};
      font-size: ${e.typography.paragraph.lg.fontSize};
      line-height: ${e.typography.paragraph.lg.lineHeight};
      font-weight: 400;
    `},"paragraph-md":{defaultAs:"p",style:e=>a`
      font-family: ${e.fonts.body};
      font-size: ${e.typography.paragraph.md.fontSize};
      line-height: ${e.typography.paragraph.md.lineHeight};
      font-weight: 400;
    `},"paragraph-sm":{defaultAs:"p",style:e=>a`
      font-family: ${e.fonts.body};
      font-size: ${e.typography.paragraph.sm.fontSize};
      line-height: ${e.typography.paragraph.sm.lineHeight};
      font-weight: 400;
    `},"description-lg":{defaultAs:"p",style:e=>a`
      font-family: ${e.fonts.body};
      font-size: ${e.typography.description.lg.fontSize};
      line-height: ${e.typography.description.lg.lineHeight};
      font-weight: 500;
    `},"description-md":{defaultAs:"p",style:e=>a`
      font-family: ${e.fonts.body};
      font-size: ${e.typography.description.md.fontSize};
      line-height: ${e.typography.description.md.lineHeight};
      font-weight: 500;
    `},"caption-md":{defaultAs:"span",style:e=>a`
      font-family: ${e.fonts.body};
      font-size: ${e.typography.caption.md.fontSize};
      line-height: ${e.typography.caption.md.lineHeight};
      letter-spacing: ${e.typography.caption.md.letterSpacing};
      font-weight: 700;
      text-transform: uppercase;
    `},"caption-sm":{defaultAs:"span",style:e=>a`
      font-family: ${e.fonts.body};
      font-size: ${e.typography.caption.sm.fontSize};
      line-height: ${e.typography.caption.sm.lineHeight};
      letter-spacing: ${e.typography.caption.sm.letterSpacing};
      font-weight: 700;
      text-transform: uppercase;
    `}},y={default:e=>e.colors.text,muted:e=>e.colors.textMuted,soft:e=>e.colors.textSoft,accent:e=>e.colors.accent},s=d.span`
  margin: 0;
  color: ${({$tokens:e,$tone:t})=>y[t](e)};
  text-align: ${({$align:e})=>e};
  text-wrap: balance;

  ${({$tokens:e,$variant:t})=>i[t].style(e)}
`;function m({as:e,variant:t="paragraph-md",align:n="left",tone:l="default",children:p,...g}){const{tokens:r}=f(),h=i[t].defaultAs;return o.jsx(s,{as:e??h,$tokens:r,$variant:t,$align:n,$tone:l,...g,children:p})}m.__docgenInfo={description:"",methods:[],displayName:"Typography",props:{as:{required:!1,tsType:{name:"ElementType"},description:""},variant:{required:!1,tsType:{name:"union",raw:`| 'heading-1'
| 'heading-2'
| 'heading-3'
| 'heading-4'
| 'heading-5'
| 'heading-6'
| 'paragraph-lg'
| 'paragraph-md'
| 'paragraph-sm'
| 'description-lg'
| 'description-md'
| 'caption-md'
| 'caption-sm'`,elements:[{name:"literal",value:"'heading-1'"},{name:"literal",value:"'heading-2'"},{name:"literal",value:"'heading-3'"},{name:"literal",value:"'heading-4'"},{name:"literal",value:"'heading-5'"},{name:"literal",value:"'heading-6'"},{name:"literal",value:"'paragraph-lg'"},{name:"literal",value:"'paragraph-md'"},{name:"literal",value:"'paragraph-sm'"},{name:"literal",value:"'description-lg'"},{name:"literal",value:"'description-md'"},{name:"literal",value:"'caption-md'"},{name:"literal",value:"'caption-sm'"}]},description:"",defaultValue:{value:"'paragraph-md'",computed:!1}},align:{required:!1,tsType:{name:"union",raw:"'left' | 'center' | 'right'",elements:[{name:"literal",value:"'left'"},{name:"literal",value:"'center'"},{name:"literal",value:"'right'"}]},description:"",defaultValue:{value:"'left'",computed:!1}},tone:{required:!1,tsType:{name:"union",raw:"'default' | 'muted' | 'soft' | 'accent'",elements:[{name:"literal",value:"'default'"},{name:"literal",value:"'muted'"},{name:"literal",value:"'soft'"},{name:"literal",value:"'accent'"}]},description:"",defaultValue:{value:"'default'",computed:!1}},children:{required:!1,tsType:{name:"ReactNode"},description:""}}};export{m as T};
