import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{r as d}from"./index-BUSIDwT2.js";import{e as xe,f as be,n as Ne,C as Ce}from"./finish-DKgMrCbH.js";import{B as z}from"./Button-BScpP696.js";import{I as je}from"./Input-Bq4XNRC6.js";import{T as p}from"./Text-DmuCryDF.js";import{I as y}from"./Icon-DfhILpv1.js";import"./index-yBjzXJbu.js";function E({name:t,onNameChange:a,onCancel:l,onRegister:u,onClose:i,isNameAvailable:f}){const[o,h]=d.useState(f),c="particle.eth",x=s=>{if(!s)return"";const n=new RegExp(`\\.${c.replace(".","\\.")}$`,"i");return s.replace(n,"").trim()};d.useEffect(()=>{const s=x(t);if(s&&s.length>0){const n=/^[a-z0-9-]+$/i.test(s)&&s.length>3,g=setTimeout(()=>{h(n)},300);return()=>clearTimeout(g)}else h(void 0)},[t]);const v=f!==void 0?f:o,b=t&&t.length>0&&v!==void 0&&v===!1,m=x(t),N=()=>{a("")},P=s=>{let n=s.target.value;const g=new RegExp(`\\.${c.replace(".","\\.")}$`,"i");n=n.replace(g,""),n=n.replace(/[^a-z0-9-]/gi,""),a(n)};return e.jsxs("div",{className:"ns-offchain-register-card",children:[i&&e.jsx("button",{className:"ns-offchain-register-close-btn",onClick:i,children:e.jsx(y,{name:"x",size:20})}),e.jsx("div",{className:"ns-offchain-register-banner",children:e.jsx("img",{src:xe,alt:"ENS Banner"})}),e.jsx("div",{className:"ns-offchain-register-header",children:e.jsx(p,{size:"lg",weight:"bold",children:"Get your Web3 Username"})}),e.jsxs("div",{className:"ns-offchain-register-input-row",children:[e.jsx(y,{name:"search",size:16,className:"ns-offchain-register-search-icon"}),e.jsx(je,{type:"text",className:"ns-offchain-register-input",placeholder:"Find name",value:m,onChange:P}),m&&v&&e.jsx("div",{className:"ns-offchain-register-checkmark available",children:e.jsx(y,{name:"check-circle",size:14,color:"black"})}),m&&b&&e.jsx("button",{className:"ns-offchain-register-clear-btn",onClick:N,type:"button",children:e.jsx(y,{name:"x",size:14,color:"#ffffff"})}),e.jsxs(p,{className:"ns-offchain-register-domain-suffix",children:[".",c]})]}),b&&e.jsxs("div",{className:"ns-offchain-register-unavailable-message",children:[e.jsx(y,{name:"alert-triangle",size:14}),e.jsx(p,{size:"sm",className:"ns-offchain-register-error-text",children:"This name is unavailable. Please choose a different one."})]}),e.jsxs("div",{className:"ns-offchain-register-actions",children:[e.jsx(z,{className:"cancel",onClick:l,children:"Cancel"}),e.jsx(z,{className:"primary",onClick:()=>{const s=m?`${m}.${c}`:"";s&&a(s),u()},disabled:!m||!!b,children:m&&v?"Next":"Register"})]}),e.jsx("div",{className:"ns-offchain-register-footer",children:e.jsx(p,{size:"sm",color:"grey",children:"Powered by Namespace"})})]})}E.__docgenInfo={description:"",methods:[],displayName:"InitialStep",props:{name:{required:!0,tsType:{name:"string"},description:""},onNameChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(name: string) => void",signature:{arguments:[{type:{name:"string"},name:"name"}],return:{name:"void"}}},description:""},onCancel:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onRegister:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onClose:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},isNameAvailable:{required:!1,tsType:{name:"boolean"},description:""}}};function we({name:t,onClose:a,onSetProfile:l,onFinish:u}){return e.jsx("div",{className:"ns-offchain-register-container",children:e.jsxs("div",{className:"ns-offchain-register-card ns-offchain-register-success",children:[a&&e.jsx("button",{className:"ns-offchain-register-close-btn",onClick:a,children:e.jsx(y,{name:"x",size:20})}),e.jsx("div",{className:"ns-offchain-register-finish-banner",children:e.jsx("img",{src:be,alt:"Success"})}),e.jsxs("div",{className:"ns-offchain-register-success-title-section",children:[e.jsx(p,{size:"xl",weight:"bold",className:"ns-offchain-register-success-message",children:"ENS name registered successfully"}),e.jsx(p,{size:"md",color:"grey",className:"ns-offchain-register-success-subtitle",children:"Complete your profile now"})]}),l&&e.jsxs("div",{className:"ns-offchain-register-profile-card",onClick:l,children:[e.jsx("div",{className:"ns-offchain-register-profile-icon",children:e.jsx("img",{src:Ne,alt:"Profile Icon"})}),e.jsxs("div",{className:"ns-offchain-register-profile-text",children:[e.jsx(p,{size:"md",weight:"bold",children:"Complete your profile"}),e.jsx(p,{size:"sm",color:"grey",children:"Make your ENS more discoverable"})]}),e.jsx("button",{className:"ns-offchain-register-profile-arrow",children:e.jsx(Ce,{size:20})})]}),e.jsx("div",{className:"ns-offchain-register-actions",children:e.jsx(z,{className:"primary finish-btn",onClick:u||a,children:"Finish"})})]})})}we.__docgenInfo={description:"",methods:[],displayName:"OffchainSuccessScreen",props:{name:{required:!0,tsType:{name:"string"},description:""},onClose:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onSetProfile:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onFinish:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};function O({step:t=0,name:a="",profileComplete:l=!1,onStepChange:u,onNameChange:i,onProfileCompleteChange:f,onRegister:o,onCancel:h,onClose:c,onCompleteProfile:x,onOpenWallet:v,onCompleteRegistration:Se,onRegisterAnother:b,onViewName:m}){const[N,P]=d.useState(t),[s,n]=d.useState(a),g=V=>{n(V),i==null||i(V)},A=()=>{P(2),o==null||o()},U=()=>{h==null||h()};return N===0?e.jsx("div",{className:"ns-offchain-register-container",children:e.jsx(E,{name:s,onNameChange:g,onCancel:U,onRegister:A,onClose:c})}):N===2?e.jsx(we,{name:s,onClose:c,onSetProfile:x,onFinish:c}):e.jsx("div",{className:"ns-offchain-register-container",children:e.jsx(E,{name:s,onNameChange:g,onCancel:U,onRegister:A,onClose:c})})}O.__docgenInfo={description:"",methods:[],displayName:"EnsOffChainRegisterModal",props:{step:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},name:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}},profileComplete:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},onStepChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(step: number) => void",signature:{arguments:[{type:{name:"number"},name:"step"}],return:{name:"void"}}},description:""},onNameChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(name: string) => void",signature:{arguments:[{type:{name:"string"},name:"name"}],return:{name:"void"}}},description:""},onProfileCompleteChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(complete: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"complete"}],return:{name:"void"}}},description:""},onRegister:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onCancel:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onClose:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onCompleteProfile:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onOpenWallet:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onCompleteRegistration:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onRegisterAnother:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onViewName:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};const Ee={title:"Modals/EnsOffChainRegisterModal",component:O,parameters:{layout:"centered",docs:{description:{component:"A modal component for off-chain ENS name registration. The component has 2 main steps: InitialStep (step 0) for name search and selection, and OffchainSuccessScreen (step 2) shown after successful registration. Click through the steps to see each state."}}}},r=t=>{const[a,l]=d.useState(t.step??0),[u,i]=d.useState(t.name??""),[f,o]=d.useState(t.profileComplete??!1);return e.jsx(O,{step:a,name:u,profileComplete:f,onStepChange:l,onNameChange:i,onProfileCompleteChange:o,onRegister:()=>alert("Register clicked"),onCancel:()=>alert("Cancel clicked"),onClose:()=>alert("Close clicked"),onCompleteProfile:()=>{o(!0),alert("Complete Profile clicked")},onOpenWallet:()=>alert("Open Wallet clicked"),onCompleteRegistration:()=>alert("Complete Registration clicked"),onRegisterAnother:()=>{i(""),o(!1),l(0),alert("Register Another clicked")},onViewName:()=>alert("View Name clicked")})},w={render:()=>e.jsx(r,{step:0,name:"",profileComplete:!1}),parameters:{docs:{description:{story:"Initial step showing the name search interface for off-chain registration. Enter a subname (e.g., 'magier') and it will be registered under particle.eth domain. The button shows 'Register' initially and changes to 'Next' when a name is available."}}}},C={render:()=>e.jsx(r,{step:0,name:"magier",profileComplete:!1}),parameters:{docs:{description:{story:"InitialStep with a pre-filled name. The button will show 'Next' if the name is available (length > 3 and valid characters), or 'Register' if not yet checked."}}}},j={render:()=>e.jsx(r,{step:0,name:"brightwave",profileComplete:!1}),parameters:{docs:{description:{story:"InitialStep with an available name that will show the checkmark and enable the 'Next' button."}}}},T={render:()=>e.jsx(r,{step:0,name:"myverylongensname",profileComplete:!1}),parameters:{docs:{description:{story:"InitialStep with a longer name to test layout and responsiveness. Useful for testing how the component handles longer subnames."}}}},I={render:()=>e.jsx(r,{step:0,name:"abc",profileComplete:!1}),parameters:{docs:{description:{story:"InitialStep showing an unavailable name (names must be longer than 3 characters). The error message will be displayed and the button will be disabled."}}}},k={render:()=>e.jsx(r,{step:0,name:"test@name",profileComplete:!1}),parameters:{docs:{description:{story:"InitialStep showing an invalid name with special characters. Invalid characters are automatically filtered out, but if the resulting name is too short, it will show as unavailable."}}}},S={render:()=>e.jsx(r,{step:2,name:"magier.particle.eth",profileComplete:!1}),parameters:{docs:{description:{story:"Success screen shown after successful off-chain registration. To see this step, start from InitialStep and click Next/Register with an available name. Shows the registered name and options to complete profile or finish."}}}},R={render:()=>e.jsx(r,{step:2,name:"magier.particle.eth",profileComplete:!0}),parameters:{docs:{description:{story:"Success screen with profile completion status. Shows when the user has completed their profile. The profile completion card may not be shown if profile is already complete."}}}},q={render:()=>e.jsx(r,{step:2,name:"myverylongensname.particle.eth",profileComplete:!1}),parameters:{docs:{description:{story:"Success screen with a longer registered name to test layout and text wrapping. Useful for ensuring the component handles longer names gracefully."}}}},W={render:()=>e.jsx(r,{step:2,name:"xyz.particle.eth",profileComplete:!1}),parameters:{docs:{description:{story:"Success screen with a shorter registered name to test layout with minimal text."}}}};var _,$,L,B,M;w.parameters={...w.parameters,docs:{...(_=w.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
- Click "Next" or "Register" to proceed to success screen`,...(M=(B=w.parameters)==null?void 0:B.docs)==null?void 0:M.description}}};var F,D,G;C.parameters={...C.parameters,docs:{...(F=C.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: () => <Template step={0} name="magier" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story: "InitialStep with a pre-filled name. The button will show 'Next' if the name is available (length > 3 and valid characters), or 'Register' if not yet checked."
      }
    }
  }
}`,...(G=(D=C.parameters)==null?void 0:D.docs)==null?void 0:G.source}}};var H,J,K;j.parameters={...j.parameters,docs:{...(H=j.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => <Template step={0} name="brightwave" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story: "InitialStep with an available name that will show the checkmark and enable the 'Next' button."
      }
    }
  }
}`,...(K=(J=j.parameters)==null?void 0:J.docs)==null?void 0:K.source}}};var Q,X,Y;T.parameters={...T.parameters,docs:{...(Q=T.parameters)==null?void 0:Q.docs,source:{originalSource:`{
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
}`,...(se=(ee=I.parameters)==null?void 0:ee.docs)==null?void 0:se.source}}};var te,ae,ne;k.parameters={...k.parameters,docs:{...(te=k.parameters)==null?void 0:te.docs,source:{originalSource:`{
  render: () => <Template step={0} name="test@name" profileComplete={false} />,
  parameters: {
    docs: {
      description: {
        story: "InitialStep showing an invalid name with special characters. Invalid characters are automatically filtered out, but if the resulting name is too short, it will show as unavailable."
      }
    }
  }
}`,...(ne=(ae=k.parameters)==null?void 0:ae.docs)==null?void 0:ne.source}}};var re,ie,oe,ce,le;S.parameters={...S.parameters,docs:{...(re=S.parameters)==null?void 0:re.docs,source:{originalSource:`{
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
}`,...(ve=(ye=W.parameters)==null?void 0:ye.docs)==null?void 0:ve.source}}};const Oe=["InitialStep","InitialStepWithName","InitialStepWithAvailableName","InitialStepWithLongName","InitialStepWithUnavailableName","InitialStepWithInvalidName","SuccessScreen","SuccessScreenWithProfile","SuccessScreenWithLongName","SuccessScreenWithShortName"];export{w as InitialStep,j as InitialStepWithAvailableName,k as InitialStepWithInvalidName,T as InitialStepWithLongName,C as InitialStepWithName,I as InitialStepWithUnavailableName,S as SuccessScreen,q as SuccessScreenWithLongName,R as SuccessScreenWithProfile,W as SuccessScreenWithShortName,Oe as __namedExportsOrder,Ee as default};
