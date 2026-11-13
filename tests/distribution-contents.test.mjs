import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm, cp, symlink} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectPluginContents} from '../scripts/check-plugin-contents.mjs';

const repo=fileURLToPath(new URL('../',import.meta.url));
const tempBase=path.resolve(os.tmpdir());
async function fixture(run) {
  const dir=await mkdtemp(path.join(tempBase,'jarvis-distribution-'));
  const put=async (file,content)=>{const p=path.join(dir,file);await mkdir(path.dirname(p),{recursive:true});await writeFile(p,content);};
  try {await run(dir,put);}
  finally {
    // Guard the exact temporary target before recursive cleanup on Windows.
    assert.equal(path.dirname(path.resolve(dir)),tempBase);
    assert.ok(path.basename(dir).startsWith('jarvis-distribution-'));
    await rm(dir,{recursive:true,force:true});
  }
}

test('current package has no runtime or MCP settings, based on inventory',async()=>{
  const result=await inspectPluginContents(path.join(repo,'plugins/planning-assistant'));
  assert.deepEqual(result.issues,[]);
  assert.equal(result.bundledRuntime,false);assert.equal(result.mcp,false);
  assert.equal(result.files.length,71);
});

test('nested uppercase executable and disguised files cannot pass',async()=>fixture(async(dir,put)=>{
  await put('skills/example/references/tool.MJS','export const fixture=true;');
  await put('assets/hidden.txt','script disguised as text');
  const r=await inspectPluginContents(dir);
  assert.equal(r.bundledRuntime,true);
  assert.ok(r.issues.some(x=>x.includes('Executable file: skills/example/references/tool.MJS')));
  assert.ok(r.issues.some(x=>x.includes('Unexpected file: assets/hidden.txt')));
}));

test('nested MCP configs and manifest extension settings are detected',async()=>fixture(async(dir,put)=>{
  await put('assets/nested/.MCP.JSON','{}');
  await put('plugin.json',JSON.stringify({extensions:{other:{mcp_servers:{},hooks:{}}}}));
  const r=await inspectPluginContents(dir);
  assert.equal(r.mcp,true);assert.equal(r.bundledRuntime,true);
  assert.ok(r.mcpLocations.includes('assets/nested/.MCP.JSON'));
  assert.ok(r.mcpLocations.includes('plugin.json.extensions.other.mcp_servers'));
  assert.ok(r.runtimeFiles.includes('plugin.json.extensions.other.hooks'));
}));

test('ordinary metadata, reference Markdown and inert asset are allowed',async()=>fixture(async(dir,put)=>{
  await put('plugin.json',JSON.stringify({name:'sample',description:'Commands and MCP are discussed here, not configured.'}));
  await put('skills/sample/SKILL.md','# Example');
  await put('skills/sample/references/example.md','Example');
  await put('assets/example.png',Buffer.from([137,80,78,71]));
  assert.deepEqual((await inspectPluginContents(dir)).issues,[]);
}));

test('forbidden directories are rejected at any depth',async()=>fixture(async(dir,put)=>{
  await put('skills/sample/server/note.md','example');
  const r=await inspectPluginContents(dir);
  assert.ok(r.issues.some(x=>x==='Forbidden directory: skills/sample/server'));
}));

test('symlinks are rejected without following links',async t=>fixture(async(dir)=>{
  const target=path.join(dir,'target');await mkdir(target);
  try {await symlink(target,path.join(dir,'linked'),process.platform==='win32'?'junction':'dir');}
  catch(e) {
    if (e.code==='EPERM'||e.code==='EACCES') {t.skip('Environment cannot create a link fixture; link rejection is unverified here.');return;}
    throw e;
  }
  const r=await inspectPluginContents(dir);
  assert.ok(r.issues.some(x=>x==='Symlink: linked'));
  assert.ok(!r.files.some(x=>x.startsWith('linked/')));
}));

test('distribution CLI fails for an unexpected executable in a package copy',async()=>fixture(async(dir)=>{
  await cp(repo,dir,{recursive:true,filter:p=>path.basename(p)!=='.git'});
  const unexpected=path.join(dir,'plugins/planning-assistant/helpers/unexpected.mjs');
  await mkdir(path.dirname(unexpected),{recursive:true});
  await writeFile(unexpected,'export const fixture=true;');
  assert.throws(()=>execFileSync(process.execPath,[path.join(dir,'tests/verify-distribution.mjs')],{encoding:'utf8',stdio:'pipe'}),e=>{
    assert.equal(e.status,1);
    assert.match(e.stderr,/Executable file: helpers\/unexpected\.mjs/);
    return true;
  });
}));
