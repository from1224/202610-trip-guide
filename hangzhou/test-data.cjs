const assert=require("node:assert/strict"),data=require("./data.json");
const by=s=>data.items.filter(x=>x.status===s);
assert.equal(by("active").length,4);assert.equal(by("permanent").length,12);assert.equal(by("archived").length,3);assert.equal(by("pending").length,17);
assert.equal(new Set(data.items.map(x=>x.id)).size,data.items.length);
for(const x of data.items){assert(x.id&&x.kind&&x.venue&&x.price&&x.checkedAt);assert(x.sources.length)}
for(const x of by("pending")){assert(x.sourceNoteId&&x.imagePage&&x.itemIndex)}
console.log("hangzhou activity data: ok");
