import{i as e,s as t}from"./preload-helper-xPQekRTU.js";import{t as n}from"./react-DDN5JYuz.js";import{t as r}from"./jsx-runtime-CaZkqeYb.js";import{D as i,O as a}from"./iframe-D7aB48g8.js";var o,s,c,l,u;e((()=>{o=t(n(),1),a(),s=r(),c={title:`Components/DocumentField`,component:i,tags:[`autodocs`]},l={render:()=>{let[e,t]=(0,o.useState)(`cpf`),[n,r]=(0,o.useState)(``);return(0,s.jsx)(i,{label:`Documento`,documentType:e,documentNumber:n,documentTypes:[{value:`cpf`,label:`CPF`},{value:`rg`,label:`RG`}],onDocumentTypeChange:e=>{t(e),r(``)},onDocumentNumberChange:r})}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [documentType, setDocumentType] = useState<SupportedDocumentType>('cpf');
    const [documentNumber, setDocumentNumber] = useState('');
    return <DocumentField label="Documento" documentType={documentType} documentNumber={documentNumber} documentTypes={[{
      value: 'cpf',
      label: 'CPF'
    }, {
      value: 'rg',
      label: 'RG'
    }]} onDocumentTypeChange={nextType => {
      setDocumentType(nextType);
      setDocumentNumber('');
    }} onDocumentNumberChange={setDocumentNumber} />;
  }
}`,...l.parameters?.docs?.source}}},u=[`Basic`]}))();export{l as Basic,u as __namedExportsOrder,c as default};