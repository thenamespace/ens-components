import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{r}from"./index-BUSIDwT2.js";import{B as a}from"./Button-BScpP696.js";import{T as p}from"./Text-DmuCryDF.js";import"./index-yBjzXJbu.js";const c=({isOpen:n,onClose:o,title:t,children:O,footer:u,size:j="md",isDismissDisabled:s,titleId:m,className:T="",style:w})=>{const f=r.useRef(null),R=r.useRef(null);r.useEffect(()=>{if(!n||s)return;const i=_=>{_.key==="Escape"&&o()};return window.addEventListener("keydown",i),()=>window.removeEventListener("keydown",i)},[n,s,o]);const N=i=>{s||i.target===f.current&&o()};if(!n)return null;const k=`ns-modal--${j}`,b=["ns-modal",T,k].filter(Boolean).join(" ");return e.jsx("div",{ref:f,className:"ns-modal-overlay",onMouseDown:N,"aria-hidden":!n,children:e.jsxs("div",{ref:R,className:b,role:"dialog","aria-modal":"true","aria-labelledby":t?m||"ns-modal-title":void 0,style:w,children:[(t||!s)&&e.jsxs("div",{className:"ns-modal__header",children:[t&&e.jsx("div",{className:"ns-modal__title",id:m||"ns-modal-title",children:typeof t=="string"?e.jsx(p,{size:"lg",weight:"medium",children:t}):t}),!s&&e.jsx("button",{className:"ns-modal__close","aria-label":"Close",onClick:o,children:"×"})]}),e.jsx("div",{className:"ns-modal__body",children:O}),e.jsx("div",{className:"ns-modal__footer",children:u!==void 0?u:e.jsx(a,{variant:"outline",onClick:o,children:"Close"})})]})})};c.__docgenInfo={description:"",methods:[],displayName:"Modal",props:{isOpen:{required:!0,tsType:{name:"boolean"},description:""},onClose:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},title:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},footer:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Optional footer content. If not provided, a default Close button is shown."},size:{required:!1,tsType:{name:"union",raw:'"sm" | "md" | "lg"',elements:[{name:"literal",value:'"sm"'},{name:"literal",value:'"md"'},{name:"literal",value:'"lg"'}]},description:"Width preset for the dialog",defaultValue:{value:'"md"',computed:!1}},isDismissDisabled:{required:!1,tsType:{name:"boolean"},description:"Disable closing on overlay click and Escape"},titleId:{required:!1,tsType:{name:"string"},description:"Optional id for the title element to improve accessibility"},className:{required:!1,tsType:{name:"string"},description:"Additional className for the container",defaultValue:{value:'""',computed:!1}},style:{required:!1,tsType:{name:"ReactCSSProperties",raw:"React.CSSProperties"},description:"Optional styles for the dialog container"}}};const z={title:"Molecules/Modal",component:c,parameters:{layout:"padded"},argTypes:{isOpen:{control:{type:"boolean"},description:"Controls visibility"},title:{control:{type:"text"},description:"Modal title (string or node)"},size:{control:{type:"radio"},options:["sm","md","lg"],description:"Dialog width preset"},isDismissDisabled:{control:{type:"boolean"},description:"Disable overlay/Escape close"},footer:{control:!1,description:"Custom footer content"},onClose:{action:"closed",description:"Called when modal requests to close"}}},l={render:n=>{const[o,t]=r.useState(!0);return e.jsxs(e.Fragment,{children:[e.jsx(a,{onClick:()=>t(!0),children:"Open modal"}),e.jsx(c,{...n,isOpen:o,onClose:()=>t(!1),title:n.title??"Example modal",children:e.jsx(p,{children:"This is a modal. Use it to present important information or request user actions."})})]})},args:{isOpen:!0,size:"md"}},d={render:n=>{const[o,t]=r.useState(!0);return e.jsxs(e.Fragment,{children:[e.jsx(a,{onClick:()=>t(!0),children:"Open modal"}),e.jsx(c,{...n,isOpen:o,onClose:()=>t(!1),title:"Delete item",footer:e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsx(a,{variant:"outline",onClick:()=>t(!1),children:"Cancel"}),e.jsx(a,{onClick:()=>t(!1),children:"Delete"})]}),children:e.jsx(p,{children:"Are you sure you want to delete this item? This action cannot be undone."})})]})},args:{isOpen:!0,size:"sm"}};var h,y,g;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: args => {
    const [open, setOpen] = useState(true);
    return <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal {...args} isOpen={open} onClose={() => setOpen(false)} title={args.title ?? "Example modal"}>
          <Text>
            This is a modal. Use it to present important information or request
            user actions.
          </Text>
        </Modal>
      </>;
  },
  args: {
    isOpen: true,
    size: "md"
  }
}`,...(g=(y=l.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var x,v,C;d.parameters={...d.parameters,docs:{...(x=d.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: args => {
    const [open, setOpen] = useState(true);
    return <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal {...args} isOpen={open} onClose={() => setOpen(false)} title="Delete item" footer={<div style={{
        display: "flex",
        gap: 8
      }}>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Delete</Button>
            </div>}>
          <Text>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </Text>
        </Modal>
      </>;
  },
  args: {
    isOpen: true,
    size: "sm"
  }
}`,...(C=(v=d.parameters)==null?void 0:v.docs)==null?void 0:C.source}}};const D=["Default","WithCustomFooter"];export{l as Default,d as WithCustomFooter,D as __namedExportsOrder,z as default};
