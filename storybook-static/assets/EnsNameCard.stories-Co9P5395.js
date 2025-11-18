import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{T as h}from"./Text-DmuCryDF.js";import{I as W}from"./Icon-DfhILpv1.js";import{C as L}from"./ChainIcon-DSKpsAIN.js";import"./index-yBjzXJbu.js";import"./index-BUSIDwT2.js";const _=({children:a,className:r="",...d})=>e.jsx("div",{className:`ns-card ${r}`,...d,children:a});_.__docgenInfo={description:"",methods:[],displayName:"Card",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}}};const l=({name:a,imageUrl:r,expires:d,chain:O="eth",className:P=""})=>e.jsxs(_,{className:`ens-name-card ${P}`,children:[e.jsxs("div",{className:"ens-card-image-container",children:[e.jsx("img",{src:r,alt:`${a} avatar`,className:"ens-card-image"}),e.jsx("div",{className:"ens-card-badge",children:e.jsx(L,{chain:O,size:25})})]}),e.jsxs("div",{className:"ens-card-body",children:[e.jsx(h,{weight:"bold",children:a}),e.jsxs("div",{className:"ens-card-expiry",children:[e.jsx(W,{name:"clock",size:14}),e.jsxs(h,{size:"sm",children:["Expires ",d]})]})]})]});l.__docgenInfo={description:"",methods:[],displayName:"ENSNameCard",props:{name:{required:!0,tsType:{name:"string"},description:""},imageUrl:{required:!0,tsType:{name:"string"},description:""},expires:{required:!0,tsType:{name:"string"},description:""},chain:{required:!1,tsType:{name:"union",raw:`| "eth"
| "arb"
| "base"
| "bitcoin"
| "matic"
| "op"
| "sol"
| "zora"
| "celo"`,elements:[{name:"literal",value:'"eth"'},{name:"literal",value:'"arb"'},{name:"literal",value:'"base"'},{name:"literal",value:'"bitcoin"'},{name:"literal",value:'"matic"'},{name:"literal",value:'"op"'},{name:"literal",value:'"sol"'},{name:"literal",value:'"zora"'},{name:"literal",value:'"celo"'}]},description:"",defaultValue:{value:'"eth"',computed:!1}},className:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}}}};const M={title:"Components/ENSNameCard",component:l,parameters:{layout:"centered",docs:{description:{component:`
# ENSNameCard

A card component for displaying ENS name details, including avatar, name, expiry, and chain badge.

## Features

- **Avatar Display**: Shows ENS name avatar with chain badge overlay
- **Name Display**: Bold text display of the ENS name
- **Expiry Information**: Shows expiration date with clock icon
- **Chain Badge**: Displays the blockchain network icon (eth, arb, base, etc.)
- **Customizable**: Supports custom className for styling

## Usage

\`\`\`tsx
import { ENSNameCard } from '@/components/ens-names-card/EnsNameCard';

<ENSNameCard
  name="example.eth"
  imageUrl="https://example.com/avatar.png"
  expires="2026-12-31"
  chain="eth"
/>
\`\`\`
        `}}},argTypes:{name:{control:"text",description:"ENS name (e.g., 'example.eth')"},imageUrl:{control:"text",description:"Avatar image URL"},expires:{control:"text",description:"Expiry date (e.g., '2026-12-31')"},chain:{control:{type:"select"},options:["eth","arb","base","bitcoin","matic","op","sol","zora","celo"],description:"Blockchain network chain name"},className:{control:"text",description:"Additional CSS classes"}},args:{name:"example.eth",imageUrl:"https://avatars.githubusercontent.com/u/123456?v=4",expires:"2026-12-31",chain:"eth"},tags:["autodocs"]},t={args:{name:"artii.eth",imageUrl:"https://avatars.githubusercontent.com/u/123456?v=4",expires:"2026-12-31",chain:"eth"},parameters:{docs:{description:{story:"Default ENSNameCard with Ethereum chain badge."}}}},s={args:{name:"jane.eth",imageUrl:"https://avatars.githubusercontent.com/u/789012?v=4",expires:"2027-05-20",chain:"arb"},parameters:{docs:{description:{story:"ENSNameCard with Arbitrum chain badge."}}}},n={args:{name:"alice.eth",imageUrl:"https://avatars.githubusercontent.com/u/345678?v=4",expires:"2028-01-15",chain:"base"},parameters:{docs:{description:{story:"ENSNameCard with Base chain badge."}}}},i={args:{name:"bob.eth",imageUrl:"https://avatars.githubusercontent.com/u/456789?v=4",expires:"2027-11-30",chain:"op"},parameters:{docs:{description:{story:"ENSNameCard with Optimism chain badge."}}}},o={args:{name:"charlie.eth",imageUrl:"https://avatars.githubusercontent.com/u/567890?v=4",expires:"2026-08-22",chain:"matic"},parameters:{docs:{description:{story:"ENSNameCard with Polygon chain badge."}}}},c={args:{name:"verylongensnameexample.eth",imageUrl:"https://avatars.githubusercontent.com/u/678901?v=4",expires:"2027-03-10",chain:"eth"},parameters:{docs:{description:{story:"ENSNameCard with a longer ENS name to test text wrapping."}}}},m={render:()=>e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:"1.5rem",maxWidth:"800px"},children:["eth","arb","base","bitcoin","matic","op","sol","zora","celo"].map((a,r)=>e.jsx(l,{name:`example${r+1}.eth`,imageUrl:`https://avatars.githubusercontent.com/u/${123456+r}?v=4`,expires:"2026-12-31",chain:a},a))}),parameters:{layout:"padded",docs:{description:{story:"Showcase of ENSNameCard with all available chain badges."}}}},p={args:{name:"custom.eth",imageUrl:"https://avatars.githubusercontent.com/u/789012?v=4",expires:"2027-09-15",chain:"eth",className:"custom-ens-card"},parameters:{docs:{description:{story:"ENSNameCard with custom className for additional styling."}}}};var u,g,N;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    name: "artii.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/123456?v=4",
    expires: "2026-12-31",
    chain: "eth"
  },
  parameters: {
    docs: {
      description: {
        story: "Default ENSNameCard with Ethereum chain badge."
      }
    }
  }
}`,...(N=(g=t.parameters)==null?void 0:g.docs)==null?void 0:N.source}}};var x,b,v;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    name: "jane.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/789012?v=4",
    expires: "2027-05-20",
    chain: "arb"
  },
  parameters: {
    docs: {
      description: {
        story: "ENSNameCard with Arbitrum chain badge."
      }
    }
  }
}`,...(v=(b=s.parameters)==null?void 0:b.docs)==null?void 0:v.source}}};var y,S,C;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    name: "alice.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/345678?v=4",
    expires: "2028-01-15",
    chain: "base"
  },
  parameters: {
    docs: {
      description: {
        story: "ENSNameCard with Base chain badge."
      }
    }
  }
}`,...(C=(S=n.parameters)==null?void 0:S.docs)==null?void 0:C.source}}};var E,f,w;i.parameters={...i.parameters,docs:{...(E=i.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    name: "bob.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/456789?v=4",
    expires: "2027-11-30",
    chain: "op"
  },
  parameters: {
    docs: {
      description: {
        story: "ENSNameCard with Optimism chain badge."
      }
    }
  }
}`,...(w=(f=i.parameters)==null?void 0:f.docs)==null?void 0:w.source}}};var U,j,T;o.parameters={...o.parameters,docs:{...(U=o.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    name: "charlie.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/567890?v=4",
    expires: "2026-08-22",
    chain: "matic"
  },
  parameters: {
    docs: {
      description: {
        story: "ENSNameCard with Polygon chain badge."
      }
    }
  }
}`,...(T=(j=o.parameters)==null?void 0:j.docs)==null?void 0:T.source}}};var A,z,k;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    name: "verylongensnameexample.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/678901?v=4",
    expires: "2027-03-10",
    chain: "eth"
  },
  parameters: {
    docs: {
      description: {
        story: "ENSNameCard with a longer ENS name to test text wrapping."
      }
    }
  }
}`,...(k=(z=c.parameters)==null?void 0:z.docs)==null?void 0:k.source}}};var q,B,D;m.parameters={...m.parameters,docs:{...(q=m.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
    maxWidth: "800px"
  }}>
      {(["eth", "arb", "base", "bitcoin", "matic", "op", "sol", "zora", "celo"] as ChainName[]).map((chain, index) => <ENSNameCard key={chain} name={\`example\${index + 1}.eth\`} imageUrl={\`https://avatars.githubusercontent.com/u/\${123456 + index}?v=4\`} expires="2026-12-31" chain={chain} />)}
    </div>,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Showcase of ENSNameCard with all available chain badges."
      }
    }
  }
}`,...(D=(B=m.parameters)==null?void 0:B.docs)==null?void 0:D.source}}};var $,I,R;p.parameters={...p.parameters,docs:{...($=p.parameters)==null?void 0:$.docs,source:{originalSource:`{
  args: {
    name: "custom.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/789012?v=4",
    expires: "2027-09-15",
    chain: "eth",
    className: "custom-ens-card"
  },
  parameters: {
    docs: {
      description: {
        story: "ENSNameCard with custom className for additional styling."
      }
    }
  }
}`,...(R=(I=p.parameters)==null?void 0:I.docs)==null?void 0:R.source}}};const Q=["Default","Arbitrum","Base","Optimism","Polygon","LongName","AllChains","WithCustomClassName"];export{m as AllChains,s as Arbitrum,n as Base,t as Default,c as LongName,i as Optimism,o as Polygon,p as WithCustomClassName,Q as __namedExportsOrder,M as default};
