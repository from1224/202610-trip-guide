(function(root){
  'use strict';
  if(!root.document||!root.GuideExecutionCore)return;
  const core=root.GuideExecutionCore,zone=root.document.getElementById('d5-execution');
  if(!zone)return;
  let data;
  try{data=core.validate(JSON.parse(zone.dataset.execution));}
  catch(_){zone.insertAdjacentHTML('beforeend','<p class="exec-warning">执行卡数据校验失败；请勿依赖此卡导航。</p>');return;}
  const selected={...data.slots};
  const modes=Object.fromEntries(data.edges.map(e=>[e.id,e.recommendedByMeal?e.recommendedByMeal[selected.meal]:e.defaultMode]));
  const foodBox=zone.querySelector('[data-slot="meal"]'),sightBox=zone.querySelector('[data-slot="sight"]');
  const names={walking:'步行',cycling:'骑行',driving:'打车'};
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function title(p){return '<a href="'+esc(core.placeLink(p))+'" target="_blank" rel="noopener">'+esc(p.name)+'</a>';}
  function nativeBell(p,time){const q=new URLSearchParams({send:'1',title:p.name,time,body:(p.address||'')+'\n点地点标题可打开高德',place:p.name,lat:String(p.lat),lon:String(p.lon)});return '<a class="exec-bell" href="intent://import?'+esc(q.toString())+'#Intent;scheme=tripcard;package=com.xiaocai.tripcard;end" aria-label="发送'+esc(p.name)+'随身行程卡" title="发送到安卓随身行程卡；不是定时提醒">🔔</a>';}
  function head(time,label,p){return '<div class="exec-top"><div class="exec-time">'+esc(time)+'</div><div class="exec-main"><div class="exec-label">'+esc(label)+'</div><div class="exec-heading"><div class="exec-title">'+title(p)+'</div>'+nativeBell(p,time)+'</div>'+(p.kind==='hotel'?'<div class="exec-sub">'+esc(p.detail||'')+'</div>':'')+'</div></div>';}
  function photo(p){return p.photo?'<figure class="exec-photo"><img src="'+esc(p.photo)+'" alt="'+esc(p.photoCaption)+'" loading="lazy" referrerpolicy="no-referrer"><figcaption><a href="'+esc(p.photoSource)+'" target="_blank" rel="noopener">'+esc(p.photoCaption)+' ↗</a></figcaption></figure>':'';}
  function museumTiles(items,kind){return '<div class="exec-museum-track">'+items.map(item=>'<article class="exec-museum-tile">'+(item.photo?'<img src="'+esc(item.photo)+'" alt="'+esc(item.photoCaption||item.name)+'" loading="lazy" referrerpolicy="no-referrer">':'<div class="exec-museum-noimage">图片未核</div>')+'<b>'+esc(item.name)+'</b>'+(kind==='exhibition'&&item.focus?'<p>'+esc(item.focus)+'</p>':'')+'<details class="exec-method"><summary>展出与图片依据</summary><p>'+esc(item.status||'')+'</p><a href="'+esc(item.source)+'" target="_blank" rel="noopener">内容来源 ↗</a>'+(item.photoSource?'<br><a href="'+esc(item.photoSource)+'" target="_blank" rel="noopener">图片来源 ↗</a>':'')+'</details></article>').join('')+'</div>';}
  function fixed(slot,time,label){
    const p=data.places[selected[slot]];
    let body='';
    if(p.sightType==='museum')body='<div class="exec-facts"><div><b>开放时间：</b>'+esc(p.opening)+'</div><div><b>开放状态：</b>10/2 已实走；官方假期公告为开放</div><div><b>讲解时间：</b>'+esc(p.explain)+'</div></div>'
      +'<div class="exec-access"><b>到馆怎么进：</b>'+esc(p.access?.arrival||'入口未核')+'<br><b>存包：</b>'+esc(p.access?.storage||'位置未核')+'<details class="exec-method"><summary>东门与寄存依据</summary><a href="'+esc(p.access?.source||p.source)+'" target="_blank" rel="noopener">馆方资料转刊 ↗</a><p>有东门方向与寄存服务证据，但无高德精确门点／寄存柜台图，不画假的红圈。</p></details></div>'
      +'<div class="exec-focus"><b>建议先看：</b>'+esc(p.highlight)+'</div><h4 class="exec-museum-heading">重点展览 · 横滑</h4>'+museumTiles(p.exhibitions||[],'exhibition')
      +'<h4 class="exec-museum-heading">具名馆藏图鉴 · 横滑</h4>'+museumTiles((p.artifacts||[]).filter(item=>item.photo),'artifact')
      +((p.artifacts||[]).some(item=>!item.photo)?'<details class="exec-method"><summary>另两件馆藏：只有名字，图未核</summary><p>'+esc((p.artifacts||[]).filter(item=>!item.photo).map(item=>item.name).join('；'))+'</p></details>':'')
      +'<div class="exec-warning">馆藏图鉴不证明文物在 10/2 新馆展柜；未找到该馆可靠楼层导览图，不给编造的楼层顺序。</div><details class="exec-method"><summary>开放与讲解来源</summary><p><a href="'+esc(p.source)+'" target="_blank" rel="noopener">国庆开放公告 ↗</a> · <a href="'+esc(p.explainSource)+'" target="_blank" rel="noopener">馆方国庆活动转刊 ↗</a></p></details>';
    else if(p.sightType==='heritage')body=photo(p)+'<div class="exec-facts"><div><b>到场看：</b>'+esc(p.highlight)+'</div><div><b>入口：</b>具体开放入口未核，按高德地点到达后看现场标识。</div></div><details class="exec-method"><summary>景点来源</summary><a href="'+esc(p.source)+'" target="_blank" rel="noopener">原资料 ↗</a></details>';
    zone.querySelector('[data-slot="'+slot+'"]').innerHTML=head(time,label,p)+body;
  }
  function evidenceText(e){
    if(!e)return '该起终点与方式尚无测距；点高德实时规划。';
    if(e.distanceM&&e.durationMin)return '高德 '+e.checkedAt+' 快照：'+(e.distanceM<1000?e.distanceM+' 米':(e.distanceM/1000).toFixed(1)+' 公里')+'／约 '+e.durationMin+' 分钟';
    return '用户曾走过此连接；未记录道路、停放点或耗时。';
  }
  function routeScreenshot(e){
    const s=e?.screenshot;
    if(!s||s.reviewed!==true)return '';
    return '<figure class="exec-photo exec-route-photo"><a href="'+esc(s.path)+'" target="_blank" rel="noopener" aria-label="放大高德'+names[e.mode]+'路线截图"><img src="'+esc(s.path)+'" alt="'+esc('高德'+names[e.mode]+'路线截图；起终点与方式见图')+'" loading="lazy"></a><figcaption>高德 '+esc(s.checkedAt)+' 路线截图（仅隐藏登录弹层）· 点图放大 · <a href="'+esc(s.source)+'" target="_blank" rel="noopener">打开原路线 ↗</a><br>图内天气属截图当天，非10/2历史天气。</figcaption></figure>';
  }
  function route(id){
    const box=zone.querySelector('[data-edge="'+id+'"]');
    const active=core.activeEdges(data,selected).some(edge=>edge.id===id);
    box.hidden=!active;
    if(!active){box.innerHTML='';delete box.dataset.routeKey;return;}
    const r=core.resolve(data,selected,id,modes[id]);
    const buttons=['walking','cycling','driving'].map(mode=>'<button type="button" data-mode="'+mode+'" data-edge-choice="'+esc(id)+'" aria-pressed="'+String(mode===modes[id])+'">'+names[mode]+'</button>').join('');
    const caveat=r.evidence?esc(r.evidence.scope):'只有固定端点规划入口；实际出入口、停放及当前车程未核。';
    const time=id==='hotel-meal'?'去午餐':id==='meal-sight'?'饭后':id==='sight-gate'?'逛老城':'去新馆';
    const duration=r.evidence?.durationMin?'约 '+r.evidence.durationMin+' 分钟':'用时未核';
    box.dataset.routeKey=r.key;
    const screenshot=routeScreenshot(r.evidence);
    const noScreenshot='<p class="exec-map-missing">'+(r.mode==='cycling'?'骑行暂无同方式高德截图：电脑端会切成驾车，不能冒充骑行路线。点“步行”可看高德备选实图。':'该起终点与方式暂无已复核的高德截图。')+'</p>';
    box.innerHTML='<div class="exec-top"><div class="exec-time">'+time+'</div><div class="exec-main"><div class="exec-label">交通 · '+names[r.mode]+' · '+esc(duration)+'</div><div class="exec-title">'+esc(r.from.name)+' → '+esc(r.to.name)+'</div></div></div>'
      +'<div class="exec-mode" role="group" aria-label="选择交通方式">'+buttons+'</div>'+(screenshot||noScreenshot)
      +'<div class="exec-metric">'+esc(evidenceText(r.evidence))+'</div><div class="exec-actions"><a class="exec-link" href="'+esc(r.routeUrl)+'" target="_blank" rel="noopener">'+(r.mode==='cycling'?'手机高德查看骑行':'高德'+(r.mode==='driving'?'驾车':names[r.mode])+'路线')+' ↗</a><a class="exec-link" href="'+esc(r.destinationUrl)+'" target="_blank" rel="noopener">到达点 · 高德 ↗</a></div>'
      +'<div class="exec-warning">'+caveat+(r.mode==='cycling'?' 高德骑行链接仅在移动端有效；桌面端不要按驾车结果执行。':'')+'</div><details class="exec-method"><summary>本段证据范围</summary><p>按 '+esc(r.from.key)+' → '+esc(r.to.key)+' → '+esc(r.mode)+' 精确匹配。方位图不是道路图。</p></details>';
  }
  function refresh(slot){data.edges.filter(e=>e.from===slot||e.to===slot).forEach(e=>route(e.id));}
  function foodCard(id){
    const p=data.places[id];
    const source=/^https:\/\//.test(p.source||'')?'<p><a href="'+esc(p.source)+'" target="_blank" rel="noopener">'+(p.source.includes('xiaohongshu.com')?'小红书原帖（本轮打不开）↗':'看原始来源 ↗')+'</a></p>':'';
    const visual=p.photo?photo(p):'<div class="exec-food-image-gap" role="note"><b>同分店菜图待补</b><span>本轮小红书页面不可读取图片；不放错店图</span></div>';
    return '<article class="exec-food" data-food="'+esc(id)+'"><h4>'+title(p)+'</h4><span class="exec-tag'+(id==='hongji'?' done':'')+'">'+esc(p.status)+'</span>'+visual+'<p><b>核心菜：</b>'+esc(p.dish)+'</p><p><b>反馈：</b>'+esc(p.detail)+'</p><p><b>单人点法：</b>'+esc(p.portion)+'</p>'+source+'<p class="exec-warning">营业及分量仍需以门店当天为准。</p></article>';
  }
  function renderFood(){
    const i=data.choices.indexOf(selected.meal);
    foodBox.innerHTML='<div class="exec-top"><div class="exec-time">午餐</div><div class="exec-main"><div class="exec-label">美食 · 选店/横滑</div><div class="exec-sub">换店同步更新前后两段交通</div></div></div>'
      +'<div class="exec-food-picker" role="group" aria-label="切换午餐店">'+data.choices.map((id,j)=>'<button type="button" data-pick-food="'+esc(id)+'" aria-pressed="'+String(i===j)+'">'+esc(data.places[id].name.replace(/·.*/,''))+'</button>').join('')+'</div>'
      +'<div class="exec-switch"><button type="button" data-shift="-1" aria-label="上一家店">‹</button><span data-food-count>'+(i+1)+' / '+data.choices.length+' · 可左右滑</span><button type="button" data-shift="1" aria-label="下一家店">›</button></div><div class="exec-food-track" data-food-track>'+data.choices.map(foodCard).join('')+'</div>';
  }
  function setMeal(id,scroll){
    if(!data.choices.includes(id)||selected.meal===id)return;
    selected.meal=id;
    data.edges.filter(e=>e.from==='meal'||e.to==='meal').forEach(e=>{modes[e.id]=e.recommendedByMeal?e.recommendedByMeal[id]:e.defaultMode;});
    const i=data.choices.indexOf(id),track=foodBox.querySelector('[data-food-track]');
    foodBox.querySelector('[data-food-count]').textContent=(i+1)+' / '+data.choices.length+' · 可左右滑';
    foodBox.querySelectorAll('[data-pick-food]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pickFood===id)));
    if(scroll)track.scrollTo({left:i*track.clientWidth,behavior:'auto'});
    refresh('meal');
  }
  function renderSight(){
    const p=data.places[selected.sight];
    sightBox.innerHTML=head('午餐后','景点 · 老城',p)
      +'<div class="exec-food-picker" role="group" aria-label="切换老城景点">'+data.sightChoices.map(id=>'<button type="button" data-pick-sight="'+esc(id)+'" aria-pressed="'+String(id===selected.sight)+'">'+esc(data.places[id].name)+'</button>').join('')+'</div>'
      +photo(p)+'<div class="exec-facts"><div><b>到场看：</b>'+esc(p.highlight)+'</div><div><b>入/离开：</b>具体入口与共享车停放点未核；若复走优先步行或打车。</div><div><b>切换含义：</b>'+(selected.sight==='shangdang'?'跳过城隍庙，直去上党门（比较路线，非当天实走）':'实际先城隍庙、再上党门；下方两站都显示。')+'</div></div><details class="exec-method"><summary>景点依据</summary><a href="'+esc(p.source)+'" target="_blank" rel="noopener">地点/看点来源 ↗</a></details>';
  }
  function setSight(id){if(!data.sightChoices.includes(id)||selected.sight===id)return;selected.sight=id;renderSight();zone.querySelector('[data-slot="gate"]').hidden=id==='shangdang';for(const edge of data.edges.filter(e=>e.from==='sight'||e.from==='gate'||e.to==='sight'||e.to==='gate'))route(edge.id);}
  fixed('start','中午','酒店 · 已入住');renderFood();renderSight();fixed('gate','随后','景点 · 上党门');fixed('end','下午','博物馆 · 已参观');data.edges.forEach(e=>route(e.id));
  foodBox.addEventListener('click',e=>{const pick=e.target.closest('[data-pick-food]');if(pick){setMeal(pick.dataset.pickFood,true);return;}const b=e.target.closest('[data-shift]');if(!b)return;const n=data.choices.indexOf(selected.meal)+Number(b.dataset.shift);setMeal(data.choices[Math.max(0,Math.min(data.choices.length-1,n))],true);});
  let timer;foodBox.querySelector('[data-food-track]').addEventListener('scroll',e=>{clearTimeout(timer);timer=setTimeout(()=>{const t=e.target;setMeal(data.choices[Math.round(t.scrollLeft/t.clientWidth)],false);},100);},{passive:true});
  sightBox.addEventListener('click',e=>{const b=e.target.closest('[data-pick-sight]');if(b)setSight(b.dataset.pickSight);});
  zone.addEventListener('click',e=>{const b=e.target.closest('[data-edge-choice]');if(!b)return;modes[b.dataset.edgeChoice]=b.dataset.mode;route(b.dataset.edgeChoice);});
})(typeof window==='object'?window:globalThis);
