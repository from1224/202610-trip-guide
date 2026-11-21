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

// Android click surfaces use registered app intents, with a separate bounded web fallback.
// This tests rendered URLs and DOM hydration, not actual Android app launch.
const amapData=require('./data.json');
const staticMarkup=page.slice(0,page.indexOf('function amapMarkerUrl'));
const amapBase=page.slice(page.indexOf('function foodCard'),page.indexOf('function focusFood'));
const renderAfterCode=page.slice(page.indexOf('function renderAfter'),page.indexOf('function addDianpingButtons'));
function testLink(markup,label){
  const attrs=Object.fromEntries([...markup.matchAll(/([\w-]+)="([^"]*)"/g)].map(x=>[x[1],x[2].replaceAll('&amp;','&')]));
  let fallbacks=[];
  return {
    attrs,fallBacks:fallbacks,
    get textContent(){return label},set textContent(v){label=v},
    set href(v){attrs.href=v},get href(){return attrs.href},
    getAttribute:k=>attrs[k]??null,setAttribute:(k,v)=>{attrs[k]=v},removeAttribute:k=>{delete attrs[k]},
    dataset:new Proxy({}, {set(_,name,v){attrs[`data-${name.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}`]=v;return true}}),
    classList:{contains:c=>attrs.class?.split(' ').includes(c)},
    after:(space,fallback)=>{assert.equal(space,' ');fallbacks.push(fallback)}
  };
}
const readMapAnchors=markup=>[...markup.matchAll(/<a\b([^>]*?)>([^<]*)<\/a>/g)].filter(m=>m[1].includes('data-amap-app')).map(m=>testLink(m[1],m[2]));
const staticAnchors=()=>readMapAnchors(staticMarkup);
const makeDoc=anchors=>({
  querySelectorAll:()=>anchors.filter(a=>!('data-amap-hydrated' in a.attrs)&&a.attrs['data-map-kind']==='exact'),
  createElement:()=>({dataset:{}}),createTextNode:v=>v
});
const makeAmap=(navigator,anchors=[])=>new Function('localStorage','navigator','document',
  amapBase+';return {foodCard,amapAndroidIntent,amapActions,amapMapKind,hydrateStaticAmapLinks,isAmapAndroid}'+
  ';'
)({getItem:()=>null},navigator,makeDoc(anchors));
const androidUA={userAgent:'Mozilla/5.0 (Linux; Android 15) Chrome/130'},desktopUA={userAgent:'Mozilla/5.0 (Macintosh) Chrome/130'};
const anchors=staticAnchors(),androidAmap=makeAmap(androidUA,anchors);
const expectedTargets={
  B0JKMSFXVD:['120.119408','30.334516'],B023B08WHU:['120.141431','30.3178'],B0FFGWGK0O:['120.118039','30.330799'],
  BX09905796:['120.178984','30.342277'],B0FFFGUY1N:['120.186855','30.352453'],B0FFIIMUWQ:['120.185838','30.35905'],
  B0FFHB2SGB:['120.172132','30.35805']
};
function checkDirectPoi(a,id,coords){
  assert(!a.attrs.target);
  const [uri,intent]=a.href.split('#Intent;');
  const mapUrl=new URL(uri);
  assert.equal(mapUrl.protocol,'intent:');assert.equal(mapUrl.hostname,'poi');assert.equal(mapUrl.pathname,'/detail');
  assert(intent.startsWith('scheme=amapuri;package=com.autonavi.minimap;'));
  assert.equal(mapUrl.searchParams.get('poiid'),id);
  assert.deepEqual([mapUrl.searchParams.get('lon'),mapUrl.searchParams.get('lat')],coords);
  const fallback=new URL(decodeURIComponent(intent.match(/S\.browser_fallback_url=([^;]+)/)[1]));
  assert.equal(fallback.hostname,'uri.amap.com');assert.equal(fallback.searchParams.get('poiid'),id);assert.equal(fallback.searchParams.get('callnative'),'0');
  return fallback.href;
}
for(const [id,coords] of Object.entries(expectedTargets)){
  const matches=anchors.filter(a=>a.href.includes(`poiid=${id}#Intent`));
  assert(matches.length>0,`missing static Android POI: ${id}`);
  for(const a of matches){
    const web=checkDirectPoi(a,id,coords);
    assert.equal(a.fallBacks.length,1);
    assert.equal(a.fallBacks[0].href,web);
    assert.equal(a.fallBacks[0].textContent,'网页地点兜底');
  }
}
androidAmap.hydrateStaticAmapLinks();
assert(anchors.every(a=>a.fallBacks.length===1),'hydration must be idempotent');
const late=testLink('data-map-kind="exact" href="https://www.amap.com/place/B0FFHB2SGB"','杭钢南入口');
anchors.push(late);androidAmap.hydrateStaticAmapLinks();
checkDirectPoi(late,'B0FFHB2SGB',expectedTargets.B0FFHB2SGB);
const desktopAnchors=staticAnchors(),desktopAmap=makeAmap(desktopUA,desktopAnchors);
assert(desktopAnchors.every(a=>a.href.startsWith('https:')&&!a.fallBacks.length));
assert(makeAmap({...desktopUA,userAgentData:{platform:'Android'}}).isAmapAndroid());
const placeUrl='https://www.amap.com/place/B0JDC5VDJB',exactMap={url:placeUrl,location:[120.1,30.2]};
const exactHtml=androidAmap.amapActions(exactMap,'安放山泽里','');
const [exactA]=readMapAnchors(exactHtml);
const exactWeb=checkDirectPoi(exactA,'B0JDC5VDJB',['120.1','30.2']);
assert(exactHtml.includes(`data-map-kind="web" href="${exactWeb}"`));
const idOnly=androidAmap.amapActions({url:placeUrl},'安放山泽里','');
assert(idOnly.includes('poiid=B0JDC5VDJB&src=HangzhouGuide&callnative=1'));
assert(idOnly.includes('poiid=B0JDC5VDJB&src=HangzhouGuide&callnative=0'));
assert(idOnly.includes('尝试打开 App')&&!idOnly.includes('lat='));
const search='https://www.amap.com/search?query='+encodeURIComponent('新天地购物中心南广场 杭州');
const searchHtml=androidAmap.amapActions({url:search,location:[120.1,30.2]},'BOZ 汉堡节',search);
assert.equal(readMapAnchors(searchHtml)[0].attrs['data-map-kind'],'search');
assert(searchHtml.includes('keywords='+encodeURIComponent('新天地购物中心南广场 杭州')));
assert(searchHtml.includes('App 搜地点（待确认）')&&!searchHtml.includes('poi/detail')&&!searchHtml.includes('viewMap'));
assert(!desktopAmap.amapActions({url:search},'BOZ 汉堡节',search).includes('intent:'));
const pin=readMapAnchors(androidAmap.foodCard(amapData.foodItems.find(x=>x.id==='food-dongtian-vietnamese-xixi')))[0];
assert(pin.href.startsWith('intent://viewMap?')&&!pin.attrs.target);
assert(pin.textContent.includes('非餐厅 POI'));
const afterItemsCode=page.slice(page.indexOf('const afterItems='),page.indexOf('const foodPoiPhotos'));
const afterHost={};
new Function('$','amapActions',afterItemsCode+renderAfterCode+';renderAfter()')(()=>afterHost,androidAmap.amapActions);
const afterLinks=readMapAnchors(afterHost.innerHTML);
assert(afterLinks.some(a=>a.attrs['data-map-kind']==='exact'&&a.href.includes('B0FFK1CI7G')));
assert(afterLinks.some(a=>a.attrs['data-map-kind']==='search'&&a.href.includes(encodeURIComponent('小河历史文化街区'))));
assert(afterLinks.every(a=>a.href.startsWith('intent:')&&!a.attrs.target));
const foodRendered=amapData.foodItems.flatMap(x=>readMapAnchors(androidAmap.foodCard(x)));
assert.equal(foodRendered.length,amapData.foodItems.length);
assert(foodRendered.every(a=>a.href.startsWith('intent:')&&!a.attrs.target));
console.log('PASS: Android Amap intents and web fallbacks across dinner, route, trail, activity and restaurant targets');
