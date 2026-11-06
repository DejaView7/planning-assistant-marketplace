import readline from "node:readline";
import {readFile} from "node:fs/promises";
import {createWorker} from "./guide-worker.mjs";
const library=JSON.parse(await readFile(new URL("./library.json",import.meta.url),"utf8"));
const worker=createWorker(library);
const input=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
for await(const line of input){
 if(!line.trim())continue;
 try{
  if(Buffer.byteLength(line)>8192){process.stdout.write(JSON.stringify({jsonrpc:"2.0",id:null,error:{code:-32600,message:"Request too large"}})+"\n");continue;}
  const response=await worker.fetch(new Request("http://local/mcp",{method:"POST",headers:{"content-type":"application/json","oai-authenticated-user-id":"local-stdio"},body:line}));
  if(response.status!==202)process.stdout.write(await response.text()+"\n");
 }catch{process.stdout.write(JSON.stringify({jsonrpc:"2.0",id:null,error:{code:-32603,message:"Request failed"}})+"\n");}
}

