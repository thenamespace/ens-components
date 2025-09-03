import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{T as r}from"./Text-BfCvshFU.js";import"./index-yBjzXJbu.js";const b={title:"Atoms/Text",component:r,args:{children:"Sample text content"}},t={},i={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:[e.jsx(r,{size:"sm",children:"Small text"}),e.jsx(r,{size:"md",children:"Medium text"}),e.jsx(r,{size:"lg",children:"Large text"}),e.jsx(r,{size:"xl",children:"Extra large text"})]})},l={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:[e.jsx(r,{weight:"light",children:"Light weight text"}),e.jsx(r,{weight:"regular",children:"Regular weight text"}),e.jsx(r,{weight:"medium",children:"Medium weight text"}),e.jsx(r,{weight:"bold",children:"Bold weight text"})]})},s={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:[e.jsx(r,{color:"primary",children:"Primary color text"}),e.jsx(r,{color:"grey",children:"Grey color text"}),e.jsx("div",{style:{background:"#333",padding:"0.5rem"},children:e.jsx(r,{color:"white",children:"White color text"})})]})},o={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:[e.jsx(r,{size:"xl",weight:"bold",color:"primary",children:"Large bold primary text"}),e.jsx(r,{size:"lg",weight:"medium",color:"grey",children:"Large medium grey text"}),e.jsx(r,{size:"sm",weight:"light",color:"primary",children:"Small light primary text"})]})};var n,a,x;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:"{}",...(x=(a=t.parameters)==null?void 0:a.docs)==null?void 0:x.source}}};var c,d,m;i.parameters={...i.parameters,docs:{...(c=i.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  }}>
      <Text size="sm">Small text</Text>
      <Text size="md">Medium text</Text>
      <Text size="lg">Large text</Text>
      <Text size="xl">Extra large text</Text>
    </div>
}`,...(m=(d=i.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var g,h,p;l.parameters={...l.parameters,docs:{...(g=l.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  }}>
      <Text weight="light">Light weight text</Text>
      <Text weight="regular">Regular weight text</Text>
      <Text weight="medium">Medium weight text</Text>
      <Text weight="bold">Bold weight text</Text>
    </div>
}`,...(p=(h=l.parameters)==null?void 0:h.docs)==null?void 0:p.source}}};var u,y,T;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  }}>
      <Text color="primary">Primary color text</Text>
      <Text color="grey">Grey color text</Text>
      <div style={{
      background: "#333",
      padding: "0.5rem"
    }}>
        <Text color="white">White color text</Text>
      </div>
    </div>
}`,...(T=(y=s.parameters)==null?void 0:y.docs)==null?void 0:T.source}}};var w,f,j;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  }}>
      <Text size="xl" weight="bold" color="primary">
        Large bold primary text
      </Text>
      <Text size="lg" weight="medium" color="grey">
        Large medium grey text
      </Text>
      <Text size="sm" weight="light" color="primary">
        Small light primary text
      </Text>
    </div>
}`,...(j=(f=o.parameters)==null?void 0:f.docs)==null?void 0:j.source}}};const D=["Default","Sizes","Weights","Colors","Combinations"];export{s as Colors,o as Combinations,t as Default,i as Sizes,l as Weights,D as __namedExportsOrder,b as default};
