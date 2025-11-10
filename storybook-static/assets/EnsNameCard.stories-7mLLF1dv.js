import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{T as o}from"./Text-DmuCryDF.js";import{I as v}from"./Icon-DfhILpv1.js";import{C as f}from"./ChainIcon-DSKpsAIN.js";import"./index-yBjzXJbu.js";import"./index-BUSIDwT2.js";const h=({children:a,className:s="",...n})=>e.jsx("div",{className:`ns-card ${s}`,...n,children:a});h.__docgenInfo={description:"",methods:[],displayName:"Card",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}}};const i=({name:a,imageUrl:s,expires:n,chain:N="eth",className:x=""})=>e.jsxs(h,{className:`ens-name-card ${x}`,children:[e.jsxs("div",{className:"ens-card-image-container",children:[e.jsx("img",{src:s,alt:`${a} avatar`,className:"ens-card-image"}),e.jsx("div",{className:"ens-card-badge",children:e.jsx(f,{chain:N,size:25})})]}),e.jsxs("div",{className:"ens-card-body",children:[e.jsx(o,{weight:"bold",children:a}),e.jsxs("div",{className:"ens-card-expiry",children:[e.jsx(v,{name:"clock",size:14}),e.jsxs(o,{size:"sm",children:["Expires ",n]})]})]})]});i.__docgenInfo={description:"",methods:[],displayName:"ENSNameCard",props:{name:{required:!0,tsType:{name:"string"},description:""},imageUrl:{required:!0,tsType:{name:"string"},description:""},expires:{required:!0,tsType:{name:"string"},description:""},chain:{required:!1,tsType:{name:"union",raw:`| "eth"
| "arb"
| "base"
| "bitcoin"
| "matic"
| "op"
| "sol"
| "zora"
| "celo"`,elements:[{name:"literal",value:'"eth"'},{name:"literal",value:'"arb"'},{name:"literal",value:'"base"'},{name:"literal",value:'"bitcoin"'},{name:"literal",value:'"matic"'},{name:"literal",value:'"op"'},{name:"literal",value:'"sol"'},{name:"literal",value:'"zora"'},{name:"literal",value:'"celo"'}]},description:"",defaultValue:{value:'"eth"',computed:!1}},className:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}}}};const T={title:"Components/ENSNameCard",component:i,parameters:{layout:"centered",docs:{description:{component:`
# ENSNameCard

A card component for displaying ENS name details, including avatar, name, expiry, and chain badge.
        `}}},argTypes:{name:{control:"text",description:"ENS name"},imageUrl:{control:"text",description:"Avatar image URL"},expires:{control:"text",description:"Expiry date"},chain:{control:"text",description:"Chain name (e.g. eth, arb, base)"}}},g=a=>e.jsx(i,{...a}),r={render:g,args:{name:"artii.eth",imageUrl:"https://avatars.githubusercontent.com/u/123456?v=4",expires:"2026-12-31",chain:"eth"},parameters:{docs:{description:{story:"Default ENSNameCard with sample data."}}}},t={render:g,args:{name:"jane.eth",imageUrl:"https://avatars.githubusercontent.com/u/789012?v=4",expires:"2027-05-20",chain:"arb"},parameters:{docs:{description:{story:"ENSNameCard with custom chain badge."}}}};var c,m,d;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: Template,
  args: {
    name: "artii.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/123456?v=4",
    expires: "2026-12-31",
    chain: "eth"
  },
  parameters: {
    docs: {
      description: {
        story: "Default ENSNameCard with sample data."
      }
    }
  }
}`,...(d=(m=r.parameters)==null?void 0:m.docs)==null?void 0:d.source}}};var l,p,u;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: Template,
  args: {
    name: "jane.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/789012?v=4",
    expires: "2027-05-20",
    chain: "arb"
  },
  parameters: {
    docs: {
      description: {
        story: "ENSNameCard with custom chain badge."
      }
    }
  }
}`,...(u=(p=t.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};const q=["Default","WithCustomChain"];export{r as Default,t as WithCustomChain,q as __namedExportsOrder,T as default};
