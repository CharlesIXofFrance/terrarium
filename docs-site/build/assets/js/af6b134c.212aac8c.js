"use strict";(self.webpackChunkterrarium_documentation=self.webpackChunkterrarium_documentation||[]).push([[177],{15680:(e,n,t)=>{t.d(n,{xA:()=>p,yg:()=>d});var r=t(96540);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function i(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var s=r.createContext({}),u=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},p=function(e){var n=u(e.components);return r.createElement(s.Provider,{value:n},e.children)},c="mdxType",y={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},g=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),c=u(t),g=a,d=c["".concat(s,".").concat(g)]||c[g]||y[g]||o;return t?r.createElement(d,l(l({ref:n},p),{},{components:t})):r.createElement(d,l({ref:n},p))}));function d(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var o=t.length,l=new Array(o);l[0]=g;var i={};for(var s in n)hasOwnProperty.call(n,s)&&(i[s]=n[s]);i.originalType=e,i[c]="string"==typeof e?e:a,l[1]=i;for(var u=2;u<o;u++)l[u]=t[u];return r.createElement.apply(null,l)}return r.createElement.apply(null,t)}g.displayName="MDXCreateElement"},57189:(e,n,t)=>{t.d(n,{A:()=>w});var r=t(96540),a=t(58168),o=t(40870),l=t(23104),i=t(56347),s=t(57485),u=t(31682),p=t(89466);function c(e){return function(e){return r.Children.map(e,(e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}(e).map((e=>{let{props:{value:n,label:t,attributes:r,default:a}}=e;return{value:n,label:t,attributes:r,default:a}}))}function y(e){const{values:n,children:t}=e;return(0,r.useMemo)((()=>{const e=n??c(t);return function(e){const n=(0,u.X)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,t])}function g(e){let{value:n,tabValues:t}=e;return t.some((e=>e.value===n))}function d(e){let{queryString:n=!1,groupId:t}=e;const a=(0,i.W6)(),o=function(e){let{queryString:n=!1,groupId:t}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:n,groupId:t});return[(0,s.aZ)(o),(0,r.useCallback)((e=>{if(!o)return;const n=new URLSearchParams(a.location.search);n.set(o,e),a.replace({...a.location,search:n.toString()})}),[o,a])]}function m(e){const{defaultValue:n,queryString:t=!1,groupId:a}=e,o=y(e),[l,i]=(0,r.useState)((()=>function(e){let{defaultValue:n,tabValues:t}=e;if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!g({value:n,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const r=t.find((e=>e.default))??t[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:n,tabValues:o}))),[s,u]=d({queryString:t,groupId:a}),[c,m]=function(e){let{groupId:n}=e;const t=function(e){return e?`docusaurus.tab.${e}`:null}(n),[a,o]=(0,p.Dv)(t);return[a,(0,r.useCallback)((e=>{t&&o.set(e)}),[t,o])]}({groupId:a}),h=(()=>{const e=s??c;return g({value:e,tabValues:o})?e:null})();(0,r.useLayoutEffect)((()=>{h&&i(h)}),[h]);return{selectedValue:l,selectValue:(0,r.useCallback)((e=>{if(!g({value:e,tabValues:o}))throw new Error(`Can't select invalid tab value=${e}`);i(e),u(e),m(e)}),[u,m,o]),tabValues:o}}var h=t(92303);const f={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};function v(e){let{className:n,block:t,selectedValue:i,selectValue:s,tabValues:u}=e;const p=[],{blockElementScrollPositionUntilNextRender:c}=(0,l.a_)(),y=e=>{const n=e.currentTarget,t=p.indexOf(n),r=u[t].value;r!==i&&(c(n),s(r))},g=e=>{let n=null;switch(e.key){case"Enter":y(e);break;case"ArrowRight":{const t=p.indexOf(e.currentTarget)+1;n=p[t]??p[0];break}case"ArrowLeft":{const t=p.indexOf(e.currentTarget)-1;n=p[t]??p[p.length-1];break}}n?.focus()};return r.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,o.A)("tabs",{"tabs--block":t},n)},u.map((e=>{let{value:n,label:t,attributes:l}=e;return r.createElement("li",(0,a.A)({role:"tab",tabIndex:i===n?0:-1,"aria-selected":i===n,key:n,ref:e=>p.push(e),onKeyDown:g,onClick:y},l,{className:(0,o.A)("tabs__item",f.tabItem,l?.className,{"tabs__item--active":i===n})}),t??n)})))}function k(e){let{lazy:n,children:t,selectedValue:a}=e;const o=(Array.isArray(t)?t:[t]).filter(Boolean);if(n){const e=o.find((e=>e.props.value===a));return e?(0,r.cloneElement)(e,{className:"margin-top--md"}):null}return r.createElement("div",{className:"margin-top--md"},o.map(((e,n)=>(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==a}))))}function b(e){const n=m(e);return r.createElement("div",{className:(0,o.A)("tabs-container",f.tabList)},r.createElement(v,(0,a.A)({},e,n)),r.createElement(k,(0,a.A)({},e,n)))}function N(e){const n=(0,h.A)();return r.createElement(b,(0,a.A)({key:String(n)},e))}const T={tabItem:"tabItem_Ymn6"};function E(e){let{children:n,hidden:t,className:a}=e;return r.createElement("div",{role:"tabpanel",className:(0,o.A)(T.tabItem,a),hidden:t},n)}const O={codeContainer:"codeContainer_lzJ3",copyButton:"copyButton_rH4I"},S={curl:"cURL",python:"Python",javascript:"JavaScript",typescript:"TypeScript",go:"Go",ruby:"Ruby"};function w(e){let{endpoint:n,method:t,params:a={},headers:o={}}=e;const[l,i]=(0,r.useState)("curl"),s={curl:(()=>{const e=Object.entries(o).map((e=>{let[n,t]=e;return`-H "${n}: ${t}"`})).join(" ");return`curl -X ${t.toUpperCase()} \\\n  ${e} \\\n  -d '${JSON.stringify(a)}' \\\n  "https://api.terrarium.dev/v1${n}"`})(),python:`import requests\n\nheaders = ${JSON.stringify(o,null,2)}\nparams = ${JSON.stringify(a,null,2)}\n\nresponse = requests.${t.toLowerCase()}(\n    'https://api.terrarium.dev/v1${n}',\n    headers=headers,\n    json=params\n)\n\nprint(response.json())`,javascript:`fetch('https://api.terrarium.dev/v1${n}', {\n  method: '${t.toUpperCase()}',\n  headers: ${JSON.stringify(o,null,2)},\n  body: JSON.stringify(${JSON.stringify(a,null,2)})\n})\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));`,typescript:`interface RequestParams {\n  ${Object.entries(a).map((e=>{let[n,t]=e;return`${n}: ${typeof t};`})).join("\n  ")}\n}\n\ninterface ResponseData {\n  // Define your response type here\n  data: any;\n}\n\nasync function makeRequest(): Promise<ResponseData> {\n  const response = await fetch('https://api.terrarium.dev/v1${n}', {\n    method: '${t.toUpperCase()}',\n    headers: ${JSON.stringify(o,null,2)},\n    body: JSON.stringify(${JSON.stringify(a,null,2)})\n  });\n\n  if (!response.ok) {\n    throw new Error(\`HTTP error! status: \${response.status}\`);\n  }\n\n  return response.json();\n}\n\n// Usage\nmakeRequest()\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));`,go:`package main\n\nimport (\n    "bytes"\n    "encoding/json"\n    "fmt"\n    "io/ioutil"\n    "net/http"\n)\n\nfunc main() {\n    // Prepare request body\n    params := ${JSON.stringify(a,null,2)}\n    jsonData, err := json.Marshal(params)\n    if err != nil {\n        panic(err)\n    }\n\n    // Create request\n    req, err := http.NewRequest("${t.toUpperCase()}", "https://api.terrarium.dev/v1${n}", bytes.NewBuffer(jsonData))\n    if err != nil {\n        panic(err)\n    }\n\n    // Add headers\n    ${Object.entries(o).map((e=>{let[n,t]=e;return`req.Header.Add("${n}", "${t}")`})).join("\n    ")}\n\n    // Make request\n    client := &http.Client{}\n    resp, err := client.Do(req)\n    if err != nil {\n        panic(err)\n    }\n    defer resp.Body.Close()\n\n    // Read response\n    body, err := ioutil.ReadAll(resp.Body)\n    if err != nil {\n        panic(err)\n    }\n\n    fmt.Println(string(body))\n}`,ruby:`require 'net/http'\nrequire 'uri'\nrequire 'json'\n\nuri = URI('https://api.terrarium.dev/v1${n}')\nhttp = Net::HTTP.new(uri.host, uri.port)\nhttp.use_ssl = true\n\nrequest = Net::HTTP::${t.charAt(0).toUpperCase()+t.slice(1).toLowerCase()}.new(uri)\n${Object.entries(o).map((e=>{let[n,t]=e;return`request["${n}"] = "${t}"`})).join("\n")}\n\nrequest.body = ${JSON.stringify(a,null,2)}.to_json\n\nresponse = http.request(request)\nputs response.read_body`};return r.createElement("div",{className:O.codeContainer},r.createElement(N,{values:Object.entries(S).map((e=>{let[n,t]=e;return{label:t,value:n}})),defaultValue:"curl",onChange:e=>i(e)},Object.entries(s).map((e=>{let[n,t]=e;return r.createElement(E,{key:n,value:n},r.createElement("pre",null,r.createElement("code",{className:`language-${n}`},t)))}))))}},98700:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>u,contentTitle:()=>i,default:()=>g,frontMatter:()=>l,metadata:()=>s,toc:()=>p});var r=t(58168),a=(t(96540),t(15680)),o=t(57189);const l={sidebar_position:2},i="Managing Tokens",s={unversionedId:"api/auth/tokens",id:"api/auth/tokens",title:"Managing Tokens",description:"Learn how to effectively manage your API tokens in Terrarium.",source:"@site/docs/api/auth/tokens.md",sourceDirName:"api/auth",slug:"/api/auth/tokens",permalink:"/docs/api/auth/tokens",draft:!1,editUrl:"https://github.com/CharlesIXofFrance/terrarium/tree/main/docs-site/docs/api/auth/tokens.md",tags:[],version:"current",lastUpdatedBy:"samgonzalez",lastUpdatedAt:1736899908,formattedLastUpdatedAt:"Jan 15, 2025",sidebarPosition:2,frontMatter:{sidebar_position:2},sidebar:"docs",previous:{title:"Authentication Overview",permalink:"/docs/api/auth/overview"},next:{title:"Security Best Practices",permalink:"/docs/api/auth/security"}},u={},p=[{value:"Token Lifecycle",id:"token-lifecycle",level:2},{value:"1. Token Generation",id:"1-token-generation",level:3},{value:"2. Token Validation",id:"2-token-validation",level:3},{value:"3. Token Expiration",id:"3-token-expiration",level:3},{value:"Token Types",id:"token-types",level:2},{value:"Access Tokens",id:"access-tokens",level:3},{value:"Refresh Tokens",id:"refresh-tokens",level:3},{value:"API Keys",id:"api-keys",level:3},{value:"Token Management",id:"token-management",level:2},{value:"Creating API Keys",id:"creating-api-keys",level:3},{value:"Listing API Keys",id:"listing-api-keys",level:3},{value:"Revoking Tokens",id:"revoking-tokens",level:3},{value:"Security Guidelines",id:"security-guidelines",level:2},{value:"Token Storage",id:"token-storage",level:3},{value:"Rotation Policy",id:"rotation-policy",level:3},{value:"Monitoring",id:"monitoring",level:3},{value:"Error Handling",id:"error-handling",level:2},{value:"Common Token Errors",id:"common-token-errors",level:3},{value:"Error Response Format",id:"error-response-format",level:3}],c={toc:p},y="wrapper";function g(e){let{components:n,...t}=e;return(0,a.yg)(y,(0,r.A)({},c,t,{components:n,mdxType:"MDXLayout"}),(0,a.yg)("h1",{id:"managing-tokens"},"Managing Tokens"),(0,a.yg)("p",null,"Learn how to effectively manage your API tokens in Terrarium."),(0,a.yg)("h2",{id:"token-lifecycle"},"Token Lifecycle"),(0,a.yg)("h3",{id:"1-token-generation"},"1. Token Generation"),(0,a.yg)("p",null,"Tokens are generated when:"),(0,a.yg)("ul",null,(0,a.yg)("li",{parentName:"ul"},"User logs in"),(0,a.yg)("li",{parentName:"ul"},"Token is refreshed"),(0,a.yg)("li",{parentName:"ul"},"API key is created")),(0,a.yg)("h3",{id:"2-token-validation"},"2. Token Validation"),(0,a.yg)("p",null,"Every API request goes through:"),(0,a.yg)("ul",null,(0,a.yg)("li",{parentName:"ul"},"Signature verification"),(0,a.yg)("li",{parentName:"ul"},"Expiration check"),(0,a.yg)("li",{parentName:"ul"},"Permission validation")),(0,a.yg)("h3",{id:"3-token-expiration"},"3. Token Expiration"),(0,a.yg)("ul",null,(0,a.yg)("li",{parentName:"ul"},"Access tokens expire after 1 hour"),(0,a.yg)("li",{parentName:"ul"},"Refresh tokens expire after 30 days"),(0,a.yg)("li",{parentName:"ul"},"API keys can have custom expiration")),(0,a.yg)("h2",{id:"token-types"},"Token Types"),(0,a.yg)("h3",{id:"access-tokens"},"Access Tokens"),(0,a.yg)("p",null,"Short-lived tokens used for API authentication."),(0,a.yg)("p",null,(0,a.yg)("strong",{parentName:"p"},"Structure:")),(0,a.yg)("pre",null,(0,a.yg)("code",{parentName:"pre",className:"language-json"},'{\n  "sub": "user_123",\n  "exp": 1643673600,\n  "permissions": ["read", "write"],\n  "type": "access"\n}\n')),(0,a.yg)("h3",{id:"refresh-tokens"},"Refresh Tokens"),(0,a.yg)("p",null,"Long-lived tokens used to obtain new access tokens."),(0,a.yg)("p",null,(0,a.yg)("strong",{parentName:"p"},"Structure:")),(0,a.yg)("pre",null,(0,a.yg)("code",{parentName:"pre",className:"language-json"},'{\n  "sub": "user_123",\n  "exp": 1646265600,\n  "family": "fam_123",\n  "type": "refresh"\n}\n')),(0,a.yg)("h3",{id:"api-keys"},"API Keys"),(0,a.yg)("p",null,"Permanent tokens for server-to-server communication."),(0,a.yg)("p",null,(0,a.yg)("strong",{parentName:"p"},"Structure:")),(0,a.yg)("pre",null,(0,a.yg)("code",{parentName:"pre",className:"language-json"},'{\n  "key_id": "key_123",\n  "exp": null,\n  "permissions": ["read"],\n  "type": "api_key"\n}\n')),(0,a.yg)("h2",{id:"token-management"},"Token Management"),(0,a.yg)("h3",{id:"creating-api-keys"},"Creating API Keys"),(0,a.yg)(o.A,{endpoint:"/auth/api-keys",method:"post",headers:{Authorization:"Bearer YOUR_ACCESS_TOKEN","Content-Type":"application/json"},params:{name:"Server Integration",permissions:["read"],expires_in:"30d"},mdxType:"CodeSamples"}),(0,a.yg)("h3",{id:"listing-api-keys"},"Listing API Keys"),(0,a.yg)(o.A,{endpoint:"/auth/api-keys",method:"get",headers:{Authorization:"Bearer YOUR_ACCESS_TOKEN","Content-Type":"application/json"},mdxType:"CodeSamples"}),(0,a.yg)("h3",{id:"revoking-tokens"},"Revoking Tokens"),(0,a.yg)(o.A,{endpoint:"/auth/api-keys/{key_id}",method:"delete",headers:{Authorization:"Bearer YOUR_ACCESS_TOKEN","Content-Type":"application/json"},mdxType:"CodeSamples"}),(0,a.yg)("h2",{id:"security-guidelines"},"Security Guidelines"),(0,a.yg)("h3",{id:"token-storage"},"Token Storage"),(0,a.yg)("p",null,"Store tokens securely based on their type:"),(0,a.yg)("table",null,(0,a.yg)("thead",{parentName:"table"},(0,a.yg)("tr",{parentName:"thead"},(0,a.yg)("th",{parentName:"tr",align:null},"Token Type"),(0,a.yg)("th",{parentName:"tr",align:null},"Storage Location"),(0,a.yg)("th",{parentName:"tr",align:null},"Security Level"))),(0,a.yg)("tbody",{parentName:"table"},(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"Access Token"),(0,a.yg)("td",{parentName:"tr",align:null},"Memory"),(0,a.yg)("td",{parentName:"tr",align:null},"High")),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"Refresh Token"),(0,a.yg)("td",{parentName:"tr",align:null},"HTTP-only Cookie"),(0,a.yg)("td",{parentName:"tr",align:null},"High")),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"API Key"),(0,a.yg)("td",{parentName:"tr",align:null},"Environment Variable"),(0,a.yg)("td",{parentName:"tr",align:null},"High")))),(0,a.yg)("h3",{id:"rotation-policy"},"Rotation Policy"),(0,a.yg)("p",null,"Implement token rotation for better security:"),(0,a.yg)("ol",null,(0,a.yg)("li",{parentName:"ol"},(0,a.yg)("p",{parentName:"li"},(0,a.yg)("strong",{parentName:"p"},"Access Tokens")),(0,a.yg)("ul",{parentName:"li"},(0,a.yg)("li",{parentName:"ul"},"Rotate every hour"),(0,a.yg)("li",{parentName:"ul"},"Use refresh token to get new ones"))),(0,a.yg)("li",{parentName:"ol"},(0,a.yg)("p",{parentName:"li"},(0,a.yg)("strong",{parentName:"p"},"Refresh Tokens")),(0,a.yg)("ul",{parentName:"li"},(0,a.yg)("li",{parentName:"ul"},"Rotate every 30 days"),(0,a.yg)("li",{parentName:"ul"},"Implement refresh token rotation"))),(0,a.yg)("li",{parentName:"ol"},(0,a.yg)("p",{parentName:"li"},(0,a.yg)("strong",{parentName:"p"},"API Keys")),(0,a.yg)("ul",{parentName:"li"},(0,a.yg)("li",{parentName:"ul"},"Rotate manually"),(0,a.yg)("li",{parentName:"ul"},"Use key rotation for sensitive operations")))),(0,a.yg)("h3",{id:"monitoring"},"Monitoring"),(0,a.yg)("p",null,"Monitor token usage for security:"),(0,a.yg)("pre",null,(0,a.yg)("code",{parentName:"pre",className:"language-javascript"},"// Example token usage monitoring\nasync function logTokenUsage(tokenId, action) {\n  await fetch('/auth/logs', {\n    method: 'POST',\n    headers: {\n      'Content-Type': 'application/json',\n    },\n    body: JSON.stringify({\n      token_id: tokenId,\n      action: action,\n      timestamp: new Date().toISOString(),\n    }),\n  });\n}\n")),(0,a.yg)("h2",{id:"error-handling"},"Error Handling"),(0,a.yg)("h3",{id:"common-token-errors"},"Common Token Errors"),(0,a.yg)("table",null,(0,a.yg)("thead",{parentName:"table"},(0,a.yg)("tr",{parentName:"thead"},(0,a.yg)("th",{parentName:"tr",align:null},"Error Code"),(0,a.yg)("th",{parentName:"tr",align:null},"Description"),(0,a.yg)("th",{parentName:"tr",align:null},"Solution"))),(0,a.yg)("tbody",{parentName:"table"},(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"401"),(0,a.yg)("td",{parentName:"tr",align:null},"Token expired"),(0,a.yg)("td",{parentName:"tr",align:null},"Refresh the token")),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"403"),(0,a.yg)("td",{parentName:"tr",align:null},"Insufficient permissions"),(0,a.yg)("td",{parentName:"tr",align:null},"Check token scope")),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"422"),(0,a.yg)("td",{parentName:"tr",align:null},"Invalid token format"),(0,a.yg)("td",{parentName:"tr",align:null},"Verify token structure")))),(0,a.yg)("h3",{id:"error-response-format"},"Error Response Format"),(0,a.yg)("pre",null,(0,a.yg)("code",{parentName:"pre",className:"language-json"},'{\n  "error": {\n    "code": "TOKEN_EXPIRED",\n    "message": "The access token has expired",\n    "details": {\n      "expired_at": "2024-01-15T00:00:00Z"\n    }\n  }\n}\n')))}g.isMDXComponent=!0}}]);