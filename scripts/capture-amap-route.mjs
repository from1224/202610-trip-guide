#!/usr/bin/env node
// Capture the visible Amap route page for manual review. Never marks a screenshot verified.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const data=require('../data/d5-execution.json');
const core=require('./execution-card-core.js');
const args=Object.fromEntries(process.argv.slice(2).reduce((pairs,v,i,a)=>{if(v.startsWith('--'))pairs.push([v.slice(2),a[i+1]]);return pairs;},[]));
const meal=args.meal||data.slots.meal,sight=args.sight||data.slots.sight,edge=args.edge||'hotel-meal';
const selection={...data.slots,meal,sight};
const route=core.resolve(data,selection,edge,args.mode);
const output=path.resolve(args.out||path.join(os.tmpdir(),'amap-route-'+edge+'.png'));
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'amap-capture-'));
const browser=spawn(chrome,['--headless=new','--disable-gpu','--hide-scrollbars','--window-size=1280,900','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
let socket,serial=0;
const pending=new Map();
async function until(fn,ms=15000){const end=Date.now()+ms;while(Date.now()<end){const value=await fn();if(value)return value;await delay(200);}throw Error('Timed out waiting for browser');}
function send(method,params={}){const id=++serial;socket.send(JSON.stringify({id,method,params}));return new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));}
try{
  const portFile=path.join(profile,'DevToolsActivePort');
  const port=await until(()=>fs.existsSync(portFile)&&fs.readFileSync(portFile,'utf8').split('\n')[0]);
  const target=await until(async()=>{const pages=await (await fetch('http://127.0.0.1:'+port+'/json/list')).json();return pages.find(p=>p.type==='page');});
  socket=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  socket.onmessage=event=>{const message=JSON.parse(event.data);if(!message.id)return;const promise=pending.get(message.id);if(!promise)return;pending.delete(message.id);message.error?promise.reject(Error(message.error.message)):promise.resolve(message.result);};
  await send('Page.enable');await send('Runtime.enable');
  await send('Page.navigate',{url:route.routeUrl});
  await delay(8500);
  const inspection=await send('Runtime.evaluate',{expression:`(() => ({url:location.href,title:document.title,text:document.body.innerText.slice(0,1800),dialogNodes:[...document.querySelectorAll('[role="dialog"],.login,.login-box,[class*="login"],[class*="Login"]')].slice(0,15).map(e=>({tag:e.tagName,cls:e.className,text:e.innerText?.slice(0,100)}))}))()`,returnByValue:true});
  if(args.inspect)console.log(JSON.stringify(inspection.result.value));
  const expected={walking:'步行规划',driving:'驾车规划',cycling:'骑行规划'}[route.mode];
  if(!inspection.result.value?.title?.includes(expected))throw Error('Amap mode mismatch: requested '+route.mode+', got '+inspection.result.value?.title+'; screenshot not saved');
  if(args.hideLogin){
    await send('Runtime.evaluate',{expression:`(() => {for(const e of document.querySelectorAll('body *')){const t=e.innerText;if(t&&t.length<1800&&t.includes('短信登录')&&t.includes('二维码登录')){e.style.display='none';e.setAttribute('data-capture-hidden','login');}}for(const e of document.querySelectorAll('body *')){if(e.childElementCount||e.textContent.trim()!=='移动端')continue;let p=e;while(p&&p!==document.body){const r=p.getBoundingClientRect();if(r.width>200&&r.width<350&&r.height>150&&r.height<400){p.style.display='none';p.setAttribute('data-capture-hidden','mobile-promo');break;}p=p.parentElement;}}return [...document.querySelectorAll('[data-capture-hidden]')].map(e=>e.getAttribute('data-capture-hidden'))})()`,returnByValue:true});
    await delay(800);
  }
  const result=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,Buffer.from(result.data,'base64'));
  console.log(JSON.stringify({output,routeKey:route.key,url:route.routeUrl,mode:route.mode,hiddenLogin:Boolean(args.hideLogin),title:inspection.result.value?.title}));
}finally{socket?.close();browser.kill();}
