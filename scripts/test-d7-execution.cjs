const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),data=require('../data/d7-execution.json'),core=require('./execution-card-core.js');
const css=fs.readFileSync(path.join(root,'scripts/execution-cards.css'),'utf8');
for(const role of ['d7-hotel','d7-train','d7-edge','d7-sight','d7-meal'])assert(css.includes('.'+role+'{--d7-accent:'),'D7 color role missing: '+role);
assert(html.includes('id="d7-execution"'),'D7 cards must be in generated Guide');
assert(html.includes('scripts/d7-execution-cards.js'),'D7 rendering script must load');
for(const place of Object.values(data.places))for(const photo of place.photos||[])assert(fs.existsSync(path.join(root,photo)),photo+' missing');
for(const edge of data.routeEvidence){assert.equal(edge.source,'data/later-days-route-evidence.json');assert(edge.distanceM>0&&edge.durationMin>0);}
let globalRoot='';try{globalRoot=execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim();}catch(_){}
let dom;for(const candidate of [process.env.GUIDE_LINKEDOM_PATH,'linkedom',globalRoot&&path.join(globalRoot,'openclaw/node_modules/linkedom')].filter(Boolean)){try{dom=require(candidate);break;}catch(_){}}
assert(dom,'linkedom required for D7 interaction test');
const {window}=dom.parseHTML(html);window.GuideExecutionCore=core;
window.HTMLElement.prototype.scrollTo=function(o){this.scrollLeft=o.left;};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'d7-execution-cards.js'),'utf8'),{window,globalThis:window,setTimeout,clearTimeout,URLSearchParams});
const zone=window.document.querySelector('#d7-execution'),key=id=>zone.querySelector('[data-d7-edge="'+id+'"]').dataset.routeKey;
assert(zone.querySelector('.d7-train')?.textContent.includes('D3349'));
assert.equal(zone.querySelectorAll('.d7-food').length,2);
assert.equal(zone.querySelectorAll('.d7-food[data-food="tenbowls"] img').length,5);
assert(zone.querySelector('[data-d7-place="museum"] img')?.getAttribute('src')==='media/later-days/tanshi-stele.png');
assert.equal(zone.querySelectorAll('[data-d7-edge] iframe').length,5,'each local leg has an embedded map');
const map=id=>zone.querySelector('[data-d7-edge="'+id+'"] iframe')?.getAttribute('src');
assert(map('jchotel-meal').includes('/ssr/embed/dir?')&&map('jchotel-meal').includes('B0FFGDISTM'),'default map must target tenbowls');
const fixed=key('jcstation-jchotel'),before=key('jchotel-meal');
const fixedMap=map('jcstation-jchotel'),beforeMap=map('jchotel-meal');
zone.querySelector('[data-d7-pick="dehuaxing"]').dispatchEvent(new window.Event('click',{bubbles:true}));
assert.notEqual(key('jchotel-meal'),before,'previous route updates with meal');
assert(key('jchotel-meal').includes('poi:B0L69SLVTB'));
assert(key('meal-museum').startsWith('poi:B0L69SLVTB'));
assert.equal(key('jcstation-jchotel'),fixed,'unrelated route stays fixed');
assert.notEqual(map('jchotel-meal'),beforeMap,'previous embedded map updates with meal');
assert(map('jchotel-meal').includes('B0L69SLVTB'),'new map targets selected restaurant');
assert.equal(map('jcstation-jchotel'),fixedMap,'unrelated embedded map stays fixed');
assert(zone.querySelector('[data-d7-edge="jchotel-meal"] .exec-metric').textContent.includes('尚无同方式实测'),'old metric must clear');
zone.querySelector('[data-d7-mode="walking"][data-for-edge="jchotel-meal"]').dispatchEvent(new window.Event('click',{bubbles:true}));
assert(key('jchotel-meal').endsWith('|walking'));
assert(map('jchotel-meal').includes('type=walk'),'embedded map follows mode switch');
assert.equal(key('jcstation-jchotel'),fixed);
console.log('PASS: D7 distinct cards, real images, meal switch updates adjacent routes, mode switch clears stale metrics');
