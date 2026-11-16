#!/usr/bin/env node
// Validate evidence declarations, not the truth of a human/browser observation.
const fs=require('node:fs'), path=require('node:path');
const STATES=new Set(['unreviewed','not_found','unusable','pending','ready','displayed']);
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const https=x=>typeof x==='string'&&/^https:\/\//.test(x);
function audit(data, review, receipt, root){
 const errors=[], gaps=[], counts={};
 const fail=x=>errors.push(x);
 const ids=data.meta?.weekendSelection||[];
 if(!ids.length) fail('No current selection: an empty scope is not completion');
 for(const id of ids){
  const item=data.items.find(x=>x.id===id), r=review?.items?.[id];
  if(!item){fail(`${id}: selected item missing`);continue}
  if(!r||!STATES.has(r.status)){fail(`${id}: explicit image-review status required`);continue}
  counts[r.status]=(counts[r.status]||0)+1;
  if(!nonempty(r.reason)||!nonempty(r.checkedAt)) fail(`${id}: reason/date required`);
  if(!Array.isArray(r.sources)) fail(`${id}: source list required (empty only when unreviewed)`);
  if(r.status!=='unreviewed'&&!r.sources?.some(https)) fail(`${id}: reviewed status needs an inspected source`);
  if(['unreviewed','pending','ready'].includes(r.status)) gaps.push(`${id}: ${r.status}`);
  if(['ready','displayed'].includes(r.status)){
   if(!item.images?.length) fail(`${id}: a source link is not an image`);
   for(const img of item.images||[]){
    if(!nonempty(img.src)||!nonempty(img.caption)||!https(img.source))fail(`${id}: image asset/caption/source required`);
    if(img.src?.startsWith('./')&&root&&!fs.existsSync(path.resolve(root,img.src)))fail(`${id}: missing local asset ${img.src}`);
   }
  }
  if(['not_found','unusable'].includes(r.status)&&item.images?.length)fail(`${id}: unavailable status contradicts images`);
  if(r.status==='displayed'){
   const proof=receipt?.imageChecks?.find(x=>x.id===id);
   if(!proof||!https(proof.url)||!nonempty(proof.checkedAt)||!nonempty(proof.evidence)||proof.loaded!==true)fail(`${id}: displayed requires dated online browser evidence`);
   if(proof?.assetCount!==item.images?.length)fail(`${id}: browser checked image count differs`);
  }
 }
 if(receipt){
  for(const k of ['goal','scope','version','outcome'])if(!nonempty(receipt[k]))fail(`receipt: ${k} required`);
  if(!https(receipt.url))fail('receipt: final URL required');
  if(!Array.isArray(receipt.checks)||!receipt.checks.length)fail('receipt: checks required');
  for(const c of receipt.checks||[])if(!nonempty(c.name)||!['passed','failed','not_run'].includes(c.status)||!nonempty(c.evidence))fail('receipt: every check needs status and evidence');
  if(receipt.outcome==='complete'&&((receipt.checks||[]).some(c=>c.status!=='passed')||gaps.length||errors.length))fail('receipt: complete contradicts unresolved evidence');
 }
 return {errors,gaps,counts,conclusion:errors.length?'invalid':gaps.length?'partial':'declared-evidence-consistent'};
}
module.exports={audit};
if(require.main===module){
 const args=process.argv.slice(2), strict=args.includes('--strict'), files=args.filter(x=>x!=='--strict');
 if(files.length<2){console.error('Usage: node scripts/check-delivery.cjs data.json image-review.json [receipt.json] [--strict]');process.exit(2)}
 try{const result=audit(JSON.parse(fs.readFileSync(files[0])),JSON.parse(fs.readFileSync(files[1])),files[2]?JSON.parse(fs.readFileSync(files[2])):null,path.dirname(path.resolve(files[0])));console.log(JSON.stringify(result,null,2));process.exitCode=result.errors.length||(strict&&result.gaps.length)?1:0}catch(e){console.error(e.message);process.exitCode=1}
}
