const assert=require("node:assert/strict"),data=require("./data.json");
const by=s=>data.items.filter(x=>x.status===s);
assert.equal(by("active").length,9);assert.equal(by("permanent").length,12);assert.equal(by("archived").length,3);assert.equal(by("pending").length,14);
assert.equal(new Set(data.items.map(x=>x.id)).size,data.items.length);
for(const id of ["yu-xiangyu-minimum-unit","ashida-all-sounds-concert"]){const x=data.items.find(x=>x.id===id);assert.equal(x.status,"active");assert.equal(x.dateStart,"2026-10-18");assert(x.sources[0][1].startsWith("https://weibo.com/2/detail/"))}
for(const x of data.items){assert(x.id&&x.kind&&x.venue&&x.price&&x.checkedAt);assert(x.sources.length)}
for(const x of by("pending")){assert(x.sourceNoteId&&x.imagePage&&x.itemIndex)}
console.log("hangzhou activity data: ok");
