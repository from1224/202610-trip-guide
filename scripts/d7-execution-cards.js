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
  let mapReady=false;
  const mode={
    'czhotel-czstation':'driving',
    'jcstation-jchotel':'driving',
    'jchotel-meal':'driving',
    'meal-museum':'walking',
    'museum-jchotel':'driving'
  };
  const edges={
    'czhotel-czstation':['czhotel','czstation','10:00'],
    'jcstation-jchotel':['jcstation','jchotel','12:00'],
    'jchotel-meal':['jchotel','meal','12:50'],
    'meal-museum':['meal','museum','14:00'],
    'museum-jchotel':['museum','jchotel','16:15']
  };
  const names={driving:'打车',walking:'步行',cycling:'骑行'};
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function placeUrl(place){const q=new URLSearchParams({position:place.lon+','+place.lat,name:place.name,coordinate:'gaode',src:'xiaocai-trip',callnative:'1'});return 'https://uri.amap.com/marker?'+q.toString();}
  function routeUrl(from,to,m){const q=new URLSearchParams({from:from.lon+','+from.lat+','+from.name,to:to.lon+','+to.lat+','+to.name,mode:{driving:'car',walking:'walk',cycling:'ride'}[m],src:'xiaocai-trip',callnative:'1'});return 'https://uri.amap.com/navigation?'+q.toString();}
  function link(place){return '<span class="d7-place-target"><span class="d7-place-name">'+esc(place.name)+'</span><a class="d7-open-link" href="'+esc(placeUrl(place))+'" aria-label="在高德打开'+esc(place.name)+'">↗</a></span>';}
  function ticketStop(place){return '<a class="d7-ticket-stop" href="'+esc(placeUrl(place))+'">'+esc(place.name.replace(/站$/,''))+'</a>';}
  function bell(place,title=place.name,time=place.time,body=place.address||''){const q=new URLSearchParams({send:'1',title,time,body,place:place.name,lat:String(place.lat),lon:String(place.lon)});return '<a class="exec-bell" href="intent://import?'+esc(q.toString())+'#Intent;scheme=tripcard;package=com.xiaocai.tripcard;end" aria-label="发送'+esc(title)+'随身行程卡" title="发送到安卓随身行程卡">🔔</a>';}
  function heading(place){const time=place.time.includes('–')?'<span class="d7-time-stack"><span>'+esc(place.time.split('–')[0])+'</span><i>⋮</i><span>'+esc(place.time.split('–')[1])+'</span></span>':esc(place.time);return '<div class="exec-top"><div class="exec-time">'+time+'</div><div class="exec-main"><div class="exec-heading"><div class="exec-title">'+link(place)+'</div></div></div></div>';}
  function fixed(id){const place=p[id],box=zone.querySelector('[data-d7-place="'+id+'"]');let extra='';
    if(id==='museum')extra='<section class="d7-museum-section"><h4>基本信息</h4><div class="exec-facts"><div><b>开放时间：</b>'+esc(place.opening)+'</div><div><b>电话：</b><a href="tel:'+esc(place.phone)+'">'+esc(place.phone)+' · 点击拨号</a></div><div><b>讲解时间：</b>'+esc(place.explain)+'</div><div><b>入馆／存包：</b>'+esc(place.access)+'</div></div></section>'
      +'<section class="d7-museum-section"><h4>馆藏与特展</h4><div class="exec-focus"><b>先看：</b>'+esc(place.highlight)+'</div>'
      +photoGroup('馆方特展 · 5 图',place.exhibitionPhotos,place.exhibitionSource,'馆方「我从宋朝来」特展现场')
      +'</section><section class="d7-museum-section"><h4>导引路线与机位</h4><figure class="exec-photo exec-guide"><img src="'+esc(place.guideImage)+'" alt="晋城博物馆官方参观导览图" loading="lazy"><figcaption><a href="'+esc(place.guideSource)+'" target="_blank" rel="noopener">馆方导览图／参观路线 ↗</a> · 机位具体位置未获取</figcaption></figure>'
      +photoGroup('游客机位参考 · 5 图',place.visitorPhotos,place.visitorSource,'游客此前馆内实拍；具体拍摄位置未核')
      +'</section><section class="d7-museum-section"><h4>重点文物</h4><figure class="exec-photo d7-artifact"><img src="'+esc(place.photo)+'" alt="北齐乾明元年昙始造像碑座馆藏图" loading="lazy"><figcaption>北齐乾明元年昙始造像碑座 · <a href="'+esc(place.photoSource)+'" target="_blank" rel="noopener">馆方馆藏图与介绍 ↗</a></figcaption></figure><p>这是馆藏资料图，不代表今日在展；到馆按展厅实际陈列确认。</p></section>'
      +'<details class="exec-method"><summary>开放公告与馆藏来源</summary><a href="'+esc(place.source)+'" target="_blank" rel="noopener">国庆开放公告 ↗</a> · <a href="'+esc(place.phoneSource)+'" target="_blank" rel="noopener">电话来源 ↗</a> · <a href="'+esc(place.photoSource)+'" target="_blank" rel="noopener">昙始造像碑座馆藏图 ↗</a></details>';
    box.className='exec-place d7-place d7-'+esc(place.kind);box.innerHTML=heading(place)+bell(place)+(extra?'<div class="d7-card-detail">'+extra+'</div>':'');
  }
  function photoGroup(title,photos,source,alt){return '<div class="d7-photo-heading">'+esc(title)+'</div><div class="d7-photo-track">'+photos.map((src,i)=>'<figure><img src="'+esc(src)+'" alt="'+esc(alt)+' '+(i+1)+'" loading="lazy" referrerpolicy="no-referrer"><figcaption>'+(i+1)+' / '+photos.length+'</figcaption></figure>').join('')+'</div><a class="d7-photo-source" href="'+esc(source)+'" target="_blank" rel="noopener">查看原文与完整图集 ↗</a>';}
  function train(){const t=data.train;zone.querySelector('[data-d7-train]').innerHTML=root.GuideTransportTicket.render({...t,origin:t.origin||p.czstation.name.replace(/站$/,''),destination:t.destination||p.jcstation.name.replace(/站$/,''),originUrl:placeUrl(p.czstation),destinationUrl:placeUrl(p.jcstation),date:t.date||data.date});}
  function mealCard(id){const f=p[id];return '<article class="d7-food" data-food="'+esc(id)+'"><div class="d7-reason-row"><p class="d7-reason"><b>推荐理由：</b>'+esc(f.status.replace(/^(主选|备选)\s*·\s*/,''))+'</p></div><div class="d7-gallery">'+f.photos.map((src,i)=>'<figure><img src="'+esc(src)+'" alt="'+esc(f.name)+'食客图 '+(i+1)+'" loading="lazy"><figcaption>食客原帖图 '+(i+1)+'/'+f.photos.length+'</figcaption></figure>').join('')+'</div><p><b>这顿怎么点：</b>'+esc(f.dish)+'</p><p><b>单人：</b>'+esc(f.portion)+'</p><details class="exec-method"><summary>照片、好评与反评来源</summary><a href="'+esc(f.photoSource)+'" target="_blank" rel="noopener">食客原图 ↗</a> · <a href="'+esc(f.positive)+'" target="_blank" rel="noopener">具体体验 ↗</a> · <a href="'+esc(f.negative)+'" target="_blank" rel="noopener">反评 ↗</a><p>照片来自标注的食客笔记，非今日现场；营业和菜单以到店为准。</p></details><a class="d7-address-link" href="'+esc(placeUrl(f))+'" aria-label="在高德查看'+esc(f.name)+'具体地址">具体地址</a></article>';}
  function renderMeal(){const box=zone.querySelector('[data-d7-meal]');box.className='exec-place d7-meal';box.innerHTML='<div class="exec-top"><div class="exec-time">13:10</div><div class="exec-main"><div class="exec-title">午餐</div></div></div>'+bell(p[meal])+'<div class="d7-card-detail"><div class="exec-food-picker" role="group" aria-label="午餐选择">'+data.mealChoices.map(id=>'<button type="button" data-d7-pick="'+esc(id)+'" aria-pressed="'+(meal===id)+'">'+esc(p[id].name.replace(/·.*/,''))+'</button>').join('')+'</div>'+mealCard(meal)+'</div>';}
  function endpoint(id){return p[id==='meal'?meal:id];}
  function embedRoute(from,to,m){
    const q=new URLSearchParams({from:from.lon+','+from.lat+','+from.name,to:to.lon+','+to.lat+','+to.name,type:{driving:'drive',walking:'walk',cycling:'ride'}[m],zoom:'13',platform:'pc'});
    if(m==='cycling')q.set('ride_type','bike');
    if(from.poi)q.set('from_poiid',from.poi);
    if(to.poi)q.set('to_poiid',to.poi);
    return 'https://www.amap.com/ssr/embed/dir?'+q.toString();
  }
  function routeEvidence(from,to,m){return data.routeEvidence.find(r=>core.routeKey(r.fromKey,r.toKey,r.mode)===core.routeKey(from.key,to.key,m));}
  function metric(ev){return ev?(ev.distanceM<1000?ev.distanceM+' m':(ev.distanceM/1000).toFixed(1)+' km')+' · '+ev.durationMin+' min':'未获取';}
  function renderOverview(){const map=zone.querySelector('.d7-overview-map');if(!map)return;const initial=routeEvidence(p.czhotel,p.czstation,'driving');map.querySelector('[data-overview-leg="czhotel-station"]').innerHTML='<b>打车</b> '+metric(initial);map.querySelector('[data-overview-leg="train"]').innerHTML='<b>'+esc(data.train.number)+'</b> '+esc(data.train.depart)+'–'+esc(data.train.arrive)+' · 36 min';const labels={'station-hotel':['jcstation','jchotel','driving','打车'],'hotel-food':['jchotel',meal,'driving','打车'],'food-museum':[meal,'museum','walking','步行'],'museum-hotel':['museum','jchotel','driving','打车']};Object.entries(labels).forEach(([key,[a,b,m,title]])=>{map.querySelector('[data-overview-leg="'+key+'"]').innerHTML='<b>'+title+'</b> '+metric(routeEvidence(p[a],p[b],m));});map.querySelector('.d7-pin.food').textContent=p[meal].name.replace(/·.*/,'');map.querySelector('.d7-map-city.jincheng').dataset.meal=meal;map.setAttribute('aria-label','长治如家精选到长治东站，再乘D3349到晋城东站；晋城东站在东北，华之晋酒店在南，'+p[meal].name+'与晋城博物馆在市区北侧；连线标有交通方式、道路距离和预计分钟');}
  function renderEdge(id){
    const [fromId,toId,time]=edges[id],from=endpoint(fromId),to=endpoint(toId),m=mode[id],box=zone.querySelector('[data-d7-edge="'+id+'"]');
    box.className='exec-edge d7-edge';box.dataset.routeKey=core.routeKey(from.key,to.key,m);
    const buttons=['driving','walking','cycling'].map(x=>{const ev=routeEvidence(from,to,x);return '<button type="button" data-d7-mode="'+x+'" data-for-edge="'+id+'" aria-pressed="'+(m===x)+'">'+names[x]+' '+(ev?ev.durationMin+'分钟':'未获取')+'</button>';}).join('');
    const cycling=m==='cycling'?'<p class="d7-cycling-note">共享车还车点：未获取</p>':'';
    box.innerHTML='<div class="exec-top"><div class="exec-time">'+esc(time)+'</div><div class="exec-main"><div class="d7-endpoints"><div class="d7-endpoint"><span class="d7-endpoint-dot start"></span>'+link(from)+'</div><span class="d7-endpoint-ellipsis" aria-hidden="true">⋮</span><div class="d7-endpoint"><span class="d7-endpoint-dot finish"></span>'+link(to)+'</div></div></div></div>'
      +'<div class="d7-card-detail"><div class="exec-mode" role="group" aria-label="切换本段交通方式">'+buttons+'</div>'
      +'<div class="d7-map"><iframe title="高德'+names[m]+'地图：'+esc(from.name)+'到'+esc(to.name)+'" '+(mapReady?'src="'+esc(embedRoute(from,to,m))+'"':'data-src="'+esc(embedRoute(from,to,m))+'"')+' loading="eager" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'
      +'<a class="d7-map-open" href="'+esc(routeUrl(from,to,m))+'">高德打开</a>'
      +cycling+'</div>';
  }
  ['jchotel','museum'].forEach(fixed);train();renderMeal();renderOverview();Object.keys(edges).forEach(renderEdge);
  const day=root.document.getElementById('day-7');
  function activateMaps(){if(!day?.open)return;root.requestAnimationFrame(()=>root.setTimeout(()=>{mapReady=true;Object.keys(edges).forEach(id=>zone.querySelector('[data-d7-edge="'+id+'"] [data-d7-mode][aria-pressed="true"]')?.click());},80));}
  if(day){day.addEventListener('toggle',activateMaps);if(day.open)activateMaps();}
  function selectMeal(id){if(!data.mealChoices.includes(id)||meal===id)return;meal=id;renderMeal();renderOverview();renderEdge('jchotel-meal');renderEdge('meal-museum');}
  zone.addEventListener('click',e=>{const pick=e.target.closest('[data-d7-pick]');if(pick){selectMeal(pick.dataset.d7Pick);return;}const button=e.target.closest('[data-d7-mode]');if(button){mode[button.dataset.forEdge]=button.dataset.d7Mode;renderEdge(button.dataset.forEdge);}});
})(typeof window==='object'?window:globalThis);
