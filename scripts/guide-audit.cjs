#!/usr/bin/env node
// Read-only Guide audit. It reports missing evidence; it never treats a coordinate sketch as a route screenshot.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {execFileSync,spawnSync}=require('node:child_process');
const root=path.join(__dirname,'..'),data=require('../data/d5-execution.json'),core=require('./execution-card-core.js');
const {build,range}=require('./build-later-days.cjs');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),later=require('../data/later-days.json');
const checks=[];
function check(id,fn){try{fn();checks.push({id,status:'pass'});}catch(e){checks.push({id,status:'fail',detail:e.message});}}
check('data-schema',()=>core.validate(data));
check('generated-guide-current',()=>assert.equal(build(html,later),html));
check('card-template-slots',()=>{const page=html.slice(...range(html,5));for(const slot of ['start','meal','sight','end'])assert(page.includes('data-slot="'+slot+'"'));for(const edge of data.edges)assert(page.includes('data-edge="'+edge.id+'"'));});
check('private-data-boundary',()=>{for(const value of ['18235529994','晋D53906','李慧丽'])assert(!html.includes(value));});
for(const script of ['test-execution-card-core.cjs','test-later-days.cjs','test-itinerary.cjs'])check(script,()=>execFileSync(process.execPath,[path.join(__dirname,script)],{stdio:'pipe'}));
function domLibrary(){
  let globalRoot='';try{globalRoot=execFileSync('npm',['root','-g'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch(_){}
  const candidates=[process.env.GUIDE_LINKEDOM_PATH,'linkedom',globalRoot&&path.join(globalRoot,'openclaw/node_modules/linkedom')].filter(Boolean);
  for(const candidate of candidates)try{return require(candidate);}catch(_){}
  return null;
}
const dom=domLibrary();
if(dom)check('dom-neighbor-switch',()=>{
  const {window}=dom.parseHTML(html);window.GuideExecutionCore=core;
  window.HTMLElement.prototype.scrollTo=function(o){this.scrollLeft=o.left;};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'execution-cards.js'),'utf8'),{window,globalThis:window,setTimeout,clearTimeout,URLSearchParams});
  const doc=window.document,zone=doc.querySelector('#d5-execution'),key=id=>zone.querySelector('[data-edge="'+id+'"]').dataset.routeKey;
  assert(zone.querySelector('[data-slot="end"] .exec-title a')?.getAttribute('href').includes('B0L2MSZFO8'),'museum title links to fixed Amap POI');
  assert(zone.querySelector('[data-slot="end"] .exec-bell')?.getAttribute('href').includes('package=com.xiaocai.tripcard'),'museum bell sends native trip card');
  assert(zone.querySelector('[data-edge="hotel-meal"] .exec-route-photo img')?.getAttribute('src')==='assets/routes/hotel-hongji-drive.png');
  assert(zone.querySelector('[data-edge="sight-gate"] .exec-route-photo img')?.getAttribute('src')==='assets/routes/temple-shangdang-walk.png');
  assert(zone.querySelector('[data-edge="gate-museum"] .exec-route-photo img')?.getAttribute('src')==='assets/routes/shangdang-museum-drive.png');
  assert(zone.querySelector('[data-edge="sight-museum"]').hidden,'direct museum leg hidden in actual sequence');
  assert(!zone.querySelector('.exec-map'),'do not render coordinate sketch as Amap route image');
  const beforeMuseum=key('gate-museum');
  doc.querySelector('[data-pick-food="ludingji"]').dispatchEvent(new window.Event('click',{bubbles:true}));
  assert(key('hotel-meal').includes('poi:B0L65HONIR'));assert(key('meal-sight').startsWith('poi:B0L65HONIR'));assert.equal(key('gate-museum'),beforeMuseum);
  assert(zone.querySelector('[data-edge="hotel-meal"] .exec-route-photo img')?.getAttribute('src')==='assets/routes/hotel-ludingji-walk.png');
  const beforeHotel=key('hotel-meal');
  doc.querySelector('[data-pick-sight="shangdang"]').dispatchEvent(new window.Event('click',{bubbles:true}));
  assert(key('meal-sight').includes('poi:B016300H0N'));assert(key('sight-museum').startsWith('poi:B016300H0N'));assert.equal(key('hotel-meal'),beforeHotel);
  assert(zone.querySelector('[data-edge="sight-gate"]').hidden&&zone.querySelector('[data-edge="gate-museum"]').hidden,'skip view must hide duplicate gate');
  assert(zone.querySelector('[data-slot="gate"]').hidden,'skip view must hide duplicate gate card');
  assert(zone.querySelector('[data-edge="sight-museum"] .exec-route-photo img')?.getAttribute('src')==='assets/routes/shangdang-museum-drive.png');
  const beforeMeal=key('meal-sight');
  doc.querySelector('[data-edge-choice="sight-museum"][data-mode="walking"]').dispatchEvent(new window.Event('click',{bubbles:true}));
  assert(key('sight-museum').endsWith('|walking'));assert.equal(key('meal-sight'),beforeMeal);
  assert(!zone.querySelector('[data-edge="sight-museum"] .exec-route-photo'),'switching mode must clear old route image');
});
else checks.push({id:'dom-neighbor-switch',status:'not-run',detail:'linkedom unavailable; pass GUIDE_LINKEDOM_PATH to enable the click test'});
const routes=[];
for(const meal of data.choices)for(const sight of data.sightChoices){const selection={...data.slots,meal,sight};for(const edge of core.activeEdges(data,selection)){const r=core.resolve(data,selection,edge.id);routes.push({meal,sight,edge:edge.id,key:r.key,level:r.evidence?(r.evidence.distanceM?'measured':'user-reported'):'missing'});}}
const counts=Object.fromEntries(['measured','user-reported','missing'].map(level=>[level,routes.filter(r=>r.level===level).length]));
const photos=[];
for(const [id,p] of Object.entries(data.places)){
  if(p.photo)photos.push({id,url:p.photo,source:p.photoSource,caption:p.photoCaption,verified:process.argv.includes('--online')?'pending':'not-checked'});
  for(const kind of ['exhibitions','artifacts'])for(const [index,item] of (p[kind]||[]).entries()){
    if(item.photo)photos.push({id:`${id}.${kind}.${index}`,url:item.photo,source:item.photoSource||item.source,caption:item.photoCaption,verified:process.argv.includes('--online')?'pending':'not-checked'});
  }
}
check('photo-provenance',()=>{for(const p of photos){assert.match(p.url,/^https:\/\//,p.id+' image URL');assert.match(p.source||'',/^https:\/\//,p.id+' source');assert(p.caption,p.id+' caption');}});
function screenshotReady(e){
  const s=e.screenshot;
  if(!s||typeof s!=='object'||!s.path||!s.source||!s.checkedAt||s.reviewed!==true)return false;
  if(!/^https:\/\//.test(s.source)||path.isAbsolute(s.path)||s.path.split(/[\\/]/).includes('..'))return false;
  try{
    const target=fs.realpathSync(path.resolve(root,s.path));
    return target.startsWith(path.join(root,'assets')+path.sep)&&fs.statSync(target).isFile();
  }catch(_){return false;}
}
async function main(){
  if(process.argv.includes('--online'))for(const p of photos){
    const response=spawnSync('curl',['-I','-L','-sS','--max-time','8','-o','/dev/null','-w','%{http_code}',p.url],{encoding:'utf8'});
    p.verified=response.error?'error:'+response.error.code:response.status===0?'http-'+response.stdout.trim():'error:'+response.status;
  }
  const uniqueRouteKeys=[...new Set(routes.map(r=>r.key))];
  const missingScreenshotKeys=uniqueRouteKeys.filter(key=>!data.routeEvidence.some(e=>core.routeKey(e.fromKey,e.toKey,e.mode)===key&&screenshotReady(e)));
  const gaps={foodPhotos:data.choices.filter(id=>!data.places[id].photo),museumArtifactPhotos:(data.places.museum.artifacts||[]).filter(item=>!item.photo).map(item=>item.name),routeScreenshots:missingScreenshotKeys.length,routeScreenshotKeys:missingScreenshotKeys,entranceAndParking:Object.entries(data.places).filter(([,p])=>p.kind!=='hotel'&&!(p.access?.status==='verified'&&p.access?.source&&p.access?.checkedAt)).map(([id])=>id),documentedDirectionOnly:Object.entries(data.places).filter(([,p])=>p.access?.status==='documented-direction').map(([id])=>id)};
  const blocked=gaps.foodPhotos.length>0||gaps.museumArtifactPhotos.length>0||gaps.routeScreenshots>0||gaps.entranceAndParking.length>0||photos.some(p=>p.verified!=='http-200');
  const report={day:data.date,input:'data/d5-execution.json',checks,routeCombinations:counts,photos,gaps,deliveryGate:blocked?'blocked':'ready-for-manual-mobile-review',status:checks.some(c=>c.status==='fail')?'failed':checks.some(c=>c.status==='not-run')?'partial':blocked?'checked-with-evidence-gaps':'checked'};
  if(process.argv.includes('--details'))report.routeQueries=routes.filter((r,i)=>missingScreenshotKeys.includes(r.key)&&routes.findIndex(x=>x.key===r.key)===i).map(r=>({key:r.key,meal:r.meal,sight:r.sight,edge:r.edge,url:core.resolve(data,{...data.slots,meal:r.meal,sight:r.sight},r.edge).routeUrl}));
  if(process.argv.includes('--json'))console.log(JSON.stringify(report));
  else{for(const c of checks)console.log(c.status.toUpperCase()+' '+c.id+(c.detail?' — '+c.detail:''));console.log(JSON.stringify({routeCombinations:counts,photos,gaps,status:report.status},null,2));}
  if(report.status==='failed')process.exitCode=1;
  else if(process.argv.includes('--strict')&&blocked)process.exitCode=2;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
