import{j as s}from"./jsx-runtime-Cf8x2fCZ.js";import{S as d}from"./SelectRecordsForm-DftlCb0P.js";import{r as p}from"./index-BUSIDwT2.js";import"./index-yBjzXJbu.js";import"./Input-Bq4XNRC6.js";import"./Text-DmuCryDF.js";import"./Icon-D7kVSi4N.js";import"./ChainIcon-DSKpsAIN.js";import"./ContenthashIcon-75u6mtas.js";let a={texts:[],addresses:[]};const i=r=>{a=r},E={title:"Components/SelectRecordsForm",component:d,args:{records:a,onRecordsUpdated:i}},e={render:r=>{const[c,m]=p.useState({texts:[],addresses:[]});return s.jsx("div",{style:{display:"flex",alignItems:"center",gap:"1rem"},children:s.jsx(d,{...r,records:c,onRecordsUpdated:m})})}};var t,o,n;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`{
  render: args => {
    const [records, setRecords] = useState<EnsRecords>({
      texts: [],
      addresses: []
    });
    return <div style={{
      display: "flex",
      alignItems: "center",
      gap: "1rem"
    }}>
        <SelectRecordsForm {...args} // keep controls working
      records={records} // but force our local state
      onRecordsUpdated={setRecords} // guaranteed function
      />
      </div>;
  }
}`,...(n=(o=e.parameters)==null?void 0:o.docs)==null?void 0:n.source}}};const v=["Default"];export{e as Default,v as __namedExportsOrder,E as default};
