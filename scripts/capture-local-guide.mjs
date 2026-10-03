#!/usr/bin/env node
// Local-only mobile visual check for the generated Guide; does not publish.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
const root=path.resolve(import.meta.dirname,'..');
const out=path.resolve(process.argv[2]||path.join(os.tmpdir(),'guide-mobile-check.png'));
const selector=process.argv[3]||'#d5-execution';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'guide-preview-'));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--window-size=569,833','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
let socket,serial=0;const pending=new Map();
async function until(fn,ms=15000){const end=Date.now()+ms;while(Date.now()<end){const v=await fn();if(v)return v;await delay(200);}throw Error('Guide preview timed out');}
function send(method,params={}){const id=++serial;socket.send(JSON.stringify({id,method,params}));return new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));}
try{
  const port=await until(()=>{const f=path.join(profile,'DevToolsActivePort');return fs.existsSync(f)&&fs.readFileSync(f,'utf8').split('\n')[0];});
  const page=await until(async()=>{const tabs=await (await fetch('http://127.0.0.1:'+port+'/json/list')).json();return tabs.find(t=>t.type==='page');});
  socket=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  socket.onmessage=e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);};
  await send('Page.enable');await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:569,height:833,deviceScaleFactor:1,mobile:true});
  await send('Page.navigate',{url:'file://'+path.join(root,'index.html')});
  await until(async()=>{const r=await send('Runtime.evaluate',{expression:'Boolean(document.querySelector("#d5-execution [data-edge=hotel-meal] .exec-route-photo img"))',returnByValue:true});return r.result.value;},20000);
  let interaction=null;
  if(process.argv.includes('--verify')){
    const checked=await send('Runtime.evaluate',{expression:`(() => {
      const z=document.querySelector('#d5-execution'),edge=id=>z.querySelector('[data-edge="'+id+'"]'),key=id=>edge(id).dataset.routeKey;
      const need=(ok,message)=>{if(!ok)throw Error(message)};
      need(key('hotel-meal').includes('gcj02:113.108443,36.179902'),'default meal route');
      need(!edge('sight-gate').hidden&&!edge('gate-museum').hidden&&edge('sight-museum').hidden,'real path has both old-town stops');
      z.querySelector('[data-pick-food="ludingji"]').click();
      need(key('hotel-meal').includes('poi:B0L65HONIR')&&key('meal-sight').startsWith('poi:B0L65HONIR'),'meal changes both neighbors');
      need(edge('hotel-meal').querySelector('img')?.getAttribute('src')==='assets/routes/hotel-ludingji-walk.png','meal changes route image');
      z.querySelector('[data-pick-sight="shangdang"]').click();
      need(key('meal-sight').includes('poi:B016300H0N')&&!edge('sight-museum').hidden,'sight changes inbound and outbound');
      need(edge('sight-gate').hidden&&edge('gate-museum').hidden&&z.querySelector('[data-slot="gate"]').hidden,'no duplicate gate');
      z.querySelector('[data-edge="sight-museum"] [data-mode="walking"]').click();
      need(key('sight-museum').endsWith('|walking')&&!edge('sight-museum').querySelector('.exec-route-photo'),'mode switch clears stale image');
      z.querySelector('[data-pick-sight="temple"]').click();z.querySelector('[data-pick-food="hongji"]').click();
      return {passed:true,checks:7,restoredMeal:'hongji',restoredSight:'temple'};
    })()`,returnByValue:true});
    if(checked.exceptionDetails||!checked.result.value?.passed)throw Error('D5 real-browser interaction check failed: '+JSON.stringify(checked.exceptionDetails||checked.result.value));
    interaction=checked.result.value;
  }
  const result=await send('Runtime.evaluate',{expression:`(() => {document.querySelector('#day-5').open=true;const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('target not found');e.scrollIntoView({block:'start'});return {text:e.innerText.slice(0,500),image:e.querySelector('img')?.getAttribute('src')||null};})()`,returnByValue:true});
  await delay(1600);
  const loaded=await send('Runtime.evaluate',{expression:`(() => {const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'start'});return [...e.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),loaded:i.naturalWidth>0}));})()`,returnByValue:true});
  if(result.result.value?.image&&!loaded.result.value.some(i=>i.loaded))throw Error('card image did not load in mobile preview');
  await delay(250);
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,Buffer.from(shot.data,'base64'));
  console.log(JSON.stringify({out,selector,...result.result.value,images:loaded.result.value,interaction}));
}finally{socket?.close();chrome.kill();}
