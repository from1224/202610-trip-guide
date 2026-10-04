(function(root){
  'use strict';
  const zone=root.document?.getElementById('d7-execution');
  if(!zone||!root.GuideExecutionCore)return;
  const core=root.GuideExecutionCore;
  let data;
  try{data=JSON.parse(zone.dataset.d7);if(!data.places?.[data.initialMeal])throw Error('meal missing');}
  catch(_){zone.innerHTML='<p class="exec-warning">10/4 卡片数据未加载，请使用下方文字行程。</p>';return;}
  const p=data.places;
  let meal=data.initialMeal;
  const mode={
    'czhotel-czstation':'driving',
    'jcstation-jchotel':'driving',
    'jchotel-meal':'driving',
    'meal-museum':'walking',
    'museum-jchotel':'driving'
  };
  const edges={
    'czhotel-czstation':['czhotel','czstation','约10:00 出发'],
    'jcstation-jchotel':['jcstation','jchotel','12:00 出站后'],
    'jchotel-meal':['jchotel','meal','约12:50 去午餐'],
    'meal-museum':['meal','museum','午餐后'],
    'museum-jchotel':['museum','jchotel','约16:15 返程']
  };
  const names={driving:'打车',walking:'步行',cycling:'骑行'};
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function link(place){return '<a href="'+esc(core.placeLink(place))+'" target="_blank" rel="noopener">'+esc(place.name)+'</a>';}
  function bell(place){const q=new URLSearchParams({send:'1',title:place.name,time:place.time,body:(place.address||'')+'\n点标题打开高德',place:place.name,lat:String(place.lat),lon:String(place.lon)});return '<a class="exec-bell" href="intent://import?'+esc(q.toString())+'#Intent;scheme=tripcard;package=com.xiaocai.tripcard;end" aria-label="发送'+esc(place.name)+'随身行程卡" title="发送到安卓随身行程卡">🔔</a>';}
  function heading(place,label){return '<div class="exec-top"><div class="exec-time">'+esc(place.time)+'</div><div class="exec-main"><div class="exec-label">'+esc(label)+'</div><div class="exec-heading"><div class="exec-title">'+link(place)+'</div>'+bell(place)+'</div></div></div>';}
  function fixed(id){const place=p[id],box=zone.querySelector('[data-d7-place="'+id+'"]');let extra='';
    if(id==='czhotel')extra='<p class="d7-keyline">退房后打车去长治东；建议 10:30 前到站。</p>';
    if(id==='czstation')extra='<p class="d7-keyline">留约 50 分钟安检、候车；站内屏和 12306 订单为准。</p>';
    if(id==='jcstation')extra='<p class="d7-keyline">出站后打车去华之晋酒店，先放行李。</p>';
    if(id==='jchotel')extra='<p class="d7-keyline">可提前入住就入住；否则先寄存，再去午餐。</p>';
    if(id==='museum')extra='<div class="exec-facts"><div><b>开放时间：</b>'+esc(place.opening)+'</div><div><b>讲解时间：</b>'+esc(place.explain)+'</div><div><b>入馆／存包：</b>'+esc(place.access)+'</div></div><div class="exec-focus"><b>先看：</b>'+esc(place.highlight)+'</div><figure class="exec-photo"><img src="'+esc(place.photo)+'" alt="北齐昙始造像碑座，晋城博物馆官方馆藏图" loading="lazy"><figcaption><a href="'+esc(place.photoSource)+'" target="_blank" rel="noopener">官方馆藏图与介绍 ↗</a>；不证明当日展出</figcaption></figure><details class="exec-method"><summary>开放公告与证据</summary><a href="'+esc(place.source)+'" target="_blank" rel="noopener">晋城博物馆国庆公告 ↗</a></details>';
    box.className='exec-place d7-place d7-'+esc(place.kind);box.innerHTML=heading(place,id==='museum'?'景点 · 博物馆':id.includes('station')?'交通节点 · 车站':'住宿 · 酒店')+extra;
  }
  function train(){zone.querySelector('[data-d7-train]').innerHTML='<article class="exec-edge d7-train"><div class="exec-top"><div class="exec-time">11:24<br>–12:00</div><div class="exec-main"><div class="exec-label">大交通 · 已改签</div><div class="exec-title">D3349 · 长治东 → 晋城东</div></div></div><p class="d7-keyline">按 12306 当前订单乘车；不使用已改签的旧车次。</p></article>';}
  function mealCard(id){const f=p[id];return '<article class="d7-food" data-food="'+esc(id)+'"><div class="exec-heading"><h4>'+link(f)+'</h4>'+bell(f)+'</div><span class="exec-tag">'+esc(f.status)+'</span><div class="d7-gallery">'+f.photos.map((src,i)=>'<figure><img src="'+esc(src)+'" alt="'+esc(f.name)+'食客图 '+(i+1)+'" loading="lazy"><figcaption>食客原帖图 '+(i+1)+'/'+f.photos.length+'</figcaption></figure>').join('')+'</div><p><b>这顿怎么点：</b>'+esc(f.dish)+'</p><p><b>单人：</b>'+esc(f.portion)+'</p><details class="exec-method"><summary>照片、好评与反评来源</summary><a href="'+esc(f.photoSource)+'" target="_blank" rel="noopener">食客原图 ↗</a> · <a href="'+esc(f.positive)+'" target="_blank" rel="noopener">具体体验 ↗</a> · <a href="'+esc(f.negative)+'" target="_blank" rel="noopener">反评 ↗</a><p>照片来自标注的食客笔记，非今日现场；营业和菜单以到店为准。</p></details></article>';}
  function renderMeal(){const box=zone.querySelector('[data-d7-meal]');box.className='exec-place d7-meal';box.innerHTML='<div class="exec-top"><div class="exec-time">约13:10</div><div class="exec-main"><div class="exec-label">美食 · 横滑换店</div><div class="exec-title">午餐 · 晋城地方菜</div><div class="exec-sub">换店时，前后两张交通卡一起更新。</div></div></div><div class="exec-food-picker" role="group" aria-label="午餐选择">'+data.mealChoices.map(id=>'<button type="button" data-d7-pick="'+esc(id)+'" aria-pressed="'+(meal===id)+'">'+esc(p[id].name.replace(/·.*/,''))+'</button>').join('')+'</div><div class="exec-switch"><button type="button" data-d7-shift="-1" aria-label="上一家店">‹</button><span>'+(data.mealChoices.indexOf(meal)+1)+' / '+data.mealChoices.length+' · 左右滑动换店</span><button type="button" data-d7-shift="1" aria-label="下一家店">›</button></div><div class="exec-food-track" data-d7-track>'+data.mealChoices.map(mealCard).join('')+'</div>';box.querySelector('[data-d7-track]').scrollLeft=data.mealChoices.indexOf(meal)*box.querySelector('[data-d7-track]').clientWidth;}
  function endpoint(id){return p[id==='meal'?meal:id];}
  function embedRoute(from,to,m){
    const q=new URLSearchParams({from:from.lon+','+from.lat+','+from.name,to:to.lon+','+to.lat+','+to.name,type:{driving:'drive',walking:'walk',cycling:'ride'}[m],zoom:'13',platform:'pc'});
    if(m==='cycling')q.set('ride_type','bike');
    if(from.poi)q.set('from_poiid',from.poi);
    if(to.poi)q.set('to_poiid',to.poi);
    return 'https://www.amap.com/ssr/embed/dir?'+q.toString();
  }
  function renderEdge(id){const [fromId,toId,time]=edges[id],from=endpoint(fromId),to=endpoint(toId),m=mode[id],box=zone.querySelector('[data-d7-edge="'+id+'"]');const key=core.routeKey(from.key,to.key,m),ev=data.routeEvidence.find(r=>core.routeKey(r.fromKey,r.toKey,r.mode)===key);box.className='exec-edge d7-edge';box.dataset.routeKey=key;const metric=ev?((ev.distanceM/1000).toFixed(1)+' km · 模型约 '+ev.durationMin+' 分钟（'+ev.checkedAt+'）'):'此组合尚无同方式实测时间／截图；以地图当前规划为准。';const embed=embedRoute(from,to,m);box.innerHTML='<div class="exec-top"><div class="exec-time">'+esc(time)+'</div><div class="exec-main"><div class="exec-label">交通 · '+names[m]+'</div><div class="exec-title">'+esc(from.name)+' → '+esc(to.name)+'</div></div></div><div class="exec-mode" role="group" aria-label="切换本段交通方式">'+['driving','walking','cycling'].map(x=>'<button type="button" data-d7-mode="'+x+'" data-for-edge="'+id+'" aria-pressed="'+(m===x)+'">'+names[x]+'</button>').join('')+'</div><div class="d7-map"><iframe title="高德'+names[m]+'地图：'+esc(from.name)+'到'+esc(to.name)+'" src="'+esc(embed)+'" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><div class="d7-map-fallback">地图如未加载，<a href="'+esc(core.routeLink(from,to,m))+'" target="_blank" rel="noopener">打开高德'+names[m]+'路线 ↗</a></div></div><p class="exec-metric">'+esc(metric)+'</p><div class="exec-actions"><a class="exec-link" href="'+esc(core.routeLink(from,to,m))+'" target="_blank" rel="noopener">高德'+names[m]+'路线 ↗</a><a class="exec-link" href="'+esc(core.placeLink(to))+'" target="_blank" rel="noopener">终点地点 ↗</a></div><p class="exec-warning">'+(ev?esc(ev.scope)+'；':'')+'嵌入图是高德当前规划，不证明精确落客侧、入口或共享车还车区。骑行仅供查线，不推荐据此直接取还车。</p>';}
  ['czhotel','czstation','jcstation','jchotel','museum'].forEach(fixed);train();renderMeal();Object.keys(edges).forEach(renderEdge);
  function selectMeal(id,scroll){if(!data.mealChoices.includes(id)||meal===id)return;meal=id;zone.querySelectorAll('[data-d7-pick]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.d7Pick===id)));zone.querySelector('.exec-switch span').textContent=(data.mealChoices.indexOf(id)+1)+' / '+data.mealChoices.length+' · 左右滑动换店';if(scroll){const t=zone.querySelector('[data-d7-track]');t.scrollTo({left:data.mealChoices.indexOf(id)*t.clientWidth,behavior:'smooth'});}renderEdge('jchotel-meal');renderEdge('meal-museum');}
  zone.addEventListener('click',e=>{const pick=e.target.closest('[data-d7-pick]');if(pick){selectMeal(pick.dataset.d7Pick,true);return;}const shift=e.target.closest('[data-d7-shift]');if(shift){const i=Math.max(0,Math.min(data.mealChoices.length-1,data.mealChoices.indexOf(meal)+Number(shift.dataset.d7Shift)));selectMeal(data.mealChoices[i],true);return;}const button=e.target.closest('[data-d7-mode]');if(button){mode[button.dataset.forEdge]=button.dataset.d7Mode;renderEdge(button.dataset.forEdge);}});
  let timer;zone.querySelector('[data-d7-track]').addEventListener('scroll',e=>{clearTimeout(timer);timer=setTimeout(()=>selectMeal(data.mealChoices[Math.round(e.target.scrollLeft/e.target.clientWidth)],false),120);},{passive:true});
})(typeof window==='object'?window:globalThis);
