import assert from "node:assert/strict";
import {readFile,readdir,access} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url)),plugin=path.join(root,"plugins/planning-assistant");
const skillDir=path.join(plugin,"skills/planning-assistant-workflow"),refDir=path.join(skillDir,"references");
const readJSON=async p=>JSON.parse(await readFile(p,"utf8"));
const exists=p=>access(p).then(()=>true,()=>false);

// 매니페스트: 두 형식의 이름·버전·화면 정보가 같고, MCP·로컬 실행 설정이 없어야 한다.
const manifest=await readJSON(path.join(plugin,"plugin.json")),legacy=await readJSON(path.join(plugin,".codex-plugin/plugin.json"));
assert.equal(manifest.name,legacy.name);assert.equal(manifest.version,legacy.version);
assert.deepEqual(manifest.extensions["com.openai"].interface,legacy.interface);
assert.ok(manifest.extensions["com.openai"].interface.shortDescription.length<=30);
for(const m of [manifest,manifest.extensions["com.openai"],legacy]){assert.equal(m.mcpServers,undefined);assert.equal(m.requires_local_executor,undefined);}
const market=await readJSON(path.join(root,".agents/plugins/marketplace.json"));
assert.equal(path.resolve(root,market.plugins[0].source.path),plugin);

// 실행 파일·서버가 다시 들어오지 않아야 한다.
for(const p of ["runtime","server",".mcp.json","mcp.json"])assert.equal(await exists(path.join(plugin,p)),false,p);

// 지침 파일 수: 전체 63개, 전문가 관점(페르소나) 30개.
const refs=(await readdir(refDir)).filter(f=>f.endsWith(".md"));
assert.equal(refs.length,63);
const main=await readFile(path.join(skillDir,"SKILL.md"),"utf8");
const personas=[...main.matchAll(/^- \[.+\]\(references\/[a-z0-9-]+\.md\) — persona\r?$/gm)].length+refs.filter(f=>f.startsWith("persona-")).length;
assert.equal(personas,30);

// 링크: SKILL.md와 지침 안의 링크가 모두 실제 파일을 가리키고, 모든 지침이 SKILL.md에서 연결되어야 한다.
const linked=new Set();
for(const [,p] of main.matchAll(/\]\((references\/[^)]+)\)/g)){await readFile(path.join(skillDir,p));linked.add(path.basename(p));}
let links=0;
for(const f of refs){const s=await readFile(path.join(refDir,f),"utf8");
 assert.doesNotMatch(s,/read_guide|list_guides|지침 ID:/,f);
 for(const [,p] of s.matchAll(/\]\(([a-z0-9-]+\.md)\)/g)){assert.ok(refs.includes(p),f+" → "+p);links++;}}
for(const f of refs)assert.ok(linked.has(f),"SKILL.md에서 연결되지 않은 지침: "+f);

// 회사 정보·개인 경로가 섞이지 않아야 한다.
let inspected=0;
async function scan(dir){for(const item of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())await scan(p);else if(/\.(json|md|mjs)$/.test(p)){const s=await readFile(p,"utf8");assert.doesNotMatch(s,/C:[\\/]+Users[\\/]|AppData[\\/]|607-86-05339|제로웹|케어벨|carebell|zeroweb/i,p);inspected++;}}}
await scan(plugin);
console.log(JSON.stringify({passed:true,version:manifest.version,inspectedTextFiles:inspected,guides:refs.length,personas,crossLinks:links,bundledRuntime:false,mcp:false}));
