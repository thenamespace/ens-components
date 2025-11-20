import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{I as p}from"./Icon-D2aLcssT.js";import"./index-yBjzXJbu.js";import"./index-BUSIDwT2.js";const O={error:{icon:"x-circle",colorClass:"ns-alert-error"},warning:{icon:"alert-triangle",colorClass:"ns-alert-warning"},info:{icon:"info",colorClass:"ns-alert-info"},success:{icon:"check-circle",colorClass:"ns-alert-success"}},s=({variant:z="info",children:X,className:$="",onClose:d,dismissible:M=!1,title:m})=>{const u=O[z];return e.jsx("div",{className:`ns-alert ${u.colorClass} ${$}`,role:"alert",children:e.jsxs("div",{className:"ns-alert-content",children:[e.jsx("div",{className:"ns-alert-icon",children:e.jsx(p,{name:u.icon,size:20})}),e.jsxs("div",{className:"ns-alert-message",children:[m&&e.jsx("div",{className:"ns-alert-title",children:m}),e.jsx("div",{className:"ns-alert-description",children:X})]}),M&&d&&e.jsx("button",{className:"ns-alert-close",onClick:d,"aria-label":"Close alert",type:"button",children:e.jsx(p,{name:"x",size:16})})]})})};s.__docgenInfo={description:"",methods:[],displayName:"Alert",props:{variant:{required:!1,tsType:{name:"union",raw:'"error" | "warning" | "info" | "success"',elements:[{name:"literal",value:'"error"'},{name:"literal",value:'"warning"'},{name:"literal",value:'"info"'},{name:"literal",value:'"success"'}]},description:"",defaultValue:{value:'"info"',computed:!1}},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}},onClose:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},dismissible:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},title:{required:!1,tsType:{name:"string"},description:""}}};const J={title:"Molecules/Alert",component:s,parameters:{layout:"padded"},argTypes:{variant:{control:{type:"select"},options:["error","warning","info","success"]},dismissible:{control:{type:"boolean"}},title:{control:{type:"text"}}}},r={args:{variant:"error",children:"This is an error message that indicates something went wrong.",title:"Error"}},a={args:{variant:"warning",children:"This is a warning message that indicates a potential issue.",title:"Warning"}},n={args:{variant:"info",children:"This is an informational message that provides helpful context.",title:"Information"}},i={args:{variant:"success",children:"This is a success message that indicates something completed successfully.",title:"Success"}},t={args:{variant:"info",children:"This is an alert without a title."}},o={args:{variant:"warning",children:"This is a dismissible alert. Click the X to close it.",title:"Dismissible Alert",dismissible:!0,onClose:()=>alert("Alert closed!")}},l={args:{variant:"info",children:"This is a longer alert message that demonstrates how the component handles multiple lines of text. It should wrap properly and maintain good readability while preserving the visual hierarchy and spacing.",title:"Long Content Example"}},c={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsx(s,{variant:"error",title:"Error",children:"This is an error message."}),e.jsx(s,{variant:"warning",title:"Warning",children:"This is a warning message."}),e.jsx(s,{variant:"info",title:"Info",children:"This is an info message."}),e.jsx(s,{variant:"success",title:"Success",children:"This is a success message."})]})};var g,h,f;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    variant: "error",
    children: "This is an error message that indicates something went wrong.",
    title: "Error"
  }
}`,...(f=(h=r.parameters)==null?void 0:h.docs)==null?void 0:f.source}}};var v,x,T;a.parameters={...a.parameters,docs:{...(v=a.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    variant: "warning",
    children: "This is a warning message that indicates a potential issue.",
    title: "Warning"
  }
}`,...(T=(x=a.parameters)==null?void 0:x.docs)==null?void 0:T.source}}};var w,y,b;n.parameters={...n.parameters,docs:{...(w=n.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    variant: "info",
    children: "This is an informational message that provides helpful context.",
    title: "Information"
  }
}`,...(b=(y=n.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};var A,j,C;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    variant: "success",
    children: "This is a success message that indicates something completed successfully.",
    title: "Success"
  }
}`,...(C=(j=i.parameters)==null?void 0:j.docs)==null?void 0:C.source}}};var S,I,N;t.parameters={...t.parameters,docs:{...(S=t.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    variant: "info",
    children: "This is an alert without a title."
  }
}`,...(N=(I=t.parameters)==null?void 0:I.docs)==null?void 0:N.source}}};var E,W,q;o.parameters={...o.parameters,docs:{...(E=o.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    variant: "warning",
    children: "This is a dismissible alert. Click the X to close it.",
    title: "Dismissible Alert",
    dismissible: true,
    onClose: () => alert("Alert closed!")
  }
}`,...(q=(W=o.parameters)==null?void 0:W.docs)==null?void 0:q.source}}};var D,R,V;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    variant: "info",
    children: "This is a longer alert message that demonstrates how the component handles multiple lines of text. It should wrap properly and maintain good readability while preserving the visual hierarchy and spacing.",
    title: "Long Content Example"
  }
}`,...(V=(R=l.parameters)==null?void 0:R.docs)==null?void 0:V.source}}};var k,L,_;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  }}>
      <Alert variant="error" title="Error">
        This is an error message.
      </Alert>
      <Alert variant="warning" title="Warning">
        This is a warning message.
      </Alert>
      <Alert variant="info" title="Info">
        This is an info message.
      </Alert>
      <Alert variant="success" title="Success">
        This is a success message.
      </Alert>
    </div>
}`,...(_=(L=c.parameters)==null?void 0:L.docs)==null?void 0:_.source}}};const K=["Error","Warning","Info","Success","WithoutTitle","Dismissible","LongContent","AllVariants"];export{c as AllVariants,o as Dismissible,r as Error,n as Info,l as LongContent,i as Success,a as Warning,t as WithoutTitle,K as __namedExportsOrder,J as default};
