import{i as e,s as t}from"./preload-helper-xPQekRTU.js";import{t as n}from"./react-DDN5JYuz.js";import{t as r}from"./jsx-runtime-CaZkqeYb.js";import{d as i,f as a}from"./iframe-D7aB48g8.js";var o,s,c,l,u,d;e((()=>{o=t(n(),1),a(),s=r(),c={title:`Components/DataTable`,component:i,tags:[`autodocs`]},l=Array.from({length:12},(e,t)=>({id:`row-${t+1}`,name:`Cliente ${t+1}`,status:t%3==0?`active`:t%3==1?`pending`:`cancelled`})),u={render:()=>{let[e,t]=(0,o.useState)(``),[n,r]=(0,o.useState)(``);return(0,s.jsx)(i,{data:l.filter(e=>!n||e.status===n).filter(t=>!e||t.name.toLowerCase().includes(e.toLowerCase())),keyExtractor:e=>e.id,searchValue:e,onSearchChange:t,searchPlaceholder:`Buscar por nome...`,filterValue:n,onFilterChange:r,filterOptions:[{value:`active`,label:`Ativo`},{value:`pending`,label:`Pendente`},{value:`cancelled`,label:`Cancelado`}],columns:[{key:`id`,label:`ID`,render:e=>e.id},{key:`name`,label:`Nome`,render:e=>e.name},{key:`status`,label:`Status`,render:e=>e.status}]})}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');
    const filtered = sampleData.filter(r => !filter || r.status === filter).filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()));
    return <DataTable data={filtered} keyExtractor={r => r.id} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Buscar por nome..." filterValue={filter} onFilterChange={setFilter} filterOptions={[{
      value: 'active',
      label: 'Ativo'
    }, {
      value: 'pending',
      label: 'Pendente'
    }, {
      value: 'cancelled',
      label: 'Cancelado'
    }]} columns={[{
      key: 'id',
      label: 'ID',
      render: r => r.id
    }, {
      key: 'name',
      label: 'Nome',
      render: r => r.name
    }, {
      key: 'status',
      label: 'Status',
      render: r => r.status
    }]} />;
  }
}`,...u.parameters?.docs?.source}}},d=[`Default`]}))();export{u as Default,d as __namedExportsOrder,c as default};