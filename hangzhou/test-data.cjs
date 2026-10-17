const assert=require("node:assert/strict"),data=require("./data.json");
const by=s=>data.items.filter(x=>x.status===s);
assert.equal(by("active").length,17);assert.equal(by("permanent").length,12);assert.equal(by("archived").length,3);assert.equal(by("pending").length,16);
assert.equal(new Set(data.items.map(x=>x.id)).size,data.items.length);
for(const id of ["yu-xiangyu-minimum-unit","ashida-all-sounds-concert"]){const x=data.items.find(x=>x.id===id);assert.equal(x.status,"active");assert.equal(x.dateStart,"2026-10-18")}
assert.equal(data.items.find(x=>x.id==="yu-xiangyu-minimum-unit").sources[0][1],"https://detail.damai.cn/item.htm?id=1080414047097");
assert(data.items.find(x=>x.id==="ashida-all-sounds-concert").sources[0][1].startsWith("https://weibo.com/2/detail/"));
const drama=data.items.find(x=>x.id==="inter-alia-hangzhou");assert.equal(drama.status,"active");assert.equal(drama.dateEnd,"2026-10-18");assert.equal(drama.sources.length,2);
const zjam=data.items.find(x=>x.id==="zjam-october-exhibitions");assert.equal(zjam.images.length,3);assert.equal(new Set(zjam.images.map(x=>x.src)).size,3);for(const image of zjam.images)assert(image.source.includes("ExbitionDetail.aspx"));
for(const [id,count] of [["zhejiang-museum-taipingnian",5],["liangzhu-museum-cong-spectrum",5],["west-lake-museum-ten-scenes",5],["zhejiang-natural-ammonite",5]]){const x=data.items.find(x=>x.id===id);assert.equal(x.images.length,count);assert.equal(new Set(x.images.map(i=>i.src)).size,count);for(const image of x.images)assert(image.source.startsWith("https://"))}
const frankie=data.items.find(x=>x.id==="frankie-akil-live-hangzhou");assert.equal(frankie.status,"active");assert.equal(frankie.dateStart,"2026-10-17");assert.equal(frankie.sources[0][1],"https://www.showstart.com/event/311138");
for(const id of ["pending-ideal-islands-art-market","pending-qincheng-reuse-market-sports"]){const x=data.items.find(x=>x.id===id);assert.equal(x.status,"pending");assert.equal(x.dateStart,null);assert(x.sources[0][1].includes("6ad088e6000000001802b695"))}
for(const x of data.items){assert(x.id&&x.kind&&x.venue&&x.price&&x.checkedAt);assert(x.sources.length)}
for(const x of by("pending")){assert(x.sourceNoteId&&x.imagePage&&x.itemIndex)}
assert.equal(data.foodItems.length,6);assert.equal(new Set(data.foodItems.map(x=>x.id)).size,data.foodItems.length);
for(const id of ["food-xiangyuandao-gudun","food-wanjiu-shangtang","food-huqia-jingdezhen","food-yangyouxi-xixi"]){const x=data.foodItems.find(x=>x.id===id);assert(x);assert.equal(x.label,"候选");assert.equal(x.checkedAt,"2026-10-17")}
for(const x of data.foodItems){assert(x.id&&x.cuisine&&x.area&&x.title&&x.venue&&x.address&&x.price&&x.conditions&&x.sources.length);assert(!["萧山区","临平区","滨江区"].includes(x.area));for(const source of x.sources)assert(!source[1]?.includes("xiaohongshu.com/search_result/"))}
for(const id of ["food-luyaoliu-gudun","food-xiangfei-tianmuli","food-wanjiu-shangtang"]){const x=data.foodItems.find(x=>x.id===id);assert(x.sources.some(s=>s[1]?.includes("xiaohongshu.com/explore/")));assert(!x.conditions.includes("待补"))}
for(const id of ["zhejiang-museum-taipingnian","liangzhu-museum-cong-spectrum","yujia-museum-zhili","west-lake-museum-ten-scenes","zhejiang-natural-ammonite","kuahuqiao-wenjing-liuguang"]){const x=data.items.find(x=>x.id===id);assert.equal(x.status,"active");assert(x.exhibitionType);assert(x.sources[0][1].startsWith("https://art.icity.ly/events/"))}
assert.equal(data.meta.weather.validThrough,"2026-10-18");assert.equal(data.meta.weather.days.length,2);for(const day of data.meta.weather.days)assert(day.date>="2026-10-17"&&Number.isFinite(day.high)&&Number.isFinite(day.low));
console.log("hangzhou activity data: ok");
