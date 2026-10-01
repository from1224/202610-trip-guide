// D5–D9 share D4's compact timeline / closed evidence drawer format.
// Authored content lives in data/later-days.json. No network or credential access.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
function escape(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');}
function drawer(d){return '<details class="d4-drawer"><summary>'+escape(d.label)+'</summary><div>'+d.html+'</div></details>';}
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
 return '<details class="day" data-c="'+d.city+'" id="day-'+d.day+'" data-date="'+d.date+'" data-practical="1">\n<summary><div class="dh"><div class="dnum"><em>D'+d.day+'</em>10/'+(d.day-3)+'</div><div class="dti"><div class="t">'+escape(d.title)+'</div><div class="s">'+escape(d.subtitle)+'</div></div><div class="cv">▾</div></div></summary>\n<div class="dbody"><div class="day-flow">'+escape(d.summary)+'<small>'+d.weather+'</small></div><div class="tl">'+rows+'</div><details class="d4-drawer day-archive"><summary>备选方案 · 主线不变，按需展开</summary><div>'+d.alternatives.map(drawer).join('')+'</div></details><p class="d4-note">资料整理：10/1。钟点未注明“车次／官方”的均为行程建议；道路耗时为模型估算。原订单未改动。</p></div>\n</details>';
}
function build(html,data){for(const d of data.days){const[a,b]=range(html,d.day);html=html.slice(0,a)+render(d)+html.slice(b);}return html;}
if(require.main===module){
 const file=path.join(root,'index.html'),html=fs.readFileSync(file,'utf8'),data=JSON.parse(fs.readFileSync(path.join(root,'data/later-days.json'),'utf8')),next=build(html,data);
 if(process.argv.includes('--check')){if(next!==html){console.error('D5–D9 generated content is stale');process.exitCode=1;}else console.log('PASS: D5–D9 generated content is current');}
 else{fs.writeFileSync(file,next);console.log('Rendered D5–D9 only');}
}
module.exports={build,render,range};
