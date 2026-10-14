const assert=require('node:assert/strict'),data=require('./data.json');
assert.equal(data.items.length,4);
assert.equal(new Set(data.items.map(x=>x.id)).size,4);
assert.equal(data.items.filter(x=>x.title.includes('浙江美术馆')).length,1);
assert.equal(data.items.filter(x=>x.price.includes('免费')).length,2);
for(const x of data.items){assert(x.dateStart&&x.venue&&x.price&&x.checkedAt===undefined);assert(x.sources.length)}
console.log('hangzhou activity data: ok');
