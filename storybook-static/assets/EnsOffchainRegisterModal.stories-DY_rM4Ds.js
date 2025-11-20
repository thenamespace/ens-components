import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{r as d}from"./index-BUSIDwT2.js";import{e as xe,f as be,n as Ne,C as je}from"./finish-BFmWkJaE.js";import{I as y}from"./Icon-D2aLcssT.js";import{T as f}from"./Text-DmuCryDF.js";import{I as Ce}from"./Input-Bq4XNRC6.js";import{B as P}from"./Button-BScpP696.js";import"./index-yBjzXJbu.js";function z({name:a,onNameChange:t,onCancel:o,onRegister:c,onClose:l,isNameAvailable:h}){const[m,p]=d.useState(h),n="particle.eth",x=s=>{if(!s)return"";const r=new RegExp(`\\.${n.replace(".","\\.")}$`,"i");return s.replace(r,"").trim()};d.useEffect(()=>{const s=x(a);if(s&&s.length>0){const r=/^[a-z0-9-]+$/i.test(s)&&s.length>3,g=setTimeout(()=>{p(r)},300);return()=>clearTimeout(g)}else p(void 0)},[a]);const v=h!==void 0?h:m,b=a&&a.length>0&&v!==void 0&&v===!1,u=x(a),N=()=>{t("")},E=s=>{let r=s.target.value;const g=new RegExp(`\\.${n.replace(".","\\.")}$`,"i");r=r.replace(g,""),r=r.replace(/[^a-z0-9-]/gi,""),t(r)};return e.jsxs("div",{className:"ns-offchain-register-card",children:[l&&e.jsx("button",{className:"ns-offchain-register-close-btn",onClick:l,children:e.jsx(y,{name:"x",size:20})}),e.jsx("div",{className:"ns-offchain-register-banner",children:e.jsx("img",{src:xe,alt:"ENS Banner"})}),e.jsx("div",{className:"ns-offchain-register-header",children:e.jsx(f,{size:"lg",weight:"bold",children:"Get your Web3 Username"})}),e.jsxs("div",{className:"ns-offchain-register-input-row",children:[e.jsx(y,{name:"search",size:16,className:"ns-offchain-register-search-icon"}),e.jsx(Ce,{type:"text",className:"ns-offchain-register-input",placeholder:"Find name",value:u,onChange:E}),u&&v&&e.jsx("div",{className:"ns-offchain-register-checkmark available",children:e.jsx(y,{name:"check-circle",size:14,color:"black"})}),u&&b&&e.jsx("button",{className:"ns-offchain-register-clear-btn",onClick:N,type:"button",children:e.jsx(y,{name:"x",size:14,color:"#ffffff"})}),e.jsxs(f,{className:"ns-offchain-register-domain-suffix",children:[".",n]})]}),b&&e.jsxs("div",{className:"ns-offchain-register-unavailable-message",children:[e.jsx(y,{name:"alert-triangle",size:14}),e.jsx(f,{size:"sm",className:"ns-offchain-register-error-text",children:"This name is unavailable. Please choose a different one."})]}),e.jsxs("div",{className:"ns-offchain-register-actions",children:[e.jsx(P,{className:"cancel",onClick:o,children:"Cancel"}),e.jsx(P,{className:"primary",onClick:()=>{const s=u?`${u}.${n}`:"";s&&t(s),c()},disabled:!u||!!b,children:u&&v?"Next":"Register"})]}),e.jsx("div",{className:"ns-offchain-register-footer",children:e.jsx(f,{size:"sm",color:"grey",children:"Powered by Namespace"})})]})}z.__docgenInfo={description:"",methods:[],displayName:"InitialStep",props:{name:{required:!0,tsType:{name:"string"},description:""},onNameChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(name: string) => void",signature:{arguments:[{type:{name:"string"},name:"name"}],return:{name:"void"}}},description:""},onCancel:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onRegister:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onClose:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},isNameAvailable:{required:!1,tsType:{name:"boolean"},description:""}}};function we({name:a,onClose:t,onSetProfile:o,onFinish:c}){return e.jsx("div",{className:"ns-offchain-register-container",children:e.jsxs("div",{className:"ns-offchain-register-card ns-offchain-register-success",children:[t&&e.jsx("button",{className:"ns-offchain-register-close-btn",onClick:t,children:e.jsx(y,{name:"x",size:20})}),e.jsx("div",{className:"ns-offchain-register-finish-banner",children:e.jsx("img",{src:be,alt:"Success"})}),e.jsxs("div",{className:"ns-offchain-register-success-title-section",children:[e.jsx(f,{size:"xl",weight:"bold",className:"ns-offchain-register-success-message",children:"ENS name registered successfully"}),e.jsx(f,{size:"md",color:"grey",className:"ns-offchain-register-success-subtitle",children:"Complete your profile now"})]}),o&&e.jsxs("div",{className:"ns-offchain-register-profile-card",onClick:o,children:[e.jsx("div",{className:"ns-offchain-register-profile-icon",children:e.jsx("img",{src:Ne,alt:"Profile Icon"})}),e.jsxs("div",{className:"ns-offchain-register-profile-text",children:[e.jsx(f,{size:"md",weight:"bold",children:"Complete your profile"}),e.jsx(f,{size:"sm",color:"grey",children:"Make your ENS more discoverable"})]}),e.jsx("button",{className:"ns-offchain-register-profile-arrow",children:e.jsx(je,{size:20})})]}),e.jsx("div",{className:"ns-offchain-register-actions",children:e.jsx(P,{className:"primary finish-btn",onClick:c||t,children:"Finish"})})]})})}we.__docgenInfo={description:"",methods:[],displayName:"OffchainSuccessScreen",props:{name:{required:!0,tsType:{name:"string"},description:""},onClose:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onSetProfile:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onFinish:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};function O({step:a=0,name:t="",profileComplete:o=!1,onStepChange:c,onNameChange:l,onProfileCompleteChange:h,onRegister:m,onCancel:p,onClose:n,onCompleteProfile:x,onOpenWallet:v,onCompleteRegistration:Se,onRegisterAnother:b,onViewName:u}){const[N,E]=d.useState(a),[s,r]=d.useState(t),g=V=>{r(V),l==null||l(V)},A=()=>{E(2),c==null||c(2),m==null||m()},U=()=>{p==null||p()};return N===0?e.jsx("div",{className:"ns-offchain-register-container",children:e.jsx(z,{name:s,onNameChange:g,onCancel:U,onRegister:A,onClose:n})}):N===2?e.jsx(we,{name:s,onClose:n,onSetProfile:x,onFinish:n}):e.jsx("div",{className:"ns-offchain-register-container",children:e.jsx(z,{name:s,onNameChange:g,onCancel:U,onRegister:A,onClose:n})})}O.__docgenInfo={description:"",methods:[],displayName:"EnsOffChainRegisterModal",props:{step:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},name:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}},profileComplete:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},onStepChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(step: number) => void",signature:{arguments:[{type:{name:"number"},name:"step"}],return:{name:"void"}}},description:""},onNameChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(name: string) => void",signature:{arguments:[{type:{name:"string"},name:"name"}],return:{name:"void"}}},description:""},onProfileCompleteChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(complete: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"complete"}],return:{name:"void"}}},description:""},onRegister:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onCancel:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onClose:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onCompleteProfile:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onOpenWallet:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onCompleteRegistration:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onRegisterAnother:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onViewName:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};const ze={title:"Modals/EnsOffChainRegisterModal",component:O,parameters:{layout:"centered",docs:{description:{component:"A modal component for off-chain ENS name registration. The component has 2 main steps: InitialStep (step 0) for name search and selection, and OffchainSuccessScreen (step 2) shown after successful registration. Click through the steps to see each state."}}}},i=a=>{const[t,o]=d.useState(a.step??0),[c,l]=d.useState(a.name??""),[h,m]=d.useState(a.profileComplete??!1),p=d.useRef(t);return d.useEffect(()=>{p.current=t},[t]),e.jsx(O,{step:t,name:c,profileComplete:h,onStepChange:o,onNameChange:l,onProfileCompleteChange:m,onRegister:()=>{p.current===0&&o(2),alert("Register clicked")},onCancel:()=>alert("Cancel clicked"),onClose:()=>alert("Close clicked"),onCompleteProfile:()=>{m(!0),alert("Complete Profile clicked")},onOpenWallet:()=>alert("Open Wallet clicked"),onCompleteRegistration:()=>alert("Complete Registration clicked"),onRegisterAnother:()=>{l(""),m(!1),o(0),alert("Register Another clicked")},onViewName:()=>alert("View Name clicked")},t)},w={render:()=>e.jsx(i,{step:0,name:"",profileComplete:!1}),parameters:{docs:{description:{story:"Initial step showing the name search interface for off-chain registration. Enter a subname (e.g., 'magier') and it will be registered under particle.eth domain. The button shows 'Register' initially and changes to 'Next' when a name is available."}}}},j={render:()=>e.jsx(i,{step:0,name:"magier",profileComplete:!1}),parameters:{docs:{description:{story:"InitialStep with a pre-filled name. The button will show 'Next' if the name is available (length > 3 and valid characters), or 'Register' if not yet checked."}}}},C={render:()=>e.jsx(i,{step:0,name:"brightwave",profileComplete:!1}),parameters:{docs:{description:{story:"InitialStep with an available name that will show the checkmark and enable the 'Next' button."}}}},T={render:()=>e.jsx(i,{step:0,name:"myverylongensname",profileComplete:!1}),parameters:{docs:{description:{story:"InitialStep with a longer name to test layout and responsiveness. Useful for testing how the component handles longer subnames."}}}},I={render:()=>e.jsx(i,{step:0,name:"abc",profileComplete:!1}),parameters:{docs:{description:{story:"InitialStep showing an unavailable name (names must be longer than 3 characters). The error message will be displayed and the button will be disabled."}}}},k={render:()=>e.jsx(i,{step:0,name:"test@name",profileComplete:!1}),parameters:{docs:{description:{story:"InitialStep showing an invalid name with special characters. Invalid characters are automatically filtered out, but if the resulting name is too short, it will show as unavailable."}}}},S={render:()=>e.jsx(i,{step:2,name:"magier.particle.eth",profileComplete:!1}),parameters:{docs:{description:{story:"Success screen shown after successful off-chain registration. To see this step, start from InitialStep and click Next/Register with an available name. Shows the registered name and options to complete profile or finish."}}}},R={render:()=>e.jsx(i,{step:2,name:"magier.particle.eth",profileComplete:!0}),parameters:{docs:{description:{story:"Success screen with profile completion status. Shows when the user has completed their profile. The profile completion card may not be shown if profile is already complete."}}}},q={render:()=>e.jsx(i,{step:2,name:"myverylongensname.particle.eth",profileComplete:!1}),parameters:{docs:{description:{story:"Success screen with a longer registered name to test layout and text wrapping. Useful for ensuring the component handles longer names gracefully."}}}},W={render:()=>e.jsx(i,{step:2,name:"xyz.particle.eth",profileComplete:!1}),parameters:{docs:{description:{story:"Success screen with a shorter registered name to test layout with minimal text."}}}};var _,$,L,B,M;w.parameters={...w.parameters,docs:{...(_=w.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <Template step={0} name="" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story: "Initial step showing the name search interface for off-chain registration. Enter a subname (e.g., 'magier') and it will be registered under particle.eth domain. The button shows 'Register' initially and changes to 'Next' when a name is available."
      }
    }
  }
}`,...(L=($=w.parameters)==null?void 0:$.docs)==null?void 0:L.source},description:{story:`**Step 0: InitialStep**

The initial step where users search for an ENS subname under the particle.eth domain.
- Enter a subname to check availability
- Shows checkmark when name is available
- Shows error message when name is unavailable
- Button text changes from "Register" to "Next" when name is available
- Click "Next" or "Register" to proceed to success screen`,...(M=(B=w.parameters)==null?void 0:B.docs)==null?void 0:M.description}}};var F,D,G;j.parameters={...j.parameters,docs:{...(F=j.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: () => <Template step={0} name="magier" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story: "InitialStep with a pre-filled name. The button will show 'Next' if the name is available (length > 3 and valid characters), or 'Register' if not yet checked."
      }
    }
  }
}`,...(G=(D=j.parameters)==null?void 0:D.docs)==null?void 0:G.source}}};var H,J,K;C.parameters={...C.parameters,docs:{...(H=C.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => <Template step={0} name="brightwave" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story: "InitialStep with an available name that will show the checkmark and enable the 'Next' button."
      }
    }
  }
}`,...(K=(J=C.parameters)==null?void 0:J.docs)==null?void 0:K.source}}};var Q,X,Y;T.parameters={...T.parameters,docs:{...(Q=T.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  render: () => <Template step={0} name="myverylongensname" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story: "InitialStep with a longer name to test layout and responsiveness. Useful for testing how the component handles longer subnames."
      }
    }
  }
}`,...(Y=(X=T.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,ee,se;I.parameters={...I.parameters,docs:{...(Z=I.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  render: () => <Template step={0} name="abc" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story: "InitialStep showing an unavailable name (names must be longer than 3 characters). The error message will be displayed and the button will be disabled."
      }
    }
  }
}`,...(se=(ee=I.parameters)==null?void 0:ee.docs)==null?void 0:se.source}}};var te,ae,re;k.parameters={...k.parameters,docs:{...(te=k.parameters)==null?void 0:te.docs,source:{originalSource:`{
  render: () => <Template step={0} name="test@name" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story: "InitialStep showing an invalid name with special characters. Invalid characters are automatically filtered out, but if the resulting name is too short, it will show as unavailable."
      }
    }
  }
}`,...(re=(ae=k.parameters)==null?void 0:ae.docs)==null?void 0:re.source}}};var ne,ie,oe,ce,le;S.parameters={...S.parameters,docs:{...(ne=S.parameters)==null?void 0:ne.docs,source:{originalSource:`{
  render: () => <Template step={2} name="magier.particle.eth" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story: "Success screen shown after successful off-chain registration. To see this step, start from InitialStep and click Next/Register with an available name. Shows the registered name and options to complete profile or finish."
      }
    }
  }
}`,...(oe=(ie=S.parameters)==null?void 0:ie.docs)==null?void 0:oe.source},description:{story:`**Step 2: OffchainSuccessScreen**

Shows after successful off-chain registration.
- Displays success message with the registered name
- Shows options to set profile or finish
- Can navigate back or close the modal
- Option to complete profile is shown if onSetProfile callback is provided`,...(le=(ce=S.parameters)==null?void 0:ce.docs)==null?void 0:le.description}}};var me,pe,de;R.parameters={...R.parameters,docs:{...(me=R.parameters)==null?void 0:me.docs,source:{originalSource:`{
  render: () => <Template step={2} name="magier.particle.eth" profileComplete={true} />,
  parameters: {
    docs: {
      description: {
        story: "Success screen with profile completion status. Shows when the user has completed their profile. The profile completion card may not be shown if profile is already complete."
      }
    }
  }
}`,...(de=(pe=R.parameters)==null?void 0:pe.docs)==null?void 0:de.source}}};var ue,fe,he;q.parameters={...q.parameters,docs:{...(ue=q.parameters)==null?void 0:ue.docs,source:{originalSource:`{
  render: () => <Template step={2} name="myverylongensname.particle.eth" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story: "Success screen with a longer registered name to test layout and text wrapping. Useful for ensuring the component handles longer names gracefully."
      }
    }
  }
}`,...(he=(fe=q.parameters)==null?void 0:fe.docs)==null?void 0:he.source}}};var ge,ye,ve;W.parameters={...W.parameters,docs:{...(ge=W.parameters)==null?void 0:ge.docs,source:{originalSource:`{
  render: () => <Template step={2} name="xyz.particle.eth" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story: "Success screen with a shorter registered name to test layout with minimal text."
      }
    }
  }
}`,...(ve=(ye=W.parameters)==null?void 0:ye.docs)==null?void 0:ve.source}}};const Oe=["InitialStep","InitialStepWithName","InitialStepWithAvailableName","InitialStepWithLongName","InitialStepWithUnavailableName","InitialStepWithInvalidName","SuccessScreen","SuccessScreenWithProfile","SuccessScreenWithLongName","SuccessScreenWithShortName"];export{w as InitialStep,C as InitialStepWithAvailableName,k as InitialStepWithInvalidName,T as InitialStepWithLongName,j as InitialStepWithName,I as InitialStepWithUnavailableName,S as SuccessScreen,q as SuccessScreenWithLongName,R as SuccessScreenWithProfile,W as SuccessScreenWithShortName,Oe as __namedExportsOrder,ze as default};
