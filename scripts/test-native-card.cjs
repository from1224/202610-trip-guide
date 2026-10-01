const assert = require('node:assert/strict');
const link = require('./native-card.js');
const input = {title:'华门 # & 嘉年华',body:'饽糕\n羊汤',time:'17:00',lat:'36.052041',lon:'111.488056'};
const result=link(input);
assert(result.endsWith('#Intent;scheme=tripcard;package=com.xiaocai.tripcard;end'));
const params=new URLSearchParams(result.split('?')[1].split('#')[0]);
for(const key of Object.keys(input)) assert.equal(params.get(key),input[key]);
assert.equal((result.match(/#Intent/g)||[]).length,1);
console.log('PASS native intent encoding, fixed package, Chinese/newline round-trip');
