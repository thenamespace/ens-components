import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{T as C}from"./Text-DmuCryDF.js";import{I as i}from"./Icon-DfhILpv1.js";import"./index-yBjzXJbu.js";import"./index-BUSIDwT2.js";var n=(t=>(t.InProgress="In Progress",t.Completed="Completed",t.Failed="Failed",t))(n||{});const s=({state:t,blockExplorerUrl:u,transactionHash:c,className:j=""})=>{const y=()=>{switch(t){case"In Progress":return e.jsx("div",{className:"ns-pending-tx__spinner"});case"Completed":return e.jsx(i,{name:"check-circle",size:24});case"Failed":return e.jsx(i,{name:"x-circle",size:24});default:return null}},T=()=>{switch(t){case"In Progress":return"Transaction is being executed...";case"Completed":return"Transaction completed successfully!";case"Failed":return"Transaction failed!";default:return""}},P=()=>{switch(t){case"In Progress":return"ns-pending-tx--in-progress";case"Completed":return"ns-pending-tx--completed";case"Failed":return"ns-pending-tx--failed";default:return""}},v=()=>{switch(t){case"In Progress":return"ns-pending-tx__icon--in-progress";case"Completed":return"ns-pending-tx__icon--completed";case"Failed":return"ns-pending-tx__icon--failed";default:return""}};return e.jsx("div",{className:`ns-pending-tx ${P()} ${j}`,children:e.jsxs("div",{className:"ns-pending-tx__content",children:[e.jsx("div",{className:`ns-pending-tx__icon ${v()}`,children:y()}),e.jsx("div",{className:"ns-pending-tx__status",children:e.jsx(C,{children:T()})}),c&&e.jsxs("p",{className:"ns-pending-tx__message",children:["Hash: ",c.slice(0,10),"...",c.slice(-8)]}),e.jsxs("a",{href:u,target:"_blank",rel:"noopener noreferrer",className:"ns-pending-tx__link",children:[e.jsx(i,{name:"globe",size:16,className:"ns-pending-tx__link-icon"}),"View on Block Explorer"]})]})})};s.__docgenInfo={description:"",methods:[],displayName:"PendingTransaction",props:{state:{required:!0,tsType:{name:"TransactionState"},description:""},blockExplorerUrl:{required:!0,tsType:{name:"string"},description:""},transactionHash:{required:!1,tsType:{name:"string"},description:""},className:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}}}};const U={title:"Components/PendingTransaction",component:s,parameters:{layout:"centered",docs:{description:{component:"A component that displays the status of a pending blockchain transaction with visual indicators, animations, and a link to the block explorer."}}},argTypes:{state:{control:{type:"select"},options:Object.values(n),description:"The current state of the transaction"},blockExplorerUrl:{control:{type:"text"},description:"URL to view the transaction on a block explorer"},transactionHash:{control:{type:"text"},description:"Optional transaction hash to display (truncated)"},className:{control:{type:"text"},description:"Additional CSS class names to apply to the component"}},tags:["autodocs"]},a={render:()=>e.jsxs("div",{style:{maxWidth:"600px",margin:"0 auto",padding:"24px"},children:[e.jsx("h2",{children:"Component Documentation"}),e.jsx("h3",{children:"Key Props"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"state"})," - Transaction state: 'InProgress', 'Completed', 'Failed'"]}),e.jsxs("li",{children:[e.jsx("code",{children:"blockExplorerUrl"})," - URL to view transaction (string)"]}),e.jsxs("li",{children:[e.jsx("code",{children:"transactionHash"})," - Optional transaction hash (string)"]}),e.jsxs("li",{children:[e.jsx("code",{children:"className"})," - Additional CSS classes (string)"]})]}),e.jsx("h3",{children:"Usage Examples"}),e.jsx("pre",{style:{backgroundColor:"#f5f5f5",padding:"16px",borderRadius:"8px",overflow:"auto"},children:`// In progress transaction
<PendingTransaction
  state={TransactionState.InProgress}
  blockExplorerUrl="https://etherscan.io/tx/0x123..."
  transactionHash="0x1234567890abcdef..."
/>

// Completed transaction
<PendingTransaction
  state={TransactionState.Completed}
  blockExplorerUrl="https://etherscan.io/tx/0x123..."
/>`})]}),parameters:{docs:{description:{story:"Documentation for the PendingTransaction component."}}}},r={args:{state:n.InProgress,blockExplorerUrl:"https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",transactionHash:"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"}},o={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",alignItems:"center"},children:[e.jsxs("div",{children:[e.jsx("h3",{style:{marginBottom:"12px",textAlign:"center"},children:"In Progress"}),e.jsx(s,{state:n.InProgress,blockExplorerUrl:"https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",transactionHash:"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"})]}),e.jsxs("div",{children:[e.jsx("h3",{style:{marginBottom:"12px",textAlign:"center"},children:"Completed"}),e.jsx(s,{state:n.Completed,blockExplorerUrl:"https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",transactionHash:"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"})]}),e.jsxs("div",{children:[e.jsx("h3",{style:{marginBottom:"12px",textAlign:"center"},children:"Failed"}),e.jsx(s,{state:n.Failed,blockExplorerUrl:"https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",transactionHash:"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"})]})]}),parameters:{docs:{description:{story:"All transaction states: in progress, completed, and failed."}}}};var d,l,p;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <div style={{
    maxWidth: "600px",
    margin: "0 auto",
    padding: "24px"
  }}>
      <h2>Component Documentation</h2>

      <h3>Key Props</h3>
      <ul>
        <li>
          <code>state</code> - Transaction state: 'InProgress', 'Completed',
          'Failed'
        </li>
        <li>
          <code>blockExplorerUrl</code> - URL to view transaction (string)
        </li>
        <li>
          <code>transactionHash</code> - Optional transaction hash (string)
        </li>
        <li>
          <code>className</code> - Additional CSS classes (string)
        </li>
      </ul>

      <h3>Usage Examples</h3>
      <pre style={{
      backgroundColor: "#f5f5f5",
      padding: "16px",
      borderRadius: "8px",
      overflow: "auto"
    }}>
        {\`// In progress transaction
<PendingTransaction
  state={TransactionState.InProgress}
  blockExplorerUrl="https://etherscan.io/tx/0x123..."
  transactionHash="0x1234567890abcdef..."
/>

// Completed transaction
<PendingTransaction
  state={TransactionState.Completed}
  blockExplorerUrl="https://etherscan.io/tx/0x123..."
/>\`}
      </pre>
    </div>,
  parameters: {
    docs: {
      description: {
        story: "Documentation for the PendingTransaction component."
      }
    }
  }
}`,...(p=(l=a.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};var x,m,h;r.parameters={...r.parameters,docs:{...(x=r.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    state: TransactionState.InProgress,
    blockExplorerUrl: "https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  }
}`,...(h=(m=r.parameters)==null?void 0:m.docs)==null?void 0:h.source}}};var f,g,b;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    alignItems: "center"
  }}>
      <div>
        <h3 style={{
        marginBottom: "12px",
        textAlign: "center"
      }}>
          In Progress
        </h3>
        <PendingTransaction state={TransactionState.InProgress} blockExplorerUrl="https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" transactionHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" />
      </div>
      <div>
        <h3 style={{
        marginBottom: "12px",
        textAlign: "center"
      }}>Completed</h3>
        <PendingTransaction state={TransactionState.Completed} blockExplorerUrl="https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" transactionHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" />
      </div>
      <div>
        <h3 style={{
        marginBottom: "12px",
        textAlign: "center"
      }}>Failed</h3>
        <PendingTransaction state={TransactionState.Failed} blockExplorerUrl="https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" transactionHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" />
      </div>
    </div>,
  parameters: {
    docs: {
      description: {
        story: "All transaction states: in progress, completed, and failed."
      }
    }
  }
}`,...(b=(g=o.parameters)==null?void 0:g.docs)==null?void 0:b.source}}};const A=["ComponentDocs","Default","AllStates"];export{o as AllStates,a as ComponentDocs,r as Default,A as __namedExportsOrder,U as default};
