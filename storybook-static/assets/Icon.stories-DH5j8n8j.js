import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{I as n}from"./Icon-D7kVSi4N.js";import"./index-yBjzXJbu.js";import"./index-BUSIDwT2.js";const z={title:"Atoms/Icon",component:n,parameters:{layout:"centered",docs:{description:{component:"Icon component with support for various icon types and custom styling."}}},args:{name:"person",size:24,color:"currentColor"},tags:["autodocs"]},o={render:()=>e.jsxs("div",{style:{maxWidth:"600px",margin:"0 auto",padding:"24px"},children:[e.jsx("h2",{children:"Component Documentation"}),e.jsx("h3",{children:"Key Props"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"name"})," - Icon name (IconName)"]}),e.jsxs("li",{children:[e.jsx("code",{children:"size"})," - Icon size in pixels (number, default: 24)"]}),e.jsxs("li",{children:[e.jsx("code",{children:"color"})," - Icon color (string, default: 'currentColor')"]}),e.jsxs("li",{children:[e.jsx("code",{children:"className"})," - Additional CSS classes (string)"]})]}),e.jsx("h3",{children:"Usage Examples"}),e.jsx("pre",{style:{backgroundColor:"#f5f5f5",padding:"16px",borderRadius:"8px",overflow:"auto"},children:`// Basic icon
<Icon name="person" />

// With custom size and color
<Icon name="check-circle" size={32} color="#22c55e" />

// Social media icon
<Icon name="github" size={24} />`})]}),parameters:{docs:{description:{story:"Documentation for the Icon component."}}}},s={render:()=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap"},children:[e.jsx(n,{name:"person",size:24}),e.jsx(n,{name:"search",size:24}),e.jsx(n,{name:"globe",size:24}),e.jsx(n,{name:"mail",size:24}),e.jsx(n,{name:"check-circle",size:24}),e.jsx(n,{name:"x-circle",size:24})]}),parameters:{docs:{description:{story:"Common UI icons."}}}},r={render:()=>e.jsxs("div",{style:{display:"flex",gap:"1rem",alignItems:"center"},children:[e.jsx(n,{name:"twitter",size:24}),e.jsx(n,{name:"discord",size:24}),e.jsx(n,{name:"github",size:24}),e.jsx(n,{name:"telegram",size:24})]}),parameters:{docs:{description:{story:"Social media icons."}}}};var c,i,a;o.parameters={...o.parameters,docs:{...(c=o.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <div style={{
    maxWidth: "600px",
    margin: "0 auto",
    padding: "24px"
  }}>
      <h2>Component Documentation</h2>

      <h3>Key Props</h3>
      <ul>
        <li>
          <code>name</code> - Icon name (IconName)
        </li>
        <li>
          <code>size</code> - Icon size in pixels (number, default: 24)
        </li>
        <li>
          <code>color</code> - Icon color (string, default: 'currentColor')
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
        {\`// Basic icon
<Icon name="person" />

// With custom size and color
<Icon name="check-circle" size={32} color="#22c55e" />

// Social media icon
<Icon name="github" size={24} />\`}
      </pre>
    </div>,
  parameters: {
    docs: {
      description: {
        story: "Documentation for the Icon component."
      }
    }
  }
}`,...(a=(i=o.parameters)==null?void 0:i.docs)==null?void 0:a.source}}};var t,m,d;s.parameters={...s.parameters,docs:{...(t=s.parameters)==null?void 0:t.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap"
  }}>
      <Icon name="person" size={24} />
      <Icon name="search" size={24} />
      <Icon name="globe" size={24} />
      <Icon name="mail" size={24} />
      <Icon name="check-circle" size={24} />
      <Icon name="x-circle" size={24} />
    </div>,
  parameters: {
    docs: {
      description: {
        story: "Common UI icons."
      }
    }
  }
}`,...(d=(m=s.parameters)==null?void 0:m.docs)==null?void 0:d.source}}};var l,p,x;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "1rem",
    alignItems: "center"
  }}>
      <Icon name="twitter" size={24} />
      <Icon name="discord" size={24} />
      <Icon name="github" size={24} />
      <Icon name="telegram" size={24} />
    </div>,
  parameters: {
    docs: {
      description: {
        story: "Social media icons."
      }
    }
  }
}`,...(x=(p=r.parameters)==null?void 0:p.docs)==null?void 0:x.source}}};const j=["ComponentDocs","CommonIcons","SocialIcons"];export{s as CommonIcons,o as ComponentDocs,r as SocialIcons,j as __namedExportsOrder,z as default};
