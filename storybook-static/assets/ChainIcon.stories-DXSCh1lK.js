import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{C as s}from"./ChainIcon-B9a-ssR7.js";import"./index-yBjzXJbu.js";const m={title:"Molecules/ChainIcon",component:s,args:{chain:"eth",size:24}},n={render:()=>e.jsx("div",{style:{display:"flex",alignItems:"center",gap:"1rem"},children:["eth","arb","base","bitcoin","matic","op","sol","zora"].map(a=>e.jsxs("div",{children:[e.jsx(s,{chain:a,size:32}),e.jsx("div",{style:{marginTop:"8px",fontSize:"12px",textTransform:"capitalize"},children:a})]},a))})};var i,t,r;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    alignItems: "center",
    gap: "1rem"
  }}>
      {(["eth", "arb", "base", "bitcoin", "matic", "op", "sol", "zora"] as const).map(chain => <div key={chain}>
          <ChainIcon chain={chain} size={32} />
          <div style={{
        marginTop: "8px",
        fontSize: "12px",
        textTransform: "capitalize"
      }}>
            {chain}
          </div>
        </div>)}
    </div>
}`,...(r=(t=n.parameters)==null?void 0:t.docs)==null?void 0:r.source}}};const l=["Default"];export{n as Default,l as __namedExportsOrder,m as default};
