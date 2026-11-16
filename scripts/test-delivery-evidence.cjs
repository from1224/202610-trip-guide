const assert=require('node:assert/strict'),{audit}=require('./check-delivery.cjs');
const data={meta:{weekendSelection:['a']},items:[{id:'a',images:[]}]};
const row={status:'unreviewed',reason:'Not yet inspected',checkedAt:'2026-11-16',sources:[]};
const review={items:{a:row}};
assert(audit(data,{},null).errors.length); // old all-empty handoff cannot pass
assert.equal(audit(data,review,null).conclusion,'partial');
row.status='displayed';row.sources=['https://example.com/source'];
assert(audit(data,review,null).errors.length); // a link alone cannot be displayed
const withImage=structuredClone(data);withImage.items[0].images=[{src:'https://example.com/image.webp',source:'https://example.com/source',caption:'Official poster, not onsite photo'}];
assert(audit(withImage,review,null).errors.length); // local metadata is not online proof
const receipt={goal:'Deliver requested image',scope:'a',version:'v1',outcome:'complete',url:'https://example.com/guide',checks:[{name:'online',status:'passed',evidence:'Opened exact version'}],imageChecks:[{id:'a',url:'https://example.com/guide',checkedAt:'2026-11-16',loaded:true,assetCount:1,evidence:'Browser screenshot and visible image inspected'}]};
assert.equal(audit(withImage,review,receipt).errors.length,0);
receipt.imageChecks[0].assetCount=0;assert(audit(withImage,review,receipt).errors.length);
row.status='unusable';row.reason='Public reuse not permitted';assert(audit(withImage,review,null).errors.length);
assert.equal(audit(data,review,null).conclusion,'declared-evidence-consistent');
row.status='pending';receipt.outcome='complete';assert(audit(data,review,receipt).errors.length);
receipt.outcome='partial';assert.equal(audit(data,review,receipt).conclusion,'partial');
console.log('PASS: 9 delivery/image evidence regression scenarios');
