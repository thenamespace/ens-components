import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{B as t}from"./Button-BScpP696.js";import{I as s}from"./Icon-D2aLcssT.js";import"./index-yBjzXJbu.js";import"./index-BUSIDwT2.js";const b={title:"Atoms/Button",component:t,parameters:{layout:"centered",docs:{description:{component:"A versatile button component with support for icons, loading states, and multiple variants."}}},argTypes:{variant:{control:{type:"select"},options:["solid","outline","ghost"],description:"Visual style variant of the button"},size:{control:{type:"select"},options:["sm","md","lg"],description:"Size of the button"},loading:{control:{type:"boolean"},description:"Whether the button is in a loading state"},disabled:{control:{type:"boolean"},description:"Whether the button is disabled"},prefix:{control:!1,description:"Icon or component to display before the button text"}},args:{children:"Button"},tags:["autodocs"]},o={render:()=>e.jsxs("div",{style:{maxWidth:"600px",margin:"0 auto",padding:"24px"},children:[e.jsx("h2",{children:"Component Documentation"}),e.jsx("h3",{children:"Key Props"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"variant"})," - Style: 'solid', 'outline', 'ghost' (default: 'solid')"]}),e.jsxs("li",{children:[e.jsx("code",{children:"size"})," - Size: 'sm', 'md', 'lg' (default: 'md')"]}),e.jsxs("li",{children:[e.jsx("code",{children:"loading"})," - Show loading spinner (boolean)"]}),e.jsxs("li",{children:[e.jsx("code",{children:"disabled"})," - Disable button (boolean)"]}),e.jsxs("li",{children:[e.jsx("code",{children:"prefix"})," - Icon or component before text (ReactNode)"]})]}),e.jsx("h3",{children:"Usage Examples"}),e.jsx("pre",{style:{backgroundColor:"#f5f5f5",padding:"16px",borderRadius:"8px",overflow:"auto"},children:`// Basic button
<Button>Click me</Button>

// With icon
<Button prefix={<Icon name="check-circle" />}>
  Success
</Button>

// Loading state
<Button loading>Processing...</Button>`})]}),parameters:{docs:{description:{story:"Documentation for the Button component."}}}},n={render:()=>e.jsxs("div",{style:{display:"flex",gap:12,alignItems:"center"},children:[e.jsx(t,{variant:"solid",children:"Solid"}),e.jsx(t,{variant:"outline",children:"Outline"}),e.jsx(t,{variant:"ghost",children:"Ghost"})]}),parameters:{docs:{description:{story:"Button variants: solid, outline, and ghost."}}}},i={render:()=>e.jsxs("div",{style:{display:"flex",gap:12,alignItems:"center"},children:[e.jsx(t,{prefix:e.jsx(s,{name:"check-circle"}),children:"Success"}),e.jsx(t,{prefix:e.jsx(s,{name:"x-circle"}),variant:"outline",children:"Error"}),e.jsx(t,{prefix:e.jsx(s,{name:"search"})})]}),parameters:{docs:{description:{story:"Buttons with icons and icon-only buttons."}}}};var r,a,c;o.parameters={...o.parameters,docs:{...(r=o.parameters)==null?void 0:r.docs,source:{originalSource:`{
  render: () => <div style={{
    maxWidth: "600px",
    margin: "0 auto",
    padding: "24px"
  }}>
      <h2>Component Documentation</h2>

      <h3>Key Props</h3>
      <ul>
        <li>
          <code>variant</code> - Style: 'solid', 'outline', 'ghost' (default:
          'solid')
        </li>
        <li>
          <code>size</code> - Size: 'sm', 'md', 'lg' (default: 'md')
        </li>
        <li>
          <code>loading</code> - Show loading spinner (boolean)
        </li>
        <li>
          <code>disabled</code> - Disable button (boolean)
        </li>
        <li>
          <code>prefix</code> - Icon or component before text (ReactNode)
        </li>
      </ul>

      <h3>Usage Examples</h3>
      <pre style={{
      backgroundColor: "#f5f5f5",
      padding: "16px",
      borderRadius: "8px",
      overflow: "auto"
    }}>
        {\`// Basic button
<Button>Click me</Button>

// With icon
<Button prefix={<Icon name="check-circle" />}>
  Success
</Button>

// Loading state
<Button loading>Processing...</Button>\`}
      </pre>
    </div>,
  parameters: {
    docs: {
      description: {
        story: "Documentation for the Button component."
      }
    }
  }
}`,...(c=(a=o.parameters)==null?void 0:a.docs)==null?void 0:c.source}}};var d,l,p;n.parameters={...n.parameters,docs:{...(d=n.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: 12,
    alignItems: "center"
  }}>
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>,
  parameters: {
    docs: {
      description: {
        story: "Button variants: solid, outline, and ghost."
      }
    }
  }
}`,...(p=(l=n.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};var u,m,h;i.parameters={...i.parameters,docs:{...(u=i.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: 12,
    alignItems: "center"
  }}>
      <Button prefix={<Icon name="check-circle" />}>Success</Button>
      <Button prefix={<Icon name="x-circle" />} variant="outline">
        Error
      </Button>
      <Button prefix={<Icon name="search" />} />
    </div>,
  parameters: {
    docs: {
      description: {
        story: "Buttons with icons and icon-only buttons."
      }
    }
  }
}`,...(h=(m=i.parameters)==null?void 0:m.docs)==null?void 0:h.source}}};const j=["ComponentDocs","Variants","WithPrefix"];export{o as ComponentDocs,n as Variants,i as WithPrefix,j as __namedExportsOrder,b as default};
