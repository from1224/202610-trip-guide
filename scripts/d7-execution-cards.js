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
  function placeUrl(place){const q=new URLSearchParams({position:place.lon+','+place.lat,name:place.name,coordinate:'gaode',src:'xiaocai-trip',callnative:'1'});return 'https://uri.amap.com/marker?'+q.toString();}
  function routeUrl(from,to,m){const q=new URLSearchParams({from:from.lon+','+from.lat+','+from.name,to:to.lon+','+to.lat+','+to.name,mode:{driving:'car',walking:'walk',cycling:'ride'}[m],src:'xiaocai-trip',callnative:'1'});return 'https://uri.amap.com/navigation?'+q.toString();}
  function link(place){return '<a href="'+esc(placeUrl(place))+'">'+esc(place.name)+'</a>';}
  function bell(place,title=place.name,time=place.time,body=place.address||''){const q=new URLSearchParams({send:'1',title,time,body,place:place.name,lat:String(place.lat),lon:String(place.lon)});return '<a class="exec-bell" href="intent://import?'+esc(q.toString())+'#Intent;scheme=tripcard;package=com.xiaocai.tripcard;end" aria-label="发送'+esc(title)+'随身行程卡" title="发送到安卓随身行程卡">🔔</a>';}
  function heading(place){return '<div class="exec-top"><div class="exec-time">'+esc(place.time)+'</div><div class="exec-main"><div class="exec-heading"><div class="exec-title">'+link(place)+'</div>'+bell(place)+'</div></div></div>';}
  function fixed(id){const place=p[id],box=zone.querySelector('[data-d7-place="'+id+'"]');let extra='';
    if(id==='czhotel')extra='<p class="d7-keyline">退房后打车去长治东；建议 10:30 前到站。</p>';
    if(id==='jchotel')extra='<p class="d7-keyline">可提前入住就入住；否则先寄存，再去午餐。</p>';
    if(id==='museum')extra='<div class="d7-theme-picker" role="group" aria-label="景点卡颜色"><span>景点颜色</span><button type="button" data-d7-theme="violet" aria-pressed="true">黛紫</button><button type="button" data-d7-theme="ochre" aria-pressed="false">砂金</button><button type="button" data-d7-theme="rose" aria-pressed="false">石榴红</button></div><div class="exec-facts"><div><b>开放时间：</b>'+esc(place.opening)+'</div><div><b>讲解时间：</b>'+esc(place.explain)+'</div><div><b>入馆／存包：</b>'+esc(place.access)+'</div></div><div class="exec-focus"><b>先看：</b>'+esc(place.highlight)+'</div><figure class="exec-photo"><img src="'+esc(place.photo)+'" alt="北齐昙始造像碑座，晋城博物馆官方馆藏图" loading="lazy"><figcaption><a href="'+esc(place.photoSource)+'" target="_blank" rel="noopener">官方馆藏图与介绍 ↗</a>；当日展出状态未获取</figcaption></figure><details class="exec-method"><summary>开放公告与证据</summary><a href="'+esc(place.source)+'" target="_blank" rel="noopener">晋城博物馆国庆公告 ↗</a></details>';
    box.className='exec-place d7-place d7-'+esc(place.kind);box.innerHTML=heading(place)+extra;
  }
  function train(){const t=data.train;zone.querySelector('[data-d7-train]').innerHTML='<article class="exec-edge d7-train"><div class="exec-top"><div class="exec-time">'+esc(t.depart)+'<br>–'+esc(t.arrive)+'</div><div class="exec-main"><div class="exec-heading"><div class="exec-title">'+esc(t.number)+' · '+link(p.czstation)+' → '+link(p.jcstation)+'</div>'+bell(p.jcstation,t.number+' 长治东→晋城东',t.depart,t.carriage+' '+t.seat)+'</div><p class="d7-keyline">'+esc(t.carriage)+' · '+esc(t.seat)+' · 已改签</p></div></div></article>';}
  function mealCard(id){const f=p[id];return '<article class="d7-food" data-food="'+esc(id)+'"><div class="exec-heading"><h4>'+link(f)+'</h4>'+bell(f)+'</div><span class="exec-tag">'+esc(f.status)+'</span><div class="d7-gallery">'+f.photos.map((src,i)=>'<figure><img src="'+esc(src)+'" alt="'+esc(f.name)+'食客图 '+(i+1)+'" loading="lazy"><figcaption>食客原帖图 '+(i+1)+'/'+f.photos.length+'</figcaption></figure>').join('')+'</div><p><b>这顿怎么点：</b>'+esc(f.dish)+'</p><p><b>单人：</b>'+esc(f.portion)+'</p><details class="exec-method"><summary>照片、好评与反评来源</summary><a href="'+esc(f.photoSource)+'" target="_blank" rel="noopener">食客原图 ↗</a> · <a href="'+esc(f.positive)+'" target="_blank" rel="noopener">具体体验 ↗</a> · <a href="'+esc(f.negative)+'" target="_blank" rel="noopener">反评 ↗</a><p>照片来自标注的食客笔记，非今日现场；营业和菜单以到店为准。</p></details></article>';}
  function renderMeal(){const box=zone.querySelector('[data-d7-meal]');box.className='exec-place d7-meal';box.innerHTML='<div class="exec-top"><div class="exec-time">约13:10</div><div class="exec-main"><div class="exec-title">午餐 · 换店可横滑</div></div></div><div class="exec-food-picker" role="group" aria-label="午餐选择">'+data.mealChoices.map(id=>'<button type="button" data-d7-pick="'+esc(id)+'" aria-pressed="'+(meal===id)+'">'+esc(p[id].name.replace(/·.*/,''))+'</button>').join('')+'</div><div class="exec-switch"><button type="button" data-d7-shift="-1" aria-label="上一家店">‹</button><span>'+(data.mealChoices.indexOf(meal)+1)+' / '+data.mealChoices.length+' · 左右滑动换店</span><button type="button" data-d7-shift="1" aria-label="下一家店">›</button></div><div class="exec-food-track" data-d7-track>'+data.mealChoices.map(mealCard).join('')+'</div>';box.querySelector('[data-d7-track]').scrollLeft=data.mealChoices.indexOf(meal)*box.querySelector('[data-d7-track]').clientWidth;}
  function endpoint(id){return p[id==='meal'?meal:id];}
  function embedRoute(from,to,m){
    const q=new URLSearchParams({from:from.lon+','+from.lat+','+from.name,to:to.lon+','+to.lat+','+to.name,type:{driving:'drive',walking:'walk',cycling:'ride'}[m],zoom:'13',platform:'pc'});
    if(m==='cycling')q.set('ride_type','bike');
    if(from.poi)q.set('from_poiid',from.poi);
    if(to.poi)q.set('to_poiid',to.poi);
    return 'https://www.amap.com/ssr/embed/dir?'+q.toString();
  }
  function routeEvidence(from,to,m){return data.routeEvidence.find(r=>core.routeKey(r.fromKey,r.toKey,r.mode)===core.routeKey(from.key,to.key,m));}
  function renderEdge(id){
    const [fromId,toId,time]=edges[id],from=endpoint(fromId),to=endpoint(toId),m=mode[id],box=zone.querySelector('[data-d7-edge="'+id+'"]');
    box.className='exec-edge d7-edge';box.dataset.routeKey=core.routeKey(from.key,to.key,m);
    const buttons=['driving','walking','cycling'].map(x=>{const ev=routeEvidence(from,to,x);return '<button type="button" data-d7-mode="'+x+'" data-for-edge="'+id+'" aria-pressed="'+(m===x)+'">'+names[x]+' '+(ev?ev.durationMin+'分钟':'未获取')+'</button>';}).join('');
    const cycling=m==='cycling'?'<p class="d7-cycling-note">共享车还车点：未获取</p>':'';
    box.innerHTML='<div class="exec-top"><div class="exec-time">'+esc(time)+'</div><div class="exec-main"><div class="exec-title">'+link(from)+' <span aria-hidden="true">→</span> '+link(to)+'</div></div></div>'
      +'<div class="exec-mode" role="group" aria-label="切换本段交通方式">'+buttons+'</div>'
      +'<div class="d7-map"><iframe title="高德'+names[m]+'地图：'+esc(from.name)+'到'+esc(to.name)+'" src="'+esc(embedRoute(from,to,m))+'" loading="eager" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><div class="d7-map-fallback">地图未显示？<a href="'+esc(routeUrl(from,to,m))+'">在高德打开路线 ↗</a></div></div>'
      +cycling+'<details class="exec-method"><summary>估时依据</summary><p>'+esc(data.routeEvidenceSource)+'</p></details>';
  }
  ['czhotel','jchotel','museum'].forEach(fixed);train();renderMeal();Object.keys(edges).forEach(renderEdge);
  const day=root.document.getElementById('day-7');
  if(day)day.addEventListener('toggle',()=>{if(day.open)setTimeout(()=>Object.keys(edges).forEach(renderEdge),30);});
  function selectMeal(id,scroll){if(!data.mealChoices.includes(id)||meal===id)return;meal=id;zone.querySelectorAll('[data-d7-pick]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.d7Pick===id)));zone.querySelector('.exec-switch span').textContent=(data.mealChoices.indexOf(id)+1)+' / '+data.mealChoices.length+' · 左右滑动换店';if(scroll){const t=zone.querySelector('[data-d7-track]');t.scrollTo({left:data.mealChoices.indexOf(id)*t.clientWidth,behavior:'smooth'});}renderEdge('jchotel-meal');renderEdge('meal-museum');}
  zone.addEventListener('click',e=>{const theme=e.target.closest('[data-d7-theme]');if(theme){zone.dataset.sightTheme=theme.dataset.d7Theme;zone.querySelectorAll('[data-d7-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b===theme)));return;}const pick=e.target.closest('[data-d7-pick]');if(pick){selectMeal(pick.dataset.d7Pick,true);return;}const shift=e.target.closest('[data-d7-shift]');if(shift){const i=Math.max(0,Math.min(data.mealChoices.length-1,data.mealChoices.indexOf(meal)+Number(shift.dataset.d7Shift)));selectMeal(data.mealChoices[i],true);return;}const button=e.target.closest('[data-d7-mode]');if(button){mode[button.dataset.forEdge]=button.dataset.d7Mode;renderEdge(button.dataset.forEdge);}});
  let timer;zone.querySelector('[data-d7-track]').addEventListener('scroll',e=>{clearTimeout(timer);timer=setTimeout(()=>selectMeal(data.mealChoices[Math.round(e.target.scrollLeft/e.target.clientWidth)],false),120);},{passive:true});
})(typeof window==='object'?window:globalThis);
