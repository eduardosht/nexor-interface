import{i as e,s as t}from"./preload-helper-xPQekRTU.js";import{t as n}from"./react-DDN5JYuz.js";import{t as r}from"./jsx-runtime-CaZkqeYb.js";import{E as i,T as a}from"./iframe-D7aB48g8.js";var o,s,c,l,u,d;e((()=>{o=t(n(),1),i(),s=r(),c={title:`Components/RadioQuestionGroup`,component:a,tags:[`autodocs`]},l={render:()=>{let[e,t]=(0,o.useState)(`no`);return(0,s.jsx)(a,{name:`minor`,label:`O usuario final e menor de idade?`,required:!0,value:e,onChange:t,options:[{value:`no`,label:`Nao`},{value:`yes`,label:`Sim`}]})}},u={render:()=>{let[e,t]=(0,o.useState)(`cpf`);return(0,s.jsx)(a,{name:`documentType`,label:`Documento do produto`,hint:`Selecione o tipo de documento`,variant:`cards`,columns:2,required:!0,value:e,onChange:t,options:[{value:`cpf`,label:`CPF`,description:`Documento brasileiro`},{value:`rne`,label:`RNE / estrangeiro`,description:`Documento de estrangeiro`}]})}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('no');
    return <RadioQuestionGroup name="minor" label="O usuario final e menor de idade?" required value={value} onChange={setValue} options={[{
      value: 'no',
      label: 'Nao'
    }, {
      value: 'yes',
      label: 'Sim'
    }]} />;
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('cpf');
    return <RadioQuestionGroup name="documentType" label="Documento do produto" hint="Selecione o tipo de documento" variant="cards" columns={2} required value={value} onChange={setValue} options={[{
      value: 'cpf',
      label: 'CPF',
      description: 'Documento brasileiro'
    }, {
      value: 'rne',
      label: 'RNE / estrangeiro',
      description: 'Documento de estrangeiro'
    }]} />;
  }
}`,...u.parameters?.docs?.source}}},d=[`Inline`,`Cards`]}))();export{u as Cards,l as Inline,d as __namedExportsOrder,c as default};