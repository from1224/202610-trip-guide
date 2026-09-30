const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {tripDate,currentDay}=require('./itinerary-ui.js');
const dates=['2026-09-28','2026-09-29','2026-09-30','2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05','2026-10-06'];
assert.equal(tripDate(new Date('2026-09-30T16:01:00Z')),'2026-10-01');
assert.equal(currentDay(new Date('2026-09-30T15:59:00Z'),dates),'2026-09-30');
assert.equal(currentDay(new Date('2026-09-30T16:00:00Z'),dates),'2026-10-01');
assert.equal(currentDay(new Date('2026-10-01T16:00:00Z'),dates),'2026-10-02');
assert.equal(currentDay(new Date('2026-10-07T00:00:00Z'),dates),null);
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
assert.equal((html.match(/<details class="day"/g)||[]).length,9);
assert(!/<details class="day"[^>]*\bopen\b/.test(html));
assert(html.includes('id="day-4" data-date="2026-10-01"'));
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
console.log('PASS: Shanghai date boundary, 9 dated days, no hard-coded open states, script syntax');

// A tab left open overnight must move only the date badge, not its reading position.
let now='2026-10-01T15:59:00Z', interval;
const events={},docEvents={},status={},todayButton={};
const cards=dates.map((date,i)=>({dataset:{date},open:false,toggleAttribute:(name,on)=>cards[i].today=on,querySelector:()=>({textContent:'D'+(i+1)}),querySelectorAll:()=>[],scrollIntoView(){}}));
const doc={querySelectorAll:s=>s==='#p-plan > details.day'?cards:[],getElementById:id=>id==='plan-date-status'?status:null,querySelector:()=>todayButton,addEventListener:(n,f)=>docEvents[n]=f,hidden:false};
const win={document:doc,addEventListener:(n,f)=>events[n]=f,setInterval:f=>interval=f};
class Clock extends Date{constructor(...args){super(...(args.length?args:[now]));}}
vm.runInNewContext(fs.readFileSync(__dirname+'/itinerary-ui.js','utf8'),{window:win,Date:Clock,Intl,history:{},location:{hash:''},requestAnimationFrame:f=>f()});
assert(cards[3].today);assert(cards[3].open);
now='2026-10-01T16:00:00Z';interval();
assert(!cards[3].today);assert(cards[4].today);assert(cards[3].open);assert(!cards[4].open);
now='2026-10-02T16:00:00Z';docEvents.visibilitychange();assert(cards[5].today);
assert.match(status.textContent,/D6 今天/);
assert(html.indexOf('.day-flow small')<html.indexOf('</style>'),'new CSS stays inside style');
assert(html.includes('id="d4-notification"'));
console.log('PASS: overnight badge, resume refresh, retained open card, CSS containment, stable notification mount');
