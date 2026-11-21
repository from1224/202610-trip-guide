const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),page=fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),contract=fs.readFileSync(path.join(root,'DELIVERY_ACCEPTANCE.md'),'utf8'),maintenance=fs.readFileSync(path.join(__dirname,'MAINTENANCE.md'),'utf8');
assert(contract.includes('要求—检查—证据矩阵'));
assert(contract.includes('自动测试和源码检查不代替视觉与操作验收'));
assert(maintenance.includes('../DELIVERY_ACCEPTANCE.md'));
assert(page.includes('data-delivery-mobile-guard'));
assert(page.includes('高德查看入口：旅游咨询中心（南门附近）'));
assert(page.includes('https://www.amap.com/place/B0FFFGUY1N'));
assert(page.includes('历史查询中，桃源街 A 口至咨询中心步行约 1.74 km／23 分钟'));
assert(page.includes('data-tab-filter-isolation'));
assert(page.includes("document.querySelectorAll('#playPanel .card')"));
assert(page.includes('data-tab-hiking-state-isolation'));
assert(page.includes("tab==='play'&&activeFilter==='徒步'"));
assert(!page.includes("replace('图片：未查','图片：已查未获可用图')"));
assert(page.includes('红线仅显示本站截取的已核路线，终点对应望宸阁位置；切换不会改变底图或缩放。'));
assert(!page.includes('核定像素点列'));
assert(!page.includes('data-hiking-reader-copy'));
assert.equal((page.match(/<h2>这周去哪吃<\/h2>/g)||[]).length,1);
let foodPanel=page.indexOf('<section id="foodPanel"'),foodHeading=page.indexOf('<h2>这周去哪吃</h2>',foodPanel),foodFilters=page.indexOf('id="foodFilters"',foodPanel),foodCards=page.indexOf('id="foodCards"',foodPanel),hikingStack=page.indexOf('<section class="stack hiking-stack hiking-only">'),hikingDinner=page.indexOf('id="hiking-hanggang-dinner"'),activeCards=page.indexOf('<section class="stack" id="active"');
assert(foodPanel>=0&&foodHeading<foodFilters&&foodFilters<foodCards);
assert(hikingStack<hikingDinner&&hikingDinner<activeCards);
assert(!page.includes('id="foodMap"'));
assert(page.includes('按偏好筛选（可选）'));
assert(!page.includes('用滑卡筛选本周活动'));
console.log('PASS: public delivery contract, narrow-screen guardrails, hiking entry action, and tab-filter isolation');

// Current-scope images cannot disappear silently behind a source link.
const imageReview=JSON.parse(fs.readFileSync(path.join(__dirname,'image-review.json'),'utf8'));
const imageAudit=require('../scripts/check-delivery.cjs').audit(require('./data.json'),imageReview,null,__dirname);
// Online evidence is a separate receipt; displayed entries must be checked with it.
const schemaErrors=imageAudit.errors.filter(x=>!x.includes('dated online browser evidence')&&!x.includes('browser checked image count'));
assert.deepEqual(schemaErrors,[],`Invalid image handoff: ${schemaErrors.join('; ')}`);
console.log(`IMAGE HANDOFF: ${JSON.stringify(imageAudit.counts)}; not a claim of full image delivery`);

assert(page.includes(".gallery-meta>a{grid-column:1/-1"), "narrow gallery source needs its own row");


// Presentation contract: a single compact shell, progressive filters, and actionable facts before visual media.
const mobileGuard=page.match(/<style data-delivery-mobile-guard>([\s\S]*?)<\/style>/)?.[1];
assert.match(mobileGuard,/max-width:430px/);
assert.match(mobileGuard,/\.top-tabs\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}/);
assert.match(mobileGuard,/min-height:44px/);
assert.equal((page.match(/<h1>/g)||[]).length,1);
const showPlay=page.slice(page.indexOf('<section id="playPanel"'),page.indexOf('<section id="hikingPanel"'));
const important=['class="filters primary-filters"','id="playOptions"','id="weekendSwipeMount"','?tab=after#beiruan-7017','id="weekendPicks"','id="weekendPending"','id="active"','id="pendingWrap"','id="permanentWrap"','id="archiveWrap"'];
assert(important.every((key,i)=>showPlay.includes(key)&&(!i||showPlay.indexOf(key)>showPlay.indexOf(important[i-1]))));
const disclosure=showPlay.slice(showPlay.indexOf('id="playOptions"'),showPlay.indexOf('id="weekendSwipeMount"'));
for(const key of ['data-status-filter','data-time-filter','活动信息怎么核']) assert(disclosure.includes(key));
assert.match(page,/data-top-tab="after" aria-controls="afterPanel"/);
assert.match(page,/if\(requestedDinner\)\{selectTop\('after',false\);\$\('#beiruan-7017-details'\).open=true/);
const cardMarkup=page.split('\n').find(line=>line.startsWith('function card(x)'));
assert(cardMarkup.indexOf('class="meta event-facts"')>0);
assert(cardMarkup.indexOf('class="meta event-facts"')<cardMarkup.indexOf('${visual}'));
for(const key of ['x.schedule','x.venue','x.address','x.price','x.booking']) assert(cardMarkup.includes(key));
assert(page.includes("document.querySelector('#weekendSwipeMount').append(host)"));
assert(page.includes('aria-controls="weekendSwipePanel" aria-expanded="false"'));

// Exercise only the new presentation synchronizer with the same underlying filter/selection hooks.
const vm=require('node:vm');
const layoutScript=page.match(/<script data-guide-layout-sync>([\s\S]*?)<\/script>/)?.[1];
assert(layoutScript);
const names=['weekendPicks','weekendPending','active','pending','permanent','archive'];
const visible=new Set(['weekendPicks','pending']),focuses=[];
const nodes=Object.fromEntries(names.map(id=>[id,{querySelector:q=>q==='.card:not([hidden])'&&visible.has(id)}]));
const groups=names.slice(0,3).map(id=>({dataset:{playGroup:id},hidden:false}));
const tabs=['play','food','after'].map(id=>({id,selected:id==='play',getAttribute(){return String(this.selected)},focus(){focuses.push(id)}}));
for(const id of ['advancedFilterCount','playEmpty','guideTabs']) nodes[id]={addEventListener(_,fn){this.fn=fn}};
let filters=0,selection;
const ctx={
  document:{getElementById:id=>nodes[id],querySelectorAll:q=>q.includes('[role=tab]')?tabs:groups},
  items:[1],activeFilter:'all',activeStatusFilter:'all',activeTimeFilter:'all',
  applyFilters(){filters++},selectTop(tab,persist){selection=[tab,persist];tabs.forEach(b=>b.selected=b.id===tab)}
};
vm.runInNewContext(layoutScript,ctx);
ctx.applyFilters();
assert.equal(filters,1);
assert.deepEqual(groups.map(x=>x.hidden),[false,true,true]);
assert.equal(nodes.playEmpty.hidden,true);
assert.equal(nodes.advancedFilterCount.hidden,true);
visible.clear();ctx.activeStatusFilter='active';ctx.activeTimeFilter='archive';ctx.applyFilters();
assert(groups.every(x=>x.hidden));
assert.equal(nodes.playEmpty.hidden,false);
assert.equal(nodes.advancedFilterCount.textContent,'2 项');
ctx.activeFilter='徒步';ctx.applyFilters();assert.equal(nodes.playEmpty.hidden,true);
ctx.selectTop('after',false);assert.deepEqual(selection,['after',false]);assert.deepEqual(tabs.map(b=>b.tabIndex),[-1,-1,0]);
nodes.guideTabs.fn({target:tabs[2],key:'ArrowRight',preventDefault(){}});
assert.deepEqual(focuses,['play']);assert.deepEqual(selection,['after',false]);
const weekendLabelBody=page.slice(page.indexOf('function guideWeekendLabel'),page.indexOf('function weather(meta)'));
const weekendLabel=vm.runInNewContext(weekendLabelBody+';guideWeekendLabel');
assert.equal(weekendLabel({weekLabel:'本周 · 11月16日–11月22日',checkedAt:'2026-11-21'}),'11月21–22日 · 周末');
assert.equal(weekendLabel({weekLabel:'本周 · 12月26日–1月1日',checkedAt:'2022-12-31'}),'12月31日–1月1日 · 周末');
assert.equal(weekendLabel({weekLabel:'本周 · 11月17日–11月23日',checkedAt:'2026-11-21'}),'本周 · 11月17日–11月23日');
console.log('PASS: compact three-tab layout, progressive controls, action order, and filtered section visibility');
