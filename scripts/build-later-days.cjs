// D5–D9 share D4's compact timeline / closed evidence drawer format.
// Authored content lives in data/later-days.json. No network or credential access.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const executionCore=require('./execution-card-core.js');
const d5Execution=executionCore.validate(JSON.parse(fs.readFileSync(path.join(root,'data/d5-execution.json'),'utf8')));
const d7Execution=JSON.parse(fs.readFileSync(path.join(root,'data/d7-execution.json'),'utf8'));
function escape(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');}
function drawer(d){return '<details class="d4-drawer"><summary>'+escape(d.label)+'</summary><div>'+d.html+'</div></details>';}
function execution(d){
 if(d.day===7){
  const payload=escape(JSON.stringify(d7Execution));
  return '<section class="exec-zone d7-zone" id="d7-execution" data-d7="'+payload+'" data-sight-theme="violet" aria-label="10月4日晋城执行卡">'
   +'<div class="d7-overview"><div class="d7-overview-title">今日方位图 <small>坐标方位示意 · 非道路路线 · 不按比例</small></div>'
   +'<div class="d7-overview-map" role="img" aria-label="晋城东站在东北，华之晋酒店在南，十小碗和晋城博物馆在市区北侧且相近"><span class="d7-north">N ↑</span><span class="d7-pin station">晋城东</span><span class="d7-pin hotel">华之晋</span><span class="d7-pin food">十小碗</span><span class="d7-pin sight">博物馆</span></div>'
   +'<div class="d7-overview-rail">长治东 11:24 <b>→ D3349 →</b> 晋城东 12:00</div><div class="d7-overview-source">'+d.weather+'</div></div>'
   +'<div data-d7-place="czhotel"></div><div data-d7-edge="czhotel-czstation"></div>'
   +'<div data-d7-train></div><div data-d7-edge="jcstation-jchotel"></div>'
   +'<div data-d7-place="jchotel"></div><div data-d7-edge="jchotel-meal"></div><div data-d7-meal></div>'
   +'<div data-d7-edge="meal-museum"></div><div data-d7-place="museum"></div><div data-d7-edge="museum-jchotel"></div>'
   +'<div class="d7-rest">16:15 后打车回华之晋酒店休息；不接夜游。</div>'
   +'<noscript>请启用 JavaScript 查看地点切换与交通联动；下方文字行程仍可阅读。</noscript></section>';
 }
 if(d.day!==5)return '';
 const payload=escape(JSON.stringify(d5Execution));
 return '<section class="exec-zone" id="d5-execution" data-execution="'+payload+'" aria-label="10月2日真实地点换店交互">'
   +'<div class="exec-kicker">10/2 实走 · 可切换试用</div><h3>'+escape(d5Execution.title)+'</h3>'
   +'<p class="exec-note">'+escape(d5Execution.note)+'</p>'
   +'<div class="exec-sequence">酒店 <b>→</b> 午餐 <b>→</b> 城隍庙 <b>→</b> 上党门 <b>→</b> 博物馆</div>'
   +'<div class="exec-place" data-slot="start"></div>'
   +'<div class="exec-edge" data-edge="hotel-meal" aria-live="polite"></div>'
   +'<div class="exec-place" data-slot="meal"></div>'
   +'<div class="exec-edge" data-edge="meal-sight" aria-live="polite"></div>'
   +'<div class="exec-place" data-slot="sight"></div>'
   +'<div class="exec-edge" data-edge="sight-gate" aria-live="polite"></div>'
   +'<div class="exec-place" data-slot="gate"></div>'
   +'<div class="exec-edge" data-edge="gate-museum" aria-live="polite"></div>'
   +'<div class="exec-edge" data-edge="sight-museum" aria-live="polite" hidden></div>'
   +'<div class="exec-place" data-slot="end"></div>'
   +'<div class="exec-later"><b>博物馆之后 · 尚未做成可执行路线</b><p>实际还去了森林公园、汉堡街、城市阳台、晚餐与万达买次晨面包；这些精确上下车点和店名没核，不能继续套前面那张图。城市阳台不要照“沿湖骑过去”执行：现查到的<a href="https://www.amap.com/ssr/search/poi_detail?id=B0K15CVLW0" target="_blank" rel="noopener">城市阳台地面停车场出入口（高德）</a>标注仅机动车通行，落客后到观景平台的步行入口仍待核。</p></div>'
   +'<details class="exec-method"><summary>10/2 其余实走与路线缺口</summary><p>早班列车上买早饭；博物馆后打车到森林公园、汉堡街，再到城市阳台。午饭后约16点吃虾汉堡的体验不佳；晚上吃驴肉馍、煎饼和大份丸子汤，餐后偏撑；饭后到万达买麦田之上面包作次晨补给。上述地点的精确分店/上下车点、入口、时间未全核，不拿概述冒充执行导航。城市阳台共享车环湖入口与停放未核，当前不推荐照旧稿骑行。</p></details>'
   +'<details class="exec-method"><summary>地图与切换规则</summary><p>只有起点 key、终点 key、交通方式三项完全相同，才复用路线测距和高德截图。换午餐更新前后两段交通；将城隍庙改成“直去上党门”会跳过中间重复站并重算去博物馆的交通。无同方式截图时显式留空；截图不证明入口或共享车停车点。</p></details>'
   +'</section>';
}
function range(html,day){
 const re=new RegExp('<details class="day"[^>]*id="day-'+day+'"[^>]*>'),m=re.exec(html);
 if(!m)throw Error('Missing day '+day);
 const tags=/<\/?details\b[^>]*>/g;tags.lastIndex=m.index;
 let depth=0,t;
 while((t=tags.exec(html))){depth+=t[0].startsWith('</')?-1:1;if(depth===0)return[m.index,tags.lastIndex];}
 throw Error('Unclosed day '+day);
}
function render(d){
 const rows=d.rows.map(r=>'<div class="tl-i"><div class="tl-t">'+escape(r.time)+'</div><div class="tl-d"></div><div class="tl-c"><div class="h">'+r.title+'</div>'+r.facts.map(f=>'<div class="n">'+f+'</div>').join('')+(r.drawers||[]).map(drawer).join('')+'</div></div>').join('\n');
 const timeline=d.day===5?'<details class="d4-drawer prior-plan"><summary>10/2 原计划快照 · 不作为已发生</summary><div class="tl">'+rows+'</div></details>':d.day===7?'<details class="d4-drawer prior-plan"><summary>文字行程与证据备查</summary><div class="tl">'+rows+'</div></details>':'<div class="tl">'+rows+'</div>';
 const note=d.day===5?'实走反馈来自本人；切换项仅为路线体验，不代表当日又去过或已核营业。':d.day===7?'火车按本人 12306 订单；市内交通方式用时为 10/4 高德估时，进站与叫车另留缓冲。':'资料整理：10/1。钟点未注明“车次／官方”的均为行程建议；道路耗时为模型估算。原订单未改动。';
 const lead=d.day===7?'':('<div class="day-flow">'+escape(d.summary)+'<small>'+d.weather+'</small></div>');
 return '<details class="day" data-c="'+d.city+'" id="day-'+d.day+'" data-date="'+d.date+'" data-practical="1">\n<summary><div class="dh"><div class="dnum"><em>D'+d.day+'</em>10/'+(d.day-3)+'</div><div class="dti"><div class="t">'+escape(d.title)+'</div><div class="s">'+escape(d.subtitle)+'</div></div><div class="cv">▾</div></div></summary>\n<div class="dbody">'+lead+execution(d)+timeline+'<details class="d4-drawer day-archive"><summary>备选方案 · 主线不变，按需展开</summary><div>'+d.alternatives.map(drawer).join('')+'</div></details><p class="d4-note">'+note+'</p></div>\n</details>';
}
function build(html,data){for(const d of data.days){const[a,b]=range(html,d.day);html=html.slice(0,a)+render(d)+html.slice(b);}return html;}
if(require.main===module){
 const file=path.join(root,'index.html'),html=fs.readFileSync(file,'utf8'),data=JSON.parse(fs.readFileSync(path.join(root,'data/later-days.json'),'utf8')),next=build(html,data);
 if(process.argv.includes('--check')){if(next!==html){console.error('D5–D9 generated content is stale');process.exitCode=1;}else console.log('PASS: D5–D9 generated content is current');}
 else{fs.writeFileSync(file,next);console.log('Rendered D5–D9 only');}
}
module.exports={build,render,range};
