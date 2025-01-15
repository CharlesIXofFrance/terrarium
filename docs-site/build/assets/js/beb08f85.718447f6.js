"use strict";(self.webpackChunkterrarium_documentation=self.webpackChunkterrarium_documentation||[]).push([[613],{15680:(e,t,n)=>{n.d(t,{xA:()=>c,yg:()=>y});var r=n(96540);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),u=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=u(e.components);return r.createElement(l.Provider,{value:t},e.children)},p="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),p=u(n),d=a,y=p["".concat(l,".").concat(d)]||p[d]||m[d]||o;return n?r.createElement(y,i(i({ref:t},c),{},{components:n})):r.createElement(y,i({ref:t},c))}));function y(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=d;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[p]="string"==typeof e?e:a,i[1]=s;for(var u=2;u<o;u++)i[u]=n[u];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},57189:(e,t,n)=>{n.d(t,{A:()=>w});var r=n(96540),a=n(58168),o=n(40870),i=n(23104),s=n(56347),l=n(57485),u=n(31682),c=n(89466);function p(e){return function(e){return r.Children.map(e,(e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}(e).map((e=>{let{props:{value:t,label:n,attributes:r,default:a}}=e;return{value:t,label:n,attributes:r,default:a}}))}function m(e){const{values:t,children:n}=e;return(0,r.useMemo)((()=>{const e=t??p(n);return function(e){const t=(0,u.X)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function d(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function y(e){let{queryString:t=!1,groupId:n}=e;const a=(0,s.W6)(),o=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,l.aZ)(o),(0,r.useCallback)((e=>{if(!o)return;const t=new URLSearchParams(a.location.search);t.set(o,e),a.replace({...a.location,search:t.toString()})}),[o,a])]}function g(e){const{defaultValue:t,queryString:n=!1,groupId:a}=e,o=m(e),[i,s]=(0,r.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!d({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const r=n.find((e=>e.default))??n[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:t,tabValues:o}))),[l,u]=y({queryString:n,groupId:a}),[p,g]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,o]=(0,c.Dv)(n);return[a,(0,r.useCallback)((e=>{n&&o.set(e)}),[n,o])]}({groupId:a}),f=(()=>{const e=l??p;return d({value:e,tabValues:o})?e:null})();(0,r.useLayoutEffect)((()=>{f&&s(f)}),[f]);return{selectedValue:i,selectValue:(0,r.useCallback)((e=>{if(!d({value:e,tabValues:o}))throw new Error(`Can't select invalid tab value=${e}`);s(e),u(e),g(e)}),[u,g,o]),tabValues:o}}var f=n(92303);const h={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};function b(e){let{className:t,block:n,selectedValue:s,selectValue:l,tabValues:u}=e;const c=[],{blockElementScrollPositionUntilNextRender:p}=(0,i.a_)(),m=e=>{const t=e.currentTarget,n=c.indexOf(t),r=u[n].value;r!==s&&(p(t),l(r))},d=e=>{let t=null;switch(e.key){case"Enter":m(e);break;case"ArrowRight":{const n=c.indexOf(e.currentTarget)+1;t=c[n]??c[0];break}case"ArrowLeft":{const n=c.indexOf(e.currentTarget)-1;t=c[n]??c[c.length-1];break}}t?.focus()};return r.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,o.A)("tabs",{"tabs--block":n},t)},u.map((e=>{let{value:t,label:n,attributes:i}=e;return r.createElement("li",(0,a.A)({role:"tab",tabIndex:s===t?0:-1,"aria-selected":s===t,key:t,ref:e=>c.push(e),onKeyDown:d,onClick:m},i,{className:(0,o.A)("tabs__item",h.tabItem,i?.className,{"tabs__item--active":s===t})}),n??t)})))}function v(e){let{lazy:t,children:n,selectedValue:a}=e;const o=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=o.find((e=>e.props.value===a));return e?(0,r.cloneElement)(e,{className:"margin-top--md"}):null}return r.createElement("div",{className:"margin-top--md"},o.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==a}))))}function N(e){const t=g(e);return r.createElement("div",{className:(0,o.A)("tabs-container",h.tabList)},r.createElement(b,(0,a.A)({},e,t)),r.createElement(v,(0,a.A)({},e,t)))}function C(e){const t=(0,f.A)();return r.createElement(N,(0,a.A)({key:String(t)},e))}const O={tabItem:"tabItem_Ymn6"};function E(e){let{children:t,hidden:n,className:a}=e;return r.createElement("div",{role:"tabpanel",className:(0,o.A)(O.tabItem,a),hidden:n},t)}const j={codeContainer:"codeContainer_lzJ3",copyButton:"copyButton_rH4I"},q={curl:"cURL",python:"Python",javascript:"JavaScript",typescript:"TypeScript",go:"Go",ruby:"Ruby"};function w(e){let{endpoint:t,method:n,params:a={},headers:o={}}=e;const[i,s]=(0,r.useState)("curl"),l={curl:(()=>{const e=Object.entries(o).map((e=>{let[t,n]=e;return`-H "${t}: ${n}"`})).join(" ");return`curl -X ${n.toUpperCase()} \\\n  ${e} \\\n  -d '${JSON.stringify(a)}' \\\n  "https://api.terrarium.dev/v1${t}"`})(),python:`import requests\n\nheaders = ${JSON.stringify(o,null,2)}\nparams = ${JSON.stringify(a,null,2)}\n\nresponse = requests.${n.toLowerCase()}(\n    'https://api.terrarium.dev/v1${t}',\n    headers=headers,\n    json=params\n)\n\nprint(response.json())`,javascript:`fetch('https://api.terrarium.dev/v1${t}', {\n  method: '${n.toUpperCase()}',\n  headers: ${JSON.stringify(o,null,2)},\n  body: JSON.stringify(${JSON.stringify(a,null,2)})\n})\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));`,typescript:`interface RequestParams {\n  ${Object.entries(a).map((e=>{let[t,n]=e;return`${t}: ${typeof n};`})).join("\n  ")}\n}\n\ninterface ResponseData {\n  // Define your response type here\n  data: any;\n}\n\nasync function makeRequest(): Promise<ResponseData> {\n  const response = await fetch('https://api.terrarium.dev/v1${t}', {\n    method: '${n.toUpperCase()}',\n    headers: ${JSON.stringify(o,null,2)},\n    body: JSON.stringify(${JSON.stringify(a,null,2)})\n  });\n\n  if (!response.ok) {\n    throw new Error(\`HTTP error! status: \${response.status}\`);\n  }\n\n  return response.json();\n}\n\n// Usage\nmakeRequest()\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));`,go:`package main\n\nimport (\n    "bytes"\n    "encoding/json"\n    "fmt"\n    "io/ioutil"\n    "net/http"\n)\n\nfunc main() {\n    // Prepare request body\n    params := ${JSON.stringify(a,null,2)}\n    jsonData, err := json.Marshal(params)\n    if err != nil {\n        panic(err)\n    }\n\n    // Create request\n    req, err := http.NewRequest("${n.toUpperCase()}", "https://api.terrarium.dev/v1${t}", bytes.NewBuffer(jsonData))\n    if err != nil {\n        panic(err)\n    }\n\n    // Add headers\n    ${Object.entries(o).map((e=>{let[t,n]=e;return`req.Header.Add("${t}", "${n}")`})).join("\n    ")}\n\n    // Make request\n    client := &http.Client{}\n    resp, err := client.Do(req)\n    if err != nil {\n        panic(err)\n    }\n    defer resp.Body.Close()\n\n    // Read response\n    body, err := ioutil.ReadAll(resp.Body)\n    if err != nil {\n        panic(err)\n    }\n\n    fmt.Println(string(body))\n}`,ruby:`require 'net/http'\nrequire 'uri'\nrequire 'json'\n\nuri = URI('https://api.terrarium.dev/v1${t}')\nhttp = Net::HTTP.new(uri.host, uri.port)\nhttp.use_ssl = true\n\nrequest = Net::HTTP::${n.charAt(0).toUpperCase()+n.slice(1).toLowerCase()}.new(uri)\n${Object.entries(o).map((e=>{let[t,n]=e;return`request["${t}"] = "${n}"`})).join("\n")}\n\nrequest.body = ${JSON.stringify(a,null,2)}.to_json\n\nresponse = http.request(request)\nputs response.read_body`};return r.createElement("div",{className:j.codeContainer},r.createElement(C,{values:Object.entries(q).map((e=>{let[t,n]=e;return{label:n,value:t}})),defaultValue:"curl",onChange:e=>s(e)},Object.entries(l).map((e=>{let[t,n]=e;return r.createElement(E,{key:t,value:t},r.createElement("pre",null,r.createElement("code",{className:`language-${t}`},n)))}))))}},55745:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>s,default:()=>d,frontMatter:()=>i,metadata:()=>l,toc:()=>c});var r=n(58168),a=(n(96540),n(15680)),o=n(57189);const i={sidebar_position:1},s="Communities API",l={unversionedId:"api/endpoints/communities",id:"api/endpoints/communities",title:"Communities API",description:"Manage your communities through the API.",source:"@site/docs/api/endpoints/communities.md",sourceDirName:"api/endpoints",slug:"/api/endpoints/communities",permalink:"/docs/api/endpoints/communities",draft:!1,editUrl:"https://github.com/CharlesIXofFrance/terrarium/tree/main/docs-site/docs/api/endpoints/communities.md",tags:[],version:"current",lastUpdatedBy:"samgonzalez",lastUpdatedAt:1736899798,formattedLastUpdatedAt:"Jan 15, 2025",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"docs",previous:{title:"Authentication",permalink:"/docs/api/authentication"},next:{title:"Jobs API",permalink:"/docs/api/endpoints/jobs"}},u={},c=[{value:"List Communities",id:"list-communities",level:2},{value:"Endpoint",id:"endpoint",level:3},{value:"Query Parameters",id:"query-parameters",level:3},{value:"Example Request",id:"example-request",level:3},{value:"Response",id:"response",level:3},{value:"Create Community",id:"create-community",level:2},{value:"Endpoint",id:"endpoint-1",level:3},{value:"Request Body",id:"request-body",level:3},{value:"Example Request",id:"example-request-1",level:3},{value:"Response",id:"response-1",level:3}],p={toc:c},m="wrapper";function d(e){let{components:t,...n}=e;return(0,a.yg)(m,(0,r.A)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.yg)("h1",{id:"communities-api"},"Communities API"),(0,a.yg)("p",null,"Manage your communities through the API."),(0,a.yg)("h2",{id:"list-communities"},"List Communities"),(0,a.yg)("p",null,"List all communities you have access to."),(0,a.yg)("h3",{id:"endpoint"},"Endpoint"),(0,a.yg)("p",null,(0,a.yg)("inlineCode",{parentName:"p"},"GET /v1/communities")),(0,a.yg)("h3",{id:"query-parameters"},"Query Parameters"),(0,a.yg)("table",null,(0,a.yg)("thead",{parentName:"table"},(0,a.yg)("tr",{parentName:"thead"},(0,a.yg)("th",{parentName:"tr",align:null},"Parameter"),(0,a.yg)("th",{parentName:"tr",align:null},"Type"),(0,a.yg)("th",{parentName:"tr",align:null},"Description"))),(0,a.yg)("tbody",{parentName:"table"},(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},(0,a.yg)("inlineCode",{parentName:"td"},"page")),(0,a.yg)("td",{parentName:"tr",align:null},"number"),(0,a.yg)("td",{parentName:"tr",align:null},"Page number for pagination")),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},(0,a.yg)("inlineCode",{parentName:"td"},"limit")),(0,a.yg)("td",{parentName:"tr",align:null},"number"),(0,a.yg)("td",{parentName:"tr",align:null},"Number of items per page")),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},(0,a.yg)("inlineCode",{parentName:"td"},"status")),(0,a.yg)("td",{parentName:"tr",align:null},"string"),(0,a.yg)("td",{parentName:"tr",align:null},"Filter by status (active, archived)")))),(0,a.yg)("h3",{id:"example-request"},"Example Request"),(0,a.yg)(o.A,{endpoint:"/v1/communities",method:"get",headers:{Authorization:"Bearer YOUR_API_TOKEN","Content-Type":"application/json"},params:{page:1,limit:10,status:"active"},mdxType:"CodeSamples"}),(0,a.yg)("h3",{id:"response"},"Response"),(0,a.yg)("pre",null,(0,a.yg)("code",{parentName:"pre",className:"language-json"},'{\n  "data": [\n    {\n      "id": "com_123",\n      "name": "Tech Community",\n      "description": "A community for tech enthusiasts",\n      "members_count": 1000,\n      "created_at": "2024-01-01T00:00:00Z"\n    }\n  ],\n  "meta": {\n    "page": 1,\n    "total": 100\n  }\n}\n')),(0,a.yg)("h2",{id:"create-community"},"Create Community"),(0,a.yg)("p",null,"Create a new community."),(0,a.yg)("h3",{id:"endpoint-1"},"Endpoint"),(0,a.yg)("p",null,(0,a.yg)("inlineCode",{parentName:"p"},"POST /v1/communities")),(0,a.yg)("h3",{id:"request-body"},"Request Body"),(0,a.yg)("pre",null,(0,a.yg)("code",{parentName:"pre",className:"language-json"},'{\n  "name": "Tech Community",\n  "description": "A community for tech enthusiasts",\n  "settings": {\n    "privacy": "public",\n    "join_mode": "approval"\n  }\n}\n')),(0,a.yg)("h3",{id:"example-request-1"},"Example Request"),(0,a.yg)(o.A,{endpoint:"/v1/communities",method:"post",headers:{Authorization:"Bearer YOUR_API_TOKEN","Content-Type":"application/json"},params:{name:"Tech Community",description:"A community for tech enthusiasts",settings:{privacy:"public",join_mode:"approval"}},mdxType:"CodeSamples"}),(0,a.yg)("h3",{id:"response-1"},"Response"),(0,a.yg)("pre",null,(0,a.yg)("code",{parentName:"pre",className:"language-json"},'{\n  "data": {\n    "id": "com_123",\n    "name": "Tech Community",\n    "description": "A community for tech enthusiasts",\n    "created_at": "2024-01-01T00:00:00Z"\n  }\n}\n')))}d.isMDXComponent=!0}}]);