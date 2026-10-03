(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.GuideExecutionCore=api;
})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  const modeType={driving:'0',walking:'2',cycling:'3'};
  function assert(ok,message){if(!ok)throw new Error('execution card: '+message);}
  function finitePoint(p){return Number.isFinite(p.lon)&&Number.isFinite(p.lat)&&p.lon>=70&&p.lon<=140&&p.lat>=15&&p.lat<=55;}
  function routeKey(fromKey,toKey,mode){return fromKey+'|'+toKey+'|'+mode;}
  function mapGeometry(from,to){
    assert(finitePoint(from)&&finitePoint(to),'map endpoints invalid');
    const lat=(from.lat+to.lat)/2*Math.PI/180;
    const east=(to.lon-from.lon)*Math.cos(lat)*111320;
    const north=(to.lat-from.lat)*110540;
    const scale=30/Math.max(Math.abs(east),Math.abs(north),1);
    return {from:{x:50-east*scale/2,y:50+north*scale/2},to:{x:50+east*scale/2,y:50-north*scale/2},kind:'relative-direction',roadVerified:false};
  }
  function validate(data){
    assert(data&&data.date&&data.coordinateSystem==='GCJ-02'&&data.places&&data.slots&&Array.isArray(data.choices)&&Array.isArray(data.sightChoices)&&Array.isArray(data.edges),'missing structure or coordinate system');
    const keys=new Set();
    for(const [id,p] of Object.entries(data.places)){
      assert(p.key&&p.name&&finitePoint(p),'invalid place '+id);
      assert(!keys.has(p.key),'duplicate place key '+p.key);
      if(p.photo)assert(/^https:\/\//.test(p.photo)&&/^https:\/\//.test(p.photoSource||'')&&p.photoCaption,'photo provenance missing '+id);
      keys.add(p.key);
    }
    for(const id of Object.values(data.slots))assert(data.places[id],'missing slot place '+id);
    for(const id of data.choices)assert(data.places[id]&&data.places[id].kind==='food','invalid meal choice '+id);
    for(const id of data.sightChoices)assert(data.places[id]&&data.places[id].kind==='sight','invalid sight choice '+id);
    assert(new Set(data.choices).size===data.choices.length&&new Set(data.sightChoices).size===data.sightChoices.length,'duplicate choice');
    assert(data.choices.includes(data.slots.meal)&&data.sightChoices.includes(data.slots.sight),'default choice missing');
    const edgeIds=new Set();
    for(const e of data.edges){
      assert(e.id&&!edgeIds.has(e.id),'duplicate edge id '+e.id);
      edgeIds.add(e.id);
      assert(e.from in data.slots&&e.to in data.slots,'edge slot missing '+e.id);
      if(e.recommendedByMeal)for(const id of data.choices)assert(modeType[e.recommendedByMeal[id]],'invalid recommended mode '+e.id+'/'+id);
      else assert(modeType[e.defaultMode],'missing default mode '+e.id);
    }
    const routes=new Set();
    for(const r of data.routeEvidence||[]){
      assert(keys.has(r.fromKey)&&keys.has(r.toKey)&&modeType[r.mode],'route endpoint or mode invalid');
      const key=routeKey(r.fromKey,r.toKey,r.mode);
      assert(!routes.has(key),'duplicate route evidence '+key);
      routes.add(key);
      assert(r.source&&r.checkedAt&&r.scope,'route provenance missing '+key);
      if(r.distanceM!=null||r.durationMin!=null)assert(r.distanceM>0&&r.durationMin>0,'partial route measure '+key);
      if(r.screenshot){
        const s=r.screenshot;
        assert(typeof s.path==='string'&&/^assets\//.test(s.path)&&!s.path.split('/').includes('..')&&/^https:\/\//.test(s.source||'')&&/^\d{4}-\d{2}-\d{2}$/.test(s.checkedAt||'')&&s.reviewed===true,'route screenshot provenance missing '+key);
      }
    }
    return data;
  }
  function placeLink(place){
    if(place.poi)return 'https://www.amap.com/ssr/search/poi_detail?id='+encodeURIComponent(place.poi);
    const q=new URLSearchParams({position:place.lon+','+place.lat,name:place.name,coordinate:'gaode',src:'xiaocai-trip',callnative:'0'});
    return 'https://uri.amap.com/marker?'+q.toString();
  }
  function routeLink(from,to,mode){
    assert(modeType[mode],'unsupported route mode '+mode);
    // The legacy PC /ssr/dir `type=3` falls back to car. Amap's documented
    // navigation URI is the supported mobile handoff for riding routes.
    if(mode==='cycling'){
      const q=new URLSearchParams({
        from:from.lon+','+from.lat+','+from.name,
        to:to.lon+','+to.lat+','+to.name,
        mode:'ride',src:'xiaocai-trip',callnative:'1'
      });
      return 'https://uri.amap.com/navigation?'+q.toString();
    }
    const q=new URLSearchParams({
      dname:to.name,dlat:String(to.lat),dlon:String(to.lon),
      fname:from.name,flat:String(from.lat),flon:String(from.lon),
      type:modeType[mode]
    });
    if(to.poi)q.set('did',to.poi);
    if(from.poi)q.set('fid',from.poi);
    return 'https://www.amap.com/ssr/dir?'+q.toString();
  }
  function resolve(data,selection,edgeId,mode){
    const edge=data.edges.find(e=>e.id===edgeId);
    assert(edge,'unknown edge '+edgeId);
    const from=data.places[selection[edge.from]],to=data.places[selection[edge.to]];
    assert(from&&to,'selected endpoint missing '+edgeId);
    const pickedMode=mode||(edge.recommendedByMeal?edge.recommendedByMeal[selection.meal]:edge.defaultMode);
    assert(modeType[pickedMode],'invalid mode '+pickedMode);
    const key=routeKey(from.key,to.key,pickedMode);
    const evidence=(data.routeEvidence||[]).find(r=>routeKey(r.fromKey,r.toKey,r.mode)===key)||null;
    return {id:edge.id,from,to,mode:pickedMode,key,evidence,routeUrl:routeLink(from,to,pickedMode),destinationUrl:placeLink(to)};
  }
  function activeEdges(data,selection){
    const direct=selection.sight==='shangdang';
    return data.edges.filter(e=>direct?!['sight-gate','gate-museum'].includes(e.id):e.id!=='sight-museum');
  }
  return {validate,routeKey,placeLink,routeLink,resolve,activeEdges,mapGeometry,modeType};
});
