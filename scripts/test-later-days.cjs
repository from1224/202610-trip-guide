const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {build,range}=require('./build-later-days.cjs');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),data=require('../data/later-days.json'),evidence=require('../data/later-days-route-evidence.json');
assert.deepEqual(data.days.map(d=>d.day),[5,6,7,8,9]);
assert.equal(build(html,data),html,'deterministic regeneration');
const d5=html.slice(...range(html,5));
for(const slot of ['start','meal','sight','gate','end'])assert(d5.includes('data-slot="'+slot+'"'),'D5 place slot '+slot);
for(const edge of ['hotel-meal','meal-sight','sight-gate','gate-museum','sight-museum'])assert(d5.includes('data-edge="'+edge+'"'),'D5 adjacent edge '+edge);
assert(d5.includes('原计划快照 · 不作为已发生'));
assert(d5.includes('城市阳台地面停车场出入口')&&d5.includes('仅机动车通行'),'D5 must not recommend unverified lake cycling');
assert(html.includes('class="exec-jump" href="#d5-execution"'));
assert(html.includes('scripts/execution-cards.js?v=20261003-11'));
for(const d of data.days){
 const[a,b]=range(html,d.day),s=html.slice(a,b);
 assert(s.includes('data-date="'+d.date+'"'));
 assert(!/<details[^>]*\bopen\b/.test(s),'drawers default closed');
 assert.equal((s.match(/class="tl-i"/g)||[]).length,d.rows.length);
 assert(s.indexOf('day-archive')>s.lastIndexOf('class="tl-i"'),'alternatives follow final time row');
 for(const image of s.matchAll(/<img[^>]+src="([^"]+)"/g))assert(fs.existsSync(path.join(root,image[1])));
 for(const a of s.matchAll(/<a\b[^>]*data-amap[^>]*>/g)){
  const tag=a[0];assert(tag.includes('data-amap-fixed="1"'));assert(tag.includes('coordinate=gaode'));assert(tag.includes('/marker?position='));assert(tag.includes('data-lat='));assert(!tag.includes('target="_blank"'));
 }
}
assert(html.includes('换乘 24 分钟'));
assert(!html.includes('换乘 1h 左右'));
assert(!html.includes('一票到底'));
assert(!html.includes('哪个兑现就退现票'));
assert(!html.includes('国内极少见的唐代木构'));
assert(!html.includes('短命王朝'));
assert(html.includes('G2238／G2235'));
assert(html.includes('13:31')&&html.includes('14:49'));
assert.equal(evidence.routes.length,14);
assert.equal(evidence.input_crs,'GCJ-02');
assert.equal(evidence.route_crs,'WGS84');
assert.equal(evidence.routes.find(r=>r.from==='czhotel'&&r.to==='czstation').distance_m,9466);
assert(evidence.routes.every(r=>r.distance_m>0&&r.duration_s>0&&r.url.startsWith('https://routing.openstreetmap.de/')));
console.log('PASS: 5 generated days, 35 timeline rows, closed drawers, local images, fixed Amap coordinates, corrected trains, 14 traceable route estimates');
