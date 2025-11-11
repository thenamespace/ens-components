import{j as r}from"./jsx-runtime-Cf8x2fCZ.js";import{r as a}from"./index-BUSIDwT2.js";import{B as L}from"./Button-BScpP696.js";import"./index-yBjzXJbu.js";const q=({trigger:D,children:S,placement:$="bottom",align:A="start",disabled:d=!1,dataTestId:I})=>{const[t,l]=a.useState(!1),u=a.useRef(null),m=a.useRef(null),g=a.useCallback(()=>{d||l(e=>!e)},[d]),p=a.useCallback(e=>{u.current&&!u.current.contains(e.target)&&m.current&&!m.current.contains(e.target)&&l(!1)},[]);a.useEffect(()=>(t&&(document.addEventListener("mousedown",p),document.addEventListener("keydown",e=>{e.key==="Escape"&&l(!1)})),()=>{document.removeEventListener("mousedown",p)}),[t,p]);const M=()=>{const e=`ns-dropdown--${$}`,O=`ns-dropdown--align-${A}`;return`${e} ${O}`};return r.jsxs("div",{className:"ns-dropdown","data-test-id":I,children:[r.jsx("div",{ref:u,className:"ns-dropdown__trigger",onClick:g,role:"button",tabIndex:d?-1:0,"aria-expanded":t,"aria-haspopup":"true",onKeyDown:e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),g())},children:D}),t&&r.jsx("div",{ref:m,className:`ns-dropdown__menu ${M()}`,role:"menu","aria-orientation":"vertical",children:S})]})};q.__docgenInfo={description:"",methods:[],displayName:"Dropdown",props:{trigger:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},placement:{required:!1,tsType:{name:"union",raw:'"top" | "bottom" | "left" | "right"',elements:[{name:"literal",value:'"top"'},{name:"literal",value:'"bottom"'},{name:"literal",value:'"left"'},{name:"literal",value:'"right"'}]},description:"",defaultValue:{value:'"bottom"',computed:!1}},align:{required:!1,tsType:{name:"union",raw:'"start" | "center" | "end"',elements:[{name:"literal",value:'"start"'},{name:"literal",value:'"center"'},{name:"literal",value:'"end"'}]},description:"",defaultValue:{value:'"start"',computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},dataTestId:{required:!1,tsType:{name:"string"},description:""},closeCallback:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};const z={title:"Molecules/Dropdown",component:q,args:{trigger:r.jsx(L,{children:"Click me"}),children:r.jsxs("div",{style:{padding:"1rem"},children:[r.jsx("div",{children:"Menu item 1"}),r.jsx("div",{children:"Menu item 2"}),r.jsx("div",{children:"Menu item 3"})]})}},n={},s={args:{placement:"top"}},o={args:{align:"center"}},i={args:{align:"end"}},c={args:{trigger:r.jsx("div",{style:{padding:"0.5rem 1rem",background:"var(--ns-color-primary)",color:"var(--ns-color-primary-contrast)",borderRadius:"var(--ns-radius-md)",cursor:"pointer"},children:"Custom Trigger"})}};var f,v,y;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:"{}",...(y=(v=n.parameters)==null?void 0:v.docs)==null?void 0:y.source}}};var h,w,R;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    placement: "top"
  }
}`,...(R=(w=s.parameters)==null?void 0:w.docs)==null?void 0:R.source}}};var x,C,T;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    align: "center"
  }
}`,...(T=(C=o.parameters)==null?void 0:C.docs)==null?void 0:T.source}}};var b,k,j;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    align: "end"
  }
}`,...(j=(k=i.parameters)==null?void 0:k.docs)==null?void 0:j.source}}};var E,N,_;c.parameters={...c.parameters,docs:{...(E=c.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    trigger: <div style={{
      padding: "0.5rem 1rem",
      background: "var(--ns-color-primary)",
      color: "var(--ns-color-primary-contrast)",
      borderRadius: "var(--ns-radius-md)",
      cursor: "pointer"
    }}>
        Custom Trigger
      </div>
  }
}`,...(_=(N=c.parameters)==null?void 0:N.docs)==null?void 0:_.source}}};const F=["Default","TopPlacement","CenterAligned","RightAligned","CustomTrigger"];export{o as CenterAligned,c as CustomTrigger,n as Default,i as RightAligned,s as TopPlacement,F as __namedExportsOrder,z as default};
