import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{I as r}from"./Icon-BEe5gYBC.js";import{T as s}from"./Text-DmuCryDF.js";import{B as n}from"./Button-BScpP696.js";import"./index-yBjzXJbu.js";import"./index-BUSIDwT2.js";const p=({bannerUrl:m,avatarUrl:E,name:b,username:W,bio:A,address:f,followers:L=0,following:k=0,ownedBy:F,expires:_,records:J=[],website:u,subnames:R=0,profit:M=0,volume:I=0,className:O=""})=>e.jsxs("section",{className:`ns-profile-card ${O}`,children:[e.jsxs("header",{className:"ns-profile-info",children:[e.jsxs("div",{className:"ns-profile-banner",children:[e.jsx("img",{src:m,alt:"Profile banner"}),e.jsxs("div",{className:"ns-profile-avatar",children:[e.jsx("img",{src:E,alt:b+" avatar"}),e.jsx("div",{className:"ns-avatar-badge",children:e.jsx("img",{src:"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",alt:"chain icon",className:"ns-avatar-badge-icon"})})]})]}),e.jsxs("div",{className:"ns-profile-body",children:[e.jsx(s,{color:"primary",weight:"bold",children:b}),e.jsxs("div",{className:"ns-username-container",children:[e.jsx(s,{size:"xl",weight:"bold",children:W}),e.jsx("span",{className:"ns-edit-btn",children:e.jsx(r,{name:"edit",size:16})})]}),e.jsx(s,{size:"md",className:"ns-profile-bio",children:A}),e.jsxs("div",{className:"ns-profile-socials",children:[e.jsxs("div",{className:"ns-address-box",children:[e.jsx(s,{color:"grey",className:"ns-address-text",size:"sm",children:f}),e.jsx(r,{name:"copy",size:16})]}),e.jsx(n,{children:e.jsx(r,{name:"twitter",color:"#000000",size:16})}),e.jsx(n,{children:e.jsx(r,{name:"telegram",color:"#000000",size:16})}),e.jsx(n,{children:e.jsx(r,{name:"globe",color:"#000000",size:16})}),e.jsx(n,{children:e.jsx(r,{name:"github",color:"#000000",size:16})})]}),e.jsx("div",{className:"ns-profile-stats",children:e.jsxs("div",{className:"ns-stats-row",children:[e.jsxs(s,{size:"sm",children:[L," Followers"]}),e.jsx(s,{children:"•"}),e.jsxs(s,{size:"sm",children:[k," Following"]}),e.jsx(n,{size:"sm",variant:"outline",children:"Follow"})]})})]})]}),e.jsxs("section",{className:"ns-profile-section ns-profile-links",children:[e.jsxs("div",{className:"ns-extra-item",children:[e.jsxs(s,{size:"sm",children:["Owned by ",F]}),e.jsx("button",{className:"ns-extra-btn",children:e.jsx(r,{name:"check-circle",size:16})})]}),e.jsxs("div",{className:"ns-extra-item",children:[e.jsxs(s,{size:"sm",children:["Expires ",_]}),e.jsx(r,{name:"info",size:16})]}),e.jsxs("div",{className:"ns-extra-item",children:[e.jsx(s,{size:"sm",children:f}),e.jsx(r,{name:"map-pin",size:16})]}),u&&e.jsxs("div",{className:"ns-extra-item",children:[e.jsx(s,{size:"sm",children:u}),e.jsx("a",{href:u,target:"_blank",rel:"noreferrer",children:e.jsx(r,{name:"globe",size:16})})]})]}),e.jsxs("footer",{className:"ns-profile-footer",children:[e.jsxs("div",{className:"ns-footer-item",children:[e.jsx(s,{className:"ns-footer-label",children:R}),e.jsx(s,{className:"ns-footer-text",children:"Subnames"})]}),e.jsx(s,{className:"ns-footer-dot",children:"•"}),e.jsxs("div",{className:"ns-footer-item",children:[e.jsx(s,{className:"ns-footer-label",children:M}),e.jsx(s,{className:"ns-footer-text",children:"Profit"})]}),e.jsx(s,{className:"ns-footer-dot",children:"•"}),e.jsxs("div",{className:"ns-footer-item",children:[e.jsx(s,{className:"ns-footer-label",children:I}),e.jsx(s,{className:"ns-footer-text",children:"Volume"})]})]})]});p.__docgenInfo={description:"",methods:[],displayName:"ProfileCard",props:{bannerUrl:{required:!0,tsType:{name:"string"},description:""},avatarUrl:{required:!0,tsType:{name:"string"},description:""},name:{required:!0,tsType:{name:"string"},description:""},username:{required:!0,tsType:{name:"string"},description:""},bio:{required:!0,tsType:{name:"string"},description:""},address:{required:!0,tsType:{name:"string"},description:""},followers:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},following:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},ownedBy:{required:!0,tsType:{name:"string"},description:""},expires:{required:!0,tsType:{name:"string"},description:""},records:{required:!1,tsType:{name:"Array",elements:[{name:"string"}],raw:"string[]"},description:"",defaultValue:{value:"[]",computed:!1}},website:{required:!1,tsType:{name:"string"},description:""},subnames:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},profit:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},volume:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},className:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}}}};const Y={title:"Components/ProfileCard",component:p,parameters:{layout:"centered",docs:{description:{component:`
# ProfileCard

A user profile card component for displaying ENS profile information, including avatar, banner, username, bio, address, stats, and social links.

## Features
- Banner and avatar
- Username, bio, and address
- Social and copy actions
- Stats and extra info
- Responsive layout
        `}}},argTypes:{bannerUrl:{control:"text",description:"Banner image URL"},avatarUrl:{control:"text",description:"Avatar image URL"},name:{control:"text",description:"Full name"},username:{control:"text",description:"Username"},bio:{control:"text",description:"Profile bio"},address:{control:"text",description:"Wallet address"},followers:{control:"number",description:"Number of followers"},following:{control:"number",description:"Number of following"},ownedBy:{control:"text",description:"Owner address or name"},expires:{control:"text",description:"Expiry date"},records:{control:"object",description:"ENS records"},website:{control:"text",description:"Website URL"},subnames:{control:"number",description:"Subnames count"},profit:{control:"number",description:"Profit value"},volume:{control:"number",description:"Volume value"}}},a=m=>e.jsx(p,{...m}),t={render:a,args:{bannerUrl:"https://images.unsplash.com/photo-1506744038136-46273834b3fb",avatarUrl:"https://avatars.githubusercontent.com/u/123456?v=4",name:"Artii",username:"artii.eth",bio:"Web3 builder, ENS enthusiast, and open source contributor.",address:"0x1234567890123456789012345678901234567890",followers:1200,following:300,ownedBy:"artii.eth",expires:"2026-12-31",records:["description","url","avatar"],website:"https://artii.eth.limo",subnames:5,profit:2.5,volume:100},parameters:{docs:{description:{story:"Default ProfileCard with sample data."}}}},o={render:a,args:{bannerUrl:"https://images.unsplash.com/photo-1465101046530-73398c7f28ca",avatarUrl:"https://avatars.githubusercontent.com/u/789012?v=4",name:"Jane Doe",username:"jane.eth",bio:"Decentralized identity explorer.",address:"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",followers:800,following:150,ownedBy:"jane.eth",expires:"2027-05-20",records:["description","avatar"],website:"https://jane.eth.limo",subnames:2,profit:1.2,volume:50},parameters:{docs:{description:{story:"ProfileCard with custom user data."}}}},i={render:a,args:{bannerUrl:"https://images.unsplash.com/photo-1506744038136-46273834b3fb",avatarUrl:"",name:"No Avatar User",username:"noavatar.eth",bio:"This user has no avatar set.",address:"0x0000000000000000000000000000000000000000",followers:0,following:0,ownedBy:"noavatar.eth",expires:"2028-01-01",records:[],website:"",subnames:0,profit:0,volume:0},parameters:{docs:{description:{story:"ProfileCard with no avatar and zero stats."}}}},l={render:a,args:{bannerUrl:"https://images.unsplash.com/photo-1465101046530-73398c7f28ca",avatarUrl:"https://avatars.githubusercontent.com/u/789012?v=4",name:"Long Bio User",username:"longbio.eth",bio:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut laoreet cursus, enim erat dictum urna, nec cursus enim erat euismod nunc. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam euismod, nunc ut laoreet cursus, enim erat dictum urna, nec cursus enim erat euismod nunc.",address:"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",followers:10,following:5,ownedBy:"longbio.eth",expires:"2029-12-31",records:["description"],website:"https://longbio.eth.limo",subnames:1,profit:.1,volume:1},parameters:{docs:{description:{story:"ProfileCard with a very long bio."}}}},c={render:a,args:{bannerUrl:"https://images.unsplash.com/photo-1506744038136-46273834b3fb",avatarUrl:"https://avatars.githubusercontent.com/u/123456?v=4",name:"No Website",username:"noweb.eth",bio:"No website provided.",address:"0x1234567890123456789012345678901234567890",followers:100,following:50,ownedBy:"noweb.eth",expires:"2027-07-07",records:["description"],website:void 0,subnames:3,profit:.5,volume:10},parameters:{docs:{description:{story:"ProfileCard with no website link."}}}},d={render:a,args:{bannerUrl:"https://images.unsplash.com/photo-1465101046530-73398c7f28ca",avatarUrl:"https://avatars.githubusercontent.com/u/789012?v=4",name:"Popular User",username:"popular.eth",bio:"This user is very popular!",address:"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",followers:1e5,following:1e3,ownedBy:"popular.eth",expires:"2030-01-01",records:["description","avatar"],website:"https://popular.eth.limo",subnames:10,profit:100,volume:1e3},parameters:{docs:{description:{story:"ProfileCard with a large number of followers and subnames."}}}};var h,x,g;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: Template,
  args: {
    bannerUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    avatarUrl: "https://avatars.githubusercontent.com/u/123456?v=4",
    name: "Artii",
    username: "artii.eth",
    bio: "Web3 builder, ENS enthusiast, and open source contributor.",
    address: "0x1234567890123456789012345678901234567890",
    followers: 1200,
    following: 300,
    ownedBy: "artii.eth",
    expires: "2026-12-31",
    records: ["description", "url", "avatar"],
    website: "https://artii.eth.limo",
    subnames: 5,
    profit: 2.5,
    volume: 100
  },
  parameters: {
    docs: {
      description: {
        story: "Default ProfileCard with sample data."
      }
    }
  }
}`,...(g=(x=t.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var v,w,j;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: Template,
  args: {
    bannerUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
    avatarUrl: "https://avatars.githubusercontent.com/u/789012?v=4",
    name: "Jane Doe",
    username: "jane.eth",
    bio: "Decentralized identity explorer.",
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    followers: 800,
    following: 150,
    ownedBy: "jane.eth",
    expires: "2027-05-20",
    records: ["description", "avatar"],
    website: "https://jane.eth.limo",
    subnames: 2,
    profit: 1.2,
    volume: 50
  },
  parameters: {
    docs: {
      description: {
        story: "ProfileCard with custom user data."
      }
    }
  }
}`,...(j=(w=o.parameters)==null?void 0:w.docs)==null?void 0:j.source}}};var y,N,U;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: Template,
  args: {
    bannerUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    avatarUrl: "",
    // No avatar
    name: "No Avatar User",
    username: "noavatar.eth",
    bio: "This user has no avatar set.",
    address: "0x0000000000000000000000000000000000000000",
    followers: 0,
    following: 0,
    ownedBy: "noavatar.eth",
    expires: "2028-01-01",
    records: [],
    website: "",
    subnames: 0,
    profit: 0,
    volume: 0
  },
  parameters: {
    docs: {
      description: {
        story: "ProfileCard with no avatar and zero stats."
      }
    }
  }
}`,...(U=(N=i.parameters)==null?void 0:N.docs)==null?void 0:U.source}}};var T,P,z;l.parameters={...l.parameters,docs:{...(T=l.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: Template,
  args: {
    bannerUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
    avatarUrl: "https://avatars.githubusercontent.com/u/789012?v=4",
    name: "Long Bio User",
    username: "longbio.eth",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut laoreet cursus, enim erat dictum urna, nec cursus enim erat euismod nunc. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam euismod, nunc ut laoreet cursus, enim erat dictum urna, nec cursus enim erat euismod nunc.",
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    followers: 10,
    following: 5,
    ownedBy: "longbio.eth",
    expires: "2029-12-31",
    records: ["description"],
    website: "https://longbio.eth.limo",
    subnames: 1,
    profit: 0.1,
    volume: 1
  },
  parameters: {
    docs: {
      description: {
        story: "ProfileCard with a very long bio."
      }
    }
  }
}`,...(z=(P=l.parameters)==null?void 0:P.docs)==null?void 0:z.source}}};var B,q,C;c.parameters={...c.parameters,docs:{...(B=c.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: Template,
  args: {
    bannerUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    avatarUrl: "https://avatars.githubusercontent.com/u/123456?v=4",
    name: "No Website",
    username: "noweb.eth",
    bio: "No website provided.",
    address: "0x1234567890123456789012345678901234567890",
    followers: 100,
    following: 50,
    ownedBy: "noweb.eth",
    expires: "2027-07-07",
    records: ["description"],
    website: undefined,
    subnames: 3,
    profit: 0.5,
    volume: 10
  },
  parameters: {
    docs: {
      description: {
        story: "ProfileCard with no website link."
      }
    }
  }
}`,...(C=(q=c.parameters)==null?void 0:q.docs)==null?void 0:C.source}}};var S,V,D;d.parameters={...d.parameters,docs:{...(S=d.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: Template,
  args: {
    bannerUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
    avatarUrl: "https://avatars.githubusercontent.com/u/789012?v=4",
    name: "Popular User",
    username: "popular.eth",
    bio: "This user is very popular!",
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    followers: 100000,
    following: 1000,
    ownedBy: "popular.eth",
    expires: "2030-01-01",
    records: ["description", "avatar"],
    website: "https://popular.eth.limo",
    subnames: 10,
    profit: 100,
    volume: 1000
  },
  parameters: {
    docs: {
      description: {
        story: "ProfileCard with a large number of followers and subnames."
      }
    }
  }
}`,...(D=(V=d.parameters)==null?void 0:V.docs)==null?void 0:D.source}}};const Z=["Default","WithCustomData","NoAvatar","LongBio","MissingWebsite","ManyFollowers"];export{t as Default,l as LongBio,d as ManyFollowers,c as MissingWebsite,i as NoAvatar,o as WithCustomData,Z as __namedExportsOrder,Y as default};
