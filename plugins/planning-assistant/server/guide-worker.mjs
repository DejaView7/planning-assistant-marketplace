const LIBRARY = [];
const VERSION="0.2.0",PROTOCOL="2026-07-28";
const types=["all","skill","persona","method","prompt","workflow"];
const schema=(properties,required=[])=>({type:"object",properties,required,additionalProperties:false});
const TOOLS=[
 {name:"list_guides",description:"사업계획·제안서 작성을 위한 일반 스킬·페르소나·기법의 목록을 조회합니다. 회사 자료나 업무 내용을 입력하지 않습니다.",inputSchema:schema({category:{type:"string",enum:types}}),annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}},
 {name:"read_guide",description:"목록에 있는 일반 작성 지침을 읽습니다. resource_id와 offset만 전달합니다. 회사 정보·초안·사용자 파일은 전송하지 않습니다.",inputSchema:schema({resource_id:{type:"string",pattern:"^[a-z0-9-]{1,80}$",maxLength:80},offset:{type:"integer",minimum:0,maximum:1000000}},["resource_id"]),annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}}
];
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
function validate(tool,args){
 if(!args||typeof args!=="object"||Array.isArray(args))throw new Error("입력은 객체여야 합니다.");
 for(const key of Object.keys(args))if(!Object.hasOwn(tool.inputSchema.properties,key))throw new Error("허용하지 않는 입력입니다. 회사 정보나 문서 내용은 전달하지 마세요.");
 for(const key of tool.inputSchema.required)if(!Object.hasOwn(args,key))throw new Error("필수 입력이 없습니다: "+key);
 if(args.category!==undefined&&!types.includes(args.category))throw new Error("지원하지 않는 분류입니다.");
 if(args.resource_id!==undefined&&(typeof args.resource_id!=="string"||!/^[a-z0-9-]{1,80}$/.test(args.resource_id)))throw new Error("잘못된 자료 ID입니다.");
 if(args.offset!==undefined&&(!Number.isInteger(args.offset)||args.offset<0||args.offset>1000000))throw new Error("잘못된 시작 위치입니다.");
}
export function invoke(name,args,library){
 const tool=TOOLS.find(t=>t.name===name);if(!tool)throw new Error("지원하지 않는 도구입니다.");
 validate(tool,args);
 if(name==="list_guides")return {version:VERSION,resources:library.filter(r=>!args.category||args.category==="all"||r.category===args.category).map(({id,title,category})=>({resource_id:id,title,category})),notice:"일반 작성 방법만 제공합니다. 회사 자료와 초안은 사용자의 대화 또는 로컬에서 처리합니다."};
 const r=library.find(r=>r.id===args.resource_id);if(!r)throw new Error("자료를 찾을 수 없습니다.");
 const start=args.offset??0;
 return {resource_id:r.id,title:r.title,category:r.category,text:r.text.slice(start,start+12000),next_offset:start+12000<r.text.length?start+12000:null};
}
async function readBody(request){
 if(!request.body)return "";
 const reader=request.body.getReader(),chunks=[];let size=0;
 for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>8192){await reader.cancel();throw new Error("SIZE");}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}return new TextDecoder().decode(bytes);
}
export function createWorker(library){
 return {async fetch(request){
 const path=new URL(request.url).pathname;
 if(path==="/health"&&request.method==="GET")return json({service:"planning-guide-mcp",version:VERSION,resources:library.length,read_only:true});
 if(path==="/"&&request.method==="GET")return new Response('<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>사업기획 가이드 MCP</title><body style="font:17px/1.8 system-ui;max-width:760px;margin:8vh auto;padding:24px;background:#f4f8f7;color:#173f39"><p>PLANNING GUIDE · MCP</p><h1>사업기획 가이드 서버</h1><p>일반 스킬·페르소나·작성 기법을 조회하는 읽기 전용 MCP 서버입니다.</p><ul><li>전문 스킬 7종과 전문가 관점 30종</li><li>스텝백·선택적 관점 협업·문서 편집 지침</li><li>회사 자료, 초안, 개인 업무 저장 기능 없음</li></ul><p>연결 주소: <code>/mcp</code></p><p>서버는 작성 방법을 제공하며, 실제 분석과 집필은 연결된 AI가 사용자의 대화에서 수행합니다.</p></body></html>',{headers:{"Content-Type":"text/html; charset=utf-8","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'","X-Content-Type-Options":"nosniff"}});
 if(path!=="/mcp")return json({error:"Not found"},404);
 if(request.method!=="POST")return json({error:"POST required"},405);
 if(!request.headers.get("oai-authenticated-user-id"))return json({error:"Authenticated identity required"},401);
 if(!request.headers.get("content-type")?.includes("application/json"))return json({error:"JSON required"},415);
 let body;try{body=await readBody(request);}catch{return json({error:"Request too large"},413);}
 let rpc;try{rpc=JSON.parse(body);}catch{return json({jsonrpc:"2.0",id:null,error:{code:-32700,message:"Parse error"}},400);}
 if(!rpc||typeof rpc!=="object"||Array.isArray(rpc)||rpc.jsonrpc!=="2.0"||typeof rpc.method!=="string"||(rpc.id!==undefined&&rpc.id!==null&&typeof rpc.id!=="string"&&typeof rpc.id!=="number"))return json({jsonrpc:"2.0",id:null,error:{code:-32600,message:"Invalid request"}},400);
 if(rpc.id===undefined)return new Response(null,{status:202});
 const ok=result=>json({jsonrpc:"2.0",id:rpc.id,result});
 if(rpc.method==="server/discover")return ok({supportedVersions:[PROTOCOL],capabilities:{tools:{}},serverInfo:{name:"planning-guide-mcp",version:VERSION}});
 if(rpc.method==="initialize"){
 const supported=[PROTOCOL,"2025-11-25","2025-06-18","2025-03-26"];
 return ok({protocolVersion:supported.includes(rpc.params?.protocolVersion)?rpc.params.protocolVersion:PROTOCOL,capabilities:{tools:{}},serverInfo:{name:"planning-guide-mcp",version:VERSION},instructions:"먼저 workflow-common 지침을 읽습니다. 회사 정보와 문서 내용은 도구 인수로 보내지 않고 사용자 대화에서 처리합니다."});
 }
 if(rpc.method==="ping")return ok({});
 if(rpc.method==="tools/list")return ok({tools:TOOLS});
 if(rpc.method==="tools/call"){
 try{const result=invoke(rpc.params?.name,rpc.params?.arguments??{},library);return ok({content:[{type:"text",text:JSON.stringify(result)}],structuredContent:result});}
 catch(error){return ok({content:[{type:"text",text:error.message}],isError:true});}
 }
 return json({jsonrpc:"2.0",id:rpc.id,error:{code:-32601,message:"Method not found"}});
 }};
}
export default createWorker(LIBRARY);

